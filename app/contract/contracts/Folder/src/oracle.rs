//! Oracle integration for dynamic fee pricing.
//!
//! Queries external oracle contracts for USD-denominated asset prices
//! and returns price feeds that the fee module uses for dynamic fee
//! calculations. Falls back to static basis-point fees when the oracle
//! is unavailable or returns stale data.
//!
//! ## Oracle Contract Interface
//!
//! The oracle contract is expected to expose the following read-only function:
//!
//! ```text
//! fn lastprice(base: Address) -> (u128, u64)
//! ```
//!
//! Where:
//! - `base` is the asset to query (e.g., XLM address)
//! - Returns `(price_micros, timestamp)` where price is in micro-units
//!   (1 USD = 1_000_000 micro-units) and timestamp is a ledger timestamp.
//!
//! If the oracle contract uses a different interface, this module can be
//! adapted by updating the `call_oracle` function below.

use crate::{storage, types::OracleFeeConfig};
use soroban_sdk::{Address, Env, Symbol, Val, Vec};

/// Symbol for the oracle's price query function.
const ORACLE_FN_LASTPRICE: &str = "lastprice";

/// Get the configured oracle fee configuration, if any.
pub fn get_oracle_fee_config(env: &Env) -> Option<OracleFeeConfig> {
    storage::get_oracle_fee_config(env)
}

/// Fetch the current price and timestamp from an external oracle contract.
///
/// Calls `oracle.lastprice(asset)` to retrieve the current USD price of
/// the base asset. The oracle is expected to return `(u128, u64)` where
/// the first value is the price in micro-units (1 USD = 1_000_000) and
/// the second is the ledger timestamp of the price update.
///
/// # Fallback behavior
///
/// Returns `None` when:
/// - No oracle is configured (oracle address is missing from storage)
/// - The oracle contract is not deployed at the given address
/// - The oracle contract's interface does not match expectations
/// - The oracle call fails or panics
///
/// # Price format
///
/// The returned price is in **micro-units** (e.g., an XLM price of $0.10
/// USD is returned as 100_000, meaning 100_000 microdollars per XLM).
/// The fee module uses this to compute dynamic fees by converting the
/// configured `usd_fee_micros` into token units.
///
/// # Staleness
///
/// Callers MUST check the returned timestamp against
/// `OracleFeeConfig::stale_threshold_secs` before using the price.
/// This module returns the raw values; the fee module performs the
/// staleness check.
pub fn fetch_price(env: &Env, oracle: &Address) -> Option<(i128, u64)> {
    // Build the contract call arguments: vec![asset_address]
    let asset = env.current_contract_address();
    let mut args = Vec::new(env);
    args.push_back(Val::from(asset));

    // Attempt cross-contract call to oracle.lastprice(asset)
    let result: Result<(u128, u64), _> = env.try_invoke_contract(
        oracle,
        &Symbol::new(env, ORACLE_FN_LASTPRICE),
        args,
    );

    match result {
        Ok((price, timestamp)) => {
            // Convert u128 price to i128 to match fee calculation types.
            // Negative prices are invalid, but the oracle returns u128 so
            // this is purely a type conversion.
            Some((price as i128, timestamp))
        }
        Err(_) => {
            // Oracle unavailable — caller should fall back to static fees.
            None
        }
    }
}

/// Fetch the XLM/USD price from the configured oracle.
///
/// Convenience wrapper around `fetch_price` that uses the configured
/// oracle address from storage.
pub fn fetch_xlm_price(env: &Env) -> Option<(i128, u64)> {
    let config = storage::get_oracle_fee_config(env)?;
    fetch_price(env, &config.oracle)
}

/// Check if a price feed is fresh enough to use.
///
/// Returns `true` if the price timestamp is within the configured
/// staleness threshold. Returns `false` (stale or unavailable) otherwise.
pub fn is_price_fresh(env: &Env, timestamp: u64) -> bool {
    let config = match storage::get_oracle_fee_config(env) {
        Some(c) => c,
        None => return false,
    };
    let now = env.ledger().timestamp();
    now.saturating_sub(timestamp) <= config.stale_threshold_secs
}
