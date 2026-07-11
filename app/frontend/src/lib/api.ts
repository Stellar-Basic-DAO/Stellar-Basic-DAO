/**
 * Backend origin for browser calls. Override in `.env.local`:
 * `NEXT_PUBLIC_STELLAR_BASIC_DAO_API_URL=https://api.example.com`
 */
export const getStellarBasicDaoApiBase = (): string =>
  process.env.NEXT_PUBLIC_STELLAR_BASIC_DAO_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";
