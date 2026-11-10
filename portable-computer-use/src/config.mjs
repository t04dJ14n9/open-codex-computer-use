import { existsSync } from "node:fs";
import {
  root,
  helperCandidates,
  helperPath,
  helperApp,
  backendStatus,
  platformInfo,
} from "./backend.mjs";

export { root, helperCandidates, helperPath, helperApp, backendStatus };

// The helper is the only platform-specific piece; helper discovery lives in
// backend.mjs. No product host, signed Node binary, IPC socket or third-party
// runtime is consulted.
export function runtimeStatus() {
  const info = platformInfo();
  return {
    platform: info.platform,
    architecture: process.arch,
    node: process.execPath,
    nodeVersion: process.versions.node,
    skillRoot: root,
    helper: info.helper,
    helperApp: info.helperApp,
    helperPresent: info.helperPresent,
    backend: "standalone",
    nativeBackend: info.nativeBackend,
    backendStatus: info.backendStatus,
    sessionType: info.sessionType,
    platformDefaults: info.platformDefaults,
    inputMode: info.backendStatus === "ready" && info.platform === "darwin"
      ? "background-only"
      : "platform-dependent",
    globalInput: false,
    productHostRequired: false,
    externalRuntimeRequired: false,
    portingResearch: info.portingResearch,
  };
}
