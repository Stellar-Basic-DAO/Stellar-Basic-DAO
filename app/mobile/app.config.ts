import appJson from "./app.json";

const defaultEnvironment = process.env.CI ? "production" : "dev";
const appEnv = process.env.APP_ENV ?? defaultEnvironment;
const stellarNetwork =
  process.env.STELLAR_NETWORK ??
  (appEnv === "production" ? "mainnet" : "testnet");
const buildNumber =
  process.env.BUILD_NUMBER ?? process.env.GITHUB_RUN_NUMBER ?? "1";
const androidVersionCode = Number(
  process.env.ANDROID_VERSION_CODE ?? buildNumber,
);
const buildTag = process.env.GIT_TAG ?? process.env.GITHUB_REF_NAME ?? "";

function appName(env: string): string {
  switch (env) {
    case "production":
      return "RustAcademy";
    case "staging":
      return "Stellar Basic DAO Staging";
    default:
      return "Stellar Basic DAO Dev";
  }
}

function bundleIdentifier(env: string): string {
  switch (env) {
    case "production":
      return "to.stellar-basic-dao.app";
    case "staging":
      return "to.stellar-basic-dao.app.staging";
    default:
      return "to.stellar-basic-dao.app.dev";
  }
}

function androidPackage(env: string): string {
  switch (env) {
    case "production":
      return "to.stellar_basic_dao.app";
    case "staging":
      return "to.stellar_basic_dao.app.staging";
    default:
      return "to.stellar_basic_dao.app.dev";
  }
}

function apiUrl(env: string): string {
  switch (env) {
    case "production":
      return "https://api.stellar-basic-dao.to";
    case "staging":
      return "https://staging-api.stellar-basic-dao.to";
    default:
      return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  }
}

const expoJson: Record<string, any> = appJson.expo || {};

export default ({ config }: { config: any }) => ({
  ...appJson,
  expo: {
    ...expoJson,
    name: appName(appEnv),
    extra: {
      ...(expoJson.extra || {}),
      apiUrl: apiUrl(appEnv),
      environment: appEnv,
      stellarNetwork,
      buildNumber,
      buildTag,
      appVersion: expoJson.version || "1.0.0",
    },
    ios: {
      ...(expoJson.ios || {}),
      bundleIdentifier: bundleIdentifier(appEnv),
      buildNumber,
      infoPlist: {
        ...((expoJson.ios && expoJson.ios.infoPlist) || {}),
      },
    },
    android: {
      ...(expoJson.android || {}),
      package: androidPackage(appEnv),
      versionCode: androidVersionCode,
      intentFilters: (expoJson.android && expoJson.android.intentFilters) || [],
    },
  },
});
