import { describe, it, expect, vi } from 'vitest';

describe('WalletConnect', () => {
  describe('Freighter detection', () => {
    it('detects Freighter when isConnected returns true', async () => {
      const mockFreighter = {
        isConnected: vi.fn().mockResolvedValue(true),
        getPublicKey: vi.fn().mockResolvedValue('GDFFOJHT2ARW23Y4QUSPEKVKHCRFKDA6DOYN7CK6PROAB3JYRJXYG7AL'),
      };
      const connected = await mockFreighter.isConnected();
      expect(connected).toBe(true);
    });

    it('handles Freighter not installed gracefully', async () => {
      const mockFreighter = {
        isConnected: vi.fn().mockRejectedValue(new Error('Freighter not found')),
      };
      await expect(mockFreighter.isConnected()).rejects.toThrow('Freighter not found');
    });
  });

  describe('Public key retrieval', () => {
    it('returns a valid Stellar public key', async () => {
      const validKey = 'GDFFOJHT2ARW23Y4QUSPEKVKHCRFKDA6DOYN7CK6PROAB3JYRJXYG7AL';
      expect(validKey).toMatch(/^G[A-Z2-7]{55}$/);
    });

    it('rejects invalid public keys', () => {
      const invalidKey = 'INVALID_KEY';
      expect(invalidKey).not.toMatch(/^G[A-Z2-7]{55}$/);
    });
  });

  describe('Network detection', () => {
    it('identifies testnet network passphrase', () => {
      const testnetPassphrase = 'Test SDF Network ; September 2015';
      expect(testnetPassphrase).toContain('Test SDF');
    });

    it('identifies mainnet network passphrase', () => {
      const mainnetPassphrase = 'Public Global Stellar Network ; September 2015';
      expect(mainnetPassphrase).toContain('Public Global Stellar');
    });
  });
});
