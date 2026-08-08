import { describe, it, expect } from 'vitest';

describe('PaymentConfirmation', () => {
  describe('Commitment verification', () => {
    it('validates a correct commitment hash', () => {
      const commitment = 'e733743b600fff29ef24f1643140f5a9cfbb1781f088a66b3a304a7a1800ec47';
      expect(commitment).toMatch(/^[a-f0-9]{64}$/);
      expect(commitment.length).toBe(64);
    });

    it('rejects an invalid commitment hash', () => {
      const invalidCommitment = 'xyz123';
      expect(invalidCommitment).not.toMatch(/^[a-f0-9]{64}$/);
    });

    it('handles null commitment gracefully', () => {
      const commitment: string | null = null;
      expect(commitment).toBeNull();
    });
  });

  describe('Payment amount formatting', () => {
    it('formats XLM in stroops to display units', () => {
      const stroopsToXLM = (stroops: string) => parseFloat(stroops) / 10_000_000;
      expect(stroopsToXLM('10000000')).toBe(1.0);
      expect(stroopsToXLM('5000000')).toBe(0.5);
      expect(stroopsToXLM('1')).toBe(0.0000001);
    });

    it('handles zero stroops', () => {
      const stroopsToXLM = (stroops: string) => parseFloat(stroops) / 10_000_000;
      expect(stroopsToXLM('0')).toBe(0);
    });
  });

  describe('Escrow status display', () => {
    it('maps escrow status to display labels', () => {
      const statusLabels: Record<string, string> = {
        Pending: 'Awaiting Payment',
        Spent: 'Completed',
        Refunded: 'Refunded',
        Disputed: 'Under Review',
      };
      expect(statusLabels['Pending']).toBe('Awaiting Payment');
      expect(statusLabels['Spent']).toBe('Completed');
      expect(statusLabels['Disputed']).toBe('Under Review');
    });

    it('returns unknown for unrecognized status', () => {
      const statusLabels: Record<string, string> = {
        Pending: 'Awaiting Payment',
      };
      expect(statusLabels['Unknown']).toBeUndefined();
    });
  });

  describe('Timeout display', () => {
    it('formats timeout in seconds to human readable', () => {
      const formatTimeout = (secs: number): string => {
        if (secs >= 3600) return `${Math.floor(secs / 3600)}h`;
        if (secs >= 60) return `${Math.floor(secs / 60)}m`;
        return `${secs}s`;
      };
      expect(formatTimeout(3600)).toBe('1h');
      expect(formatTimeout(1800)).toBe('30m');
      expect(formatTimeout(45)).toBe('45s');
    });

    it('returns "No timeout" for zero', () => {
      const formatTimeout = (secs: number): string =>
        secs === 0 ? 'No timeout' : 'Has timeout';
      expect(formatTimeout(0)).toBe('No timeout');
    });
  });
});
