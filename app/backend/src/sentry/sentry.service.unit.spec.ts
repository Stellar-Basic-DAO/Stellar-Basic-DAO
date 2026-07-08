import { Test, TestingModule } from '@nestjs/testing';

import { SentryService } from './sentry.service';

// Mock @sentry/node before any imports use it
const mockGetClient = jest.fn();
const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetUser = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockSetTag = jest.fn();
const mockSetExtra = jest.fn();

jest.mock('@sentry/node', () => ({
  getClient: (...args: unknown[]) => mockGetClient(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
  setUser: (...args: unknown[]) => mockSetUser(...args),
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  setTag: (...args: unknown[]) => mockSetTag(...args),
  setExtra: (...args: unknown[]) => mockSetExtra(...args),
}));

describe('SentryService', () => {
  let service: SentryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SentryService],
    }).compile();

    service = module.get<SentryService>(SentryService);
  });

  it('reports enabled when a Sentry client exists', () => {
    mockGetClient.mockReturnValue({} as never);
    expect(service.isEnabled).toBe(true);
  });

  it('reports disabled when no Sentry client exists', () => {
    mockGetClient.mockReturnValue(undefined as never);
    expect(service.isEnabled).toBe(false);
  });

  it('captures exceptions when enabled', () => {
    mockGetClient.mockReturnValue({} as never);
    mockCaptureException.mockReturnValue('event-1' as never);

    const error = new Error('boom');
    const result = service.captureException(error, { orderId: '123' });

    expect(mockCaptureException).toHaveBeenCalledWith(error, expect.any(Function));
    expect(result).toBe('event-1');
  });

  it('returns undefined for exception capture when disabled', () => {
    mockGetClient.mockReturnValue(undefined as never);

    const result = service.captureException(new Error('boom'));

    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('captures messages when enabled', () => {
    mockGetClient.mockReturnValue({} as never);
    mockCaptureMessage.mockReturnValue('event-2' as never);

    const result = service.captureMessage('Horizon API down', 'fatal', {
      endpoint: 'https://horizon.stellar.org',
    });

    expect(mockCaptureMessage).toHaveBeenCalledWith(
      'Horizon API down',
      expect.any(Function),
    );
    expect(result).toBe('event-2');
  });

  it('returns undefined for message capture when disabled', () => {
    mockGetClient.mockReturnValue(undefined as never);

    const result = service.captureMessage('test');

    expect(mockCaptureMessage).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('sets and clears user context', () => {
    service.setUser({ id: 'user-1', username: 'alice', wallet: 'GAB...XYZ' });
    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'user-1',
      username: 'alice',
      wallet: 'GAB...XYZ',
    });

    service.clearUser();
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });

  it('adds breadcrumbs and extra context', () => {
    service.addBreadcrumb({
      category: 'stellar',
      message: 'Payment submitted',
      data: { txHash: 'abc123' },
    });
    service.setTag('network', 'testnet');
    service.setExtra('contractId', 'C123');

    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'stellar',
        message: 'Payment submitted',
        level: 'info',
      }),
    );
    expect(mockSetTag).toHaveBeenCalledWith('network', 'testnet');
    expect(mockSetExtra).toHaveBeenCalledWith('contractId', 'C123');
  });
});
