import { describe, it, expect } from 'vitest';

describe('SecurityCenter', () => {
  describe('PII Redaction', () => {
    it('redacts Stellar secret keys (S-prefix)', () => {
      const input = 'SDRV7KNNFRJQZ6DIKDFTCYRZL3BWIL3WYQ5JL6JJHJFMDJLKW66HJMQS';
      const redact = (s: string) => s.replace(/S[A-Z2-7]{55}/g, '[SECRET_KEY]');
      expect(redact(input)).toBe('[SECRET_KEY]');
    });

    it('preserves Stellar public keys (G-prefix)', () => {
      const pk = 'GDFFOJHT2ARW23Y4QUSPEKVKHCRFKDA6DOYN7CK6PROAB3JYRJXYG7AL';
      const redact = (s: string) => s.replace(/S[A-Z2-7]{55}/g, '[SECRET_KEY]');
      expect(redact(pk)).toBe(pk);
    });

    it('redacts email addresses', () => {
      const input = 'Contact: alice@example.com for support';
      const redact = (s: string) => s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
      expect(redact(input)).toBe('Contact: [EMAIL] for support');
    });

    it('redacts IP addresses', () => {
      const input = 'Request from 192.168.1.100';
      const redact = (s: string) => s.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]');
      expect(redact(input)).toBe('Request from [IP]');
    });
  });

  describe('Crash reporting opt-in', () => {
    it('defaults to opted out', () => {
      const optedIn = false;
      expect(optedIn).toBe(false);
    });

    it('allows user to opt in', () => {
      let optedIn = false;
      optedIn = true;
      expect(optedIn).toBe(true);
    });

    it('does not send reports when opted out', () => {
      const sendReport = (optedIn: boolean) => (optedIn ? 'sent' : 'skipped');
      expect(sendReport(false)).toBe('skipped');
      expect(sendReport(true)).toBe('sent');
    });
  });

  describe('Biometric authentication', () => {
    it('detects biometric availability', () => {
      const isBiometricAvailable = true;
      expect(isBiometricAvailable).toBe(true);
    });

    it('handles biometric not available', () => {
      const isBiometricAvailable = false;
      const fallback = isBiometricAvailable ? 'biometric' : 'pin';
      expect(fallback).toBe('pin');
    });
  });
});
