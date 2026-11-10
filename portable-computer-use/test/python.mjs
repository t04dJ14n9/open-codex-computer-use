// Shared Python interpreter resolution for cross-platform tests.
import { spawnSync } from "node:child_process";

export function pythonCommand() {
  const candidates = [process.env.COMPUTER_USE_PYTHON, "python3", "python", "py"].filter(Boolean);
  for (const candidate of candidates) {
    try {
      if (spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0) return candidate;
    } catch { /* try next */ }
  }
  throw new Error("Python 3 is required for cross-platform tests (set COMPUTER_USE_PYTHON)");
}
