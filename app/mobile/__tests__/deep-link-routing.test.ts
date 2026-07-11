import { isStellarBasicDaoLink, parseTransactionDeepLink, resolveDeepLink } from '../utils/deep-link-routing';

describe('deep link routing', () => {
  it('recognizes Stellar Basic DAO domains and scheme URLs', () => {
    expect(isStellarBasicDaoLink('RustAcademy://transaction/12345')).toBe(true);
    expect(isStellarBasicDaoLink('https://STELLAR_BASIC_DAO.to/transaction/12345')).toBe(true);
    expect(isStellarBasicDaoLink('https://www.STELLAR_BASIC_DAO.to/jordan?amount=1.2')).toBe(true);
    expect(isStellarBasicDaoLink('https://example.com/transaction/12345')).toBe(false);
  });

  it('parses transaction deep links with query params', () => {
    const result = parseTransactionDeepLink(
      'https://www.STELLAR_BASIC_DAO.to/transaction/999?memo=hello&txHash=0xabc',
    );
    expect(result).toEqual({
      id: '999',
      params: { memo: 'hello', txHash: '0xabc' },
    });
  });

  it('resolves payment confirmation links to the payment confirmation route', () => {
    const result = resolveDeepLink('https://STELLAR_BASIC_DAO.to/jordan?amount=12.5&asset=XLM');
    expect(result).toEqual({
      route: {
        pathname: '/payment-confirmation',
        params: { username: 'jordan', amount: '12.5000000', asset: 'XLM', privacy: 'false' },
      },
    });
  });

  it('resolves transaction links to the transaction route', () => {
    const result = resolveDeepLink('RustAcademy://transaction/abc-123?status=Success&asset=XLM');
    expect(result).toEqual({
      route: {
        pathname: '/transaction/[id]',
        params: { id: 'abc-123', status: 'Success', asset: 'XLM' },
      },
    });
  });

  it('returns an error for invalid Stellar Basic DAO links', () => {
    const result = resolveDeepLink('https://STELLAR_BASIC_DAO.to/transaction/');
    expect(result).toEqual({ error: 'Unsupported or expired Stellar Basic DAO link.' });
  });

  it('returns a generic error for malformed RustAcademy://transaction links', () => {
    const result = resolveDeepLink('RustAcademy://transaction/');
    expect(result).toEqual({ error: 'Unsupported or expired Stellar Basic DAO link.' });
  });

  it('ignores unrelated URLs', () => {
    expect(resolveDeepLink('https://example.com/hello')).toEqual({ ignored: true });
  });
});
