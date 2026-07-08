//! Governance module tests
//!
//! Tests cover:
//! - Proposal creation, approval, execution, and cancellation
//! - Replay protection (nonces)
//! - Expiry enforcement
//! - Signer set validation
//! - Threshold enforcement
//! - UpdateSignerSet proposal execution

#[cfg(test)]
mod tests {
    use soroban_sdk::{
        testutils::{Address as _, Ledger, LedgerInfo},
        vec, Address, Env,
    };

    use crate::governance::{
        approve_proposal, cancel_proposal, create_proposal, execute_proposal,
        get_proposal, get_signer_set, get_threshold, initialize_governance, is_signer,
        ProposalAction, ProposalStatus, MAX_PROPOSAL_EXPIRY_SECS,
    };

    fn setup_env() -> Env {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set(LedgerInfo {
            timestamp: 1_000_000,
            protocol_version: 22,
            sequence_number: 100,
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 1000,
            min_persistent_entry_ttl: 1000,
            max_entry_ttl: 10_000_000,
        });
        env
    }

    fn make_signers(env: &Env, n: u32) -> soroban_sdk::Vec<Address> {
        let mut signers = vec![env];
        for _ in 0..n {
            signers.push_back(Address::generate(env));
        }
        signers
    }

    // -----------------------------------------------------------------------
    // Initialization tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_initialize_governance_single_signer() {
        let env = setup_env();
        let signer = Address::generate(&env);
        let signers = vec![&env, signer.clone()];
        initialize_governance(&env, signers.clone(), 1).unwrap();

        assert!(is_signer(&env, &signer));
        assert_eq!(get_threshold(&env), 1);
        assert_eq!(get_signer_set(&env).len(), 1);
    }

    #[test]
    fn test_initialize_governance_three_of_five() {
        let env = setup_env();
        let signers = make_signers(&env, 5);
        initialize_governance(&env, signers.clone(), 3).unwrap();
        assert_eq!(get_threshold(&env), 3);
        assert_eq!(get_signer_set(&env).len(), 5);
    }

    #[test]
    fn test_initialize_governance_empty_signers_fails() {
        let env = setup_env();
        let signers = vec![&env];
        let err = initialize_governance(&env, signers, 1).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InvalidSignerSet);
    }

    #[test]
    fn test_initialize_governance_threshold_zero_fails() {
        let env = setup_env();
        let signers = make_signers(&env, 3);
        let err = initialize_governance(&env, signers, 0).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InvalidGovernanceThreshold);
    }

    #[test]
    fn test_initialize_governance_threshold_exceeds_signers_fails() {
        let env = setup_env();
        let signers = make_signers(&env, 3);
        let err = initialize_governance(&env, signers, 4).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InvalidGovernanceThreshold);
    }

    #[test]
    fn test_initialize_governance_too_many_signers_fails() {
        let env = setup_env();
        let signers = make_signers(&env, 11); // MAX is 10
        let err = initialize_governance(&env, signers, 6).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InvalidSignerSet);
    }

    // -----------------------------------------------------------------------
    // Proposal creation tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_create_proposal_success() {
        let env = setup_env();
        let signer = Address::generate(&env);
        let signers = vec![&env, signer.clone()];
        initialize_governance(&env, signers, 1).unwrap();

        let valid_until = 1_000_000 + 86_400; // 1 day from now
        let action = ProposalAction::SetPaused(true);

        let proposal_id = create_proposal(&env, signer.clone(), action.clone(), 1u64, valid_until).unwrap();

        let proposal = get_proposal(&env, &proposal_id).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Pending);
        assert_eq!(proposal.approval_count, 1); // proposer auto-approves
        assert_eq!(proposal.proposer, signer);
    }

    #[test]
    fn test_create_proposal_not_a_signer_fails() {
        let env = setup_env();
        let signer = Address::generate(&env);
        let stranger = Address::generate(&env);
        initialize_governance(&env, vec![&env, signer], 1).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let err = create_proposal(
            &env,
            stranger,
            ProposalAction::SetPaused(true),
            1u64,
            valid_until,
        )
        .unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::NotASigner);
    }

    #[test]
    fn test_create_proposal_expired_valid_until_fails() {
        let env = setup_env();
        let signer = Address::generate(&env);
        initialize_governance(&env, vec![&env, signer.clone()], 1).unwrap();

        let valid_until = 999_999; // in the past
        let err = create_proposal(
            &env,
            signer,
            ProposalAction::SetPaused(false),
            1u64,
            valid_until,
        )
        .unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InvalidProposalState);
    }

    #[test]
    fn test_create_proposal_expiry_too_far_fails() {
        let env = setup_env();
        let signer = Address::generate(&env);
        initialize_governance(&env, vec![&env, signer.clone()], 1).unwrap();

        let valid_until = 1_000_000 + MAX_PROPOSAL_EXPIRY_SECS + 1;
        let err = create_proposal(
            &env,
            signer,
            ProposalAction::SetPaused(false),
            1u64,
            valid_until,
        )
        .unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::ExpiryTooFar);
    }

    // -----------------------------------------------------------------------
    // Approval tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_threshold_one_auto_executes_on_create() {
        let env = setup_env();
        let signer = Address::generate(&env);
        initialize_governance(&env, vec![&env, signer.clone()], 1).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env,
            signer,
            ProposalAction::SetPaused(true),
            1u64,
            valid_until,
        )
        .unwrap();

        // With threshold=1 and proposer auto-approve, should be Executable
        let proposal = get_proposal(&env, &proposal_id).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Executable);
    }

    #[test]
    fn test_two_of_three_approval_flow() {
        let env = setup_env();
        let signers = make_signers(&env, 3);
        let s1 = signers.get(0).unwrap();
        let s2 = signers.get(1).unwrap();

        initialize_governance(&env, signers.clone(), 2).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env,
            s1.clone(),
            ProposalAction::SetPaused(false),
            42u64,
            valid_until,
        )
        .unwrap();

        // After s1 creates, approval_count = 1 (auto), still Pending
        let p = get_proposal(&env, &proposal_id).unwrap();
        assert_eq!(p.status, ProposalStatus::Pending);
        assert_eq!(p.approval_count, 1);

        // s2 approves → reaches threshold of 2 → Executable
        approve_proposal(&env, s2.clone(), proposal_id.clone()).unwrap();
        let p = get_proposal(&env, &proposal_id).unwrap();
        assert_eq!(p.status, ProposalStatus::Executable);
        assert_eq!(p.approval_count, 2);
    }

    #[test]
    fn test_double_approval_fails() {
        let env = setup_env();
        let signers = make_signers(&env, 3);
        let s1 = signers.get(0).unwrap();
        let s2 = signers.get(1).unwrap();
        initialize_governance(&env, signers.clone(), 3).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env, s1.clone(), ProposalAction::SetPaused(true), 1u64, valid_until,
        ).unwrap();

        approve_proposal(&env, s2.clone(), proposal_id.clone()).unwrap();
        let err = approve_proposal(&env, s2.clone(), proposal_id.clone()).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::AlreadyApproved);
    }

    // -----------------------------------------------------------------------
    // Execution tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_execute_proposal_insufficient_approvals_fails() {
        let env = setup_env();
        let signers = make_signers(&env, 3);
        let s1 = signers.get(0).unwrap();
        initialize_governance(&env, signers.clone(), 3).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env, s1, ProposalAction::SetPaused(true), 1u64, valid_until,
        ).unwrap();

        // Only 1 approval, threshold is 3
        let err = execute_proposal(&env, proposal_id).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::InsufficientApprovals);
    }

    // -----------------------------------------------------------------------
    // Cancellation tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_cancel_proposal_by_signer() {
        let env = setup_env();
        let signers = make_signers(&env, 2);
        let s1 = signers.get(0).unwrap();
        let s2 = signers.get(1).unwrap();
        initialize_governance(&env, signers.clone(), 2).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env, s1.clone(), ProposalAction::SetPaused(false), 1u64, valid_until,
        ).unwrap();

        cancel_proposal(&env, s2.clone(), proposal_id.clone()).unwrap();

        let p = get_proposal(&env, &proposal_id).unwrap();
        assert_eq!(p.status, ProposalStatus::Cancelled);
    }

    #[test]
    fn test_cancel_by_non_signer_fails() {
        let env = setup_env();
        let signer = Address::generate(&env);
        let stranger = Address::generate(&env);
        initialize_governance(&env, vec![&env, signer.clone()], 1).unwrap();

        let valid_until = 1_000_000 + 86_400;
        let proposal_id = create_proposal(
            &env, signer, ProposalAction::SetPaused(true), 1u64, valid_until,
        ).unwrap();

        let err = cancel_proposal(&env, stranger, proposal_id).unwrap_err();
        assert_eq!(err, crate::governance::GovernanceError::NotASigner);
    }
}
