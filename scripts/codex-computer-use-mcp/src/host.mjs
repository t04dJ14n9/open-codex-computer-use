import { KernelHost } from "./kernel-host.mjs";
import { NativeHost } from "./native-host.mjs";

export function createHost(options) {
  return process.env.CODEX_CUA_BACKEND === "codex" ? new NativeHost(options) : new KernelHost(options);
}
