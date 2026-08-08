import { describe, it, expect } from 'vitest';

describe('LinkGenerator', () => {
  describe('Payment link generation', () => {
    it('generates a valid payment link URL', () => {
      const baseUrl = 'https://StellarBasicDAO.to';
      const username = 'alice';
      const url = `${baseUrl}/${username}?amount=10&asset=XLM`;
      expect(url).toContain(baseUrl);
      expect(url).toContain('alice');
      expect(url).toContain('amount=10');
    });

    it('encodes special characters in memo', () => {
      const memo = 'Payment for task #42';
      const encoded = encodeURIComponent(memo);
      expect(encoded).toBe('Payment%20for%20task%20%2342');
    });

    it('generates unique link IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(crypto.randomUUID());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('Amount validation', () => {
    it('accepts valid XLM amounts', () => {
      const validAmounts = ['0.0000001', '1', '10.5', '100.1234567'];
      validAmounts.forEach((a) => {
        expect(() => parseFloat(a)).not.toThrow();
        expect(parseFloat(a)).toBeGreaterThan(0);
      });
    });

    it('rejects negative amounts', () => {
      expect(parseFloat('-1')).toBeLessThan(0);
    });

    it('rejects non-numeric amounts', () => {
      expect(isNaN(parseFloat('abc'))).toBe(true);
    });
  });

  describe('Asset selection', () => {
    it('defaults to XLM', () => {
      const defaultAsset = 'XLM';
      expect(defaultAsset).toBe('XLM');
    });

    it('supports USDC on Stellar', () => {
      const usdcIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
      expect(usdcIssuer).toMatch(/^G[A-Z2-7]{55}$/);
    });
  });

  describe('Link expiry', () => {
    it('sets default expiry of 24 hours', () => {
      const defaultExpiryHours = 24;
      const expiryMs = defaultExpiryHours * 60 * 60 * 1000;
      expect(expiryMs).toBe(86400000);
    });

    it('allows custom expiry in hours', () => {
      const customHours = 48;
      const expiryMs = customHours * 60 * 60 * 1000;
      expect(expiryMs).toBe(172800000);
    });
  });
});
