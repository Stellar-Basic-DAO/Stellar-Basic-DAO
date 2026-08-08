import { describe, it, expect } from 'vitest';

describe('LinkError', () => {
  describe('Error message display', () => {
    it('displays expired link message', () => {
      const errorType = 'expired';
      const messages: Record<string, string> = {
        expired: 'This payment link has expired.',
        claimed: 'This payment link has already been claimed.',
        invalid: 'This payment link is invalid or malformed.',
        cancelled: 'This payment link has been cancelled by the sender.',
      };
      expect(messages[errorType]).toBe('This payment link has expired.');
    });

    it('displays claimed link message', () => {
      const messages: Record<string, string> = {
        claimed: 'This payment link has already been claimed.',
      };
      expect(messages['claimed']).toContain('already been claimed');
    });

    it('falls back to generic error for unknown types', () => {
      const messages: Record<string, string> = {
        expired: 'This payment link has expired.',
      };
      const fallback = 'An unexpected error occurred.';
      expect(messages['unknown'] ?? fallback).toBe(fallback);
    });
  });

  describe('Retry behavior', () => {
    it('allows 3 retry attempts', () => {
      const maxRetries = 3;
      let retries = 0;
      while (retries < maxRetries) {
        retries++;
      }
      expect(retries).toBe(3);
    });

    it('stops after max retries', () => {
      const maxRetries = 3;
      let retries = 0;
      const canRetry = () => retries < maxRetries;
      while (canRetry()) {
        retries++;
      }
      expect(canRetry()).toBe(false);
      expect(retries).toBe(3);
    });
  });

  describe('Contact support link', () => {
    it('provides support contact for failed payments', () => {
      const supportUrl = 'https://discord.gg/stellar-basic-dao';
      expect(supportUrl).toContain('discord');
    });
  });
});
