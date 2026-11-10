import {
  __awaiter as e,
  __classPrivateFieldGet as t,
  __classPrivateFieldSet as n,
} from "../../../../../../lib/js/oai_js/node_modules/tslib/tslib.es6.js";
import { Buffer as r } from "node:buffer";
import { randomUUID as o } from "node:crypto";
import * as i from "node:fs";
import { homedir as s } from "node:os";
import c from "node:path";
import {
  SkyComputerUseTransportError as u,
  SkyComputerUseError as a,
  ServerErrorCode as l,
} from "./errors.js";
var f, p, d, h, m, v, y, w, S, C, g, k;
const E = 8388608,
  U = 5e3;
class P {
  static create(t) {
    return e(this, void 0, void 0, function* () {
      const n = A().nativePipe;
      if (null == n || "function" != typeof n.createConnection)
        throw new u("Sky Computer Use native pipe is unavailable");
      const r =
        null !==
          (a = R(
            null === (o = A().env) || void 0 === o
              ? void 0
              : o.SKY_CUA_SERVICE_NATIVE_PIPE_PATH,
          )) && void 0 !== a
          ? a
          : c.join(
              s(),
              "Library",
              "Group Containers",
              "2DC432GLL2.com.openai.sky.CUAService",
              "IPC",
              "computeruse.sock",
            );
      var o, a;
      try {
        return yield this.connect(n.createConnection, r, t, 250);
      } catch (o) {
        if (!(o instanceof D)) throw o;
        try {
          yield (function (t) {
            return e(this, void 0, void 0, function* () {
              var e, n;
              if (
                null !=
                R(
                  null === (e = t.env) || void 0 === e
                    ? void 0
                    : e.NODE_REPL_HOST_SERVICES_PIPE_PATH,
                )
              )
                return void (yield O("ensureService", {
                  service: "computer-use",
                }));
              const r =
                null === (n = t.launchServices) || void 0 === n
                  ? void 0
                  : n.openApplication;
              if ("function" != typeof r)
                throw new Error(
                  "Sky Computer Use requires nodeRepl.launchServices support",
                );
              yield r(
                (function (e) {
                  const t = R(null == e ? void 0 : e.SKY_CUA_SERVICE_PATH);
                  if (null != t) return { applicationPath: t };
                  const n = R(null == e ? void 0 : e.CODEX_HOME);
                  if (null != n) {
                    const e = c.join(
                      n,
                      "computer-use",
                      "Codex Computer Use.app",
                    );
                    if (i.existsSync(e)) return { applicationPath: e };
                  }
                  return { bundleIdentifier: "com.openai.sky.CUAService" };
                })(t.env),
              );
            });
          })(A());
        } catch (e) {
          throw new u("Sky Computer Use service startup request failed", {
            cause: e,
          });
        }
        try {
          return yield this.connect(n.createConnection, r, t, 5e3);
        } catch (e) {
          throw new u("Sky Computer Use native pipe startup failed", {
            cause: e,
          });
        }
      }
    });
  }
  static connect(n, r, o, i) {
    return e(this, void 0, void 0, function* () {
      const e = Date.now() + i;
      let s;
      for (;;) {
        const i = e - Date.now();
        if (i <= 0) throw new D(s);
        let c;
        const u = n(r);
        try {
          c = yield q(
            u,
            i,
            "Sky Computer Use native pipe connection timed out",
          );
        } catch (e) {
          (u.then(
            (e) => e.end(),
            () => {},
          ),
            (s = e));
        }
        if (null != c) {
          const n = new P(c, o);
          try {
            return (
              yield n.ping(Math.min(1e3, Math.max(1, e - Date.now()))),
              n
            );
          } catch (e) {
            if (
              (t(n, f, "m", k).call(n),
              e instanceof N ||
                (e instanceof a && e.code === l.incompatibleClientVersion))
            )
              throw e;
            s = e;
          }
        }
        if (Date.now() >= e) throw new D(s);
        yield M(100);
      }
    });
  }
  constructor(e, o) {
    (f.add(this),
      p.set(this, void 0),
      d.set(this, 1),
      h.set(this, r.alloc(0)),
      m.set(this, new Map()),
      v.set(this, Promise.resolve()),
      y.set(this, void 0),
      n(this, p, o, "f"),
      n(this, y, e, "f"),
      e.on("data", (n) => {
        try {
          t(this, f, "m", S).call(this, n);
        } catch (n) {
          (t(this, f, "m", g).call(this, I(n)), e.end());
        }
      }),
      e.on("error", (e) => t(this, f, "m", g).call(this, e)),
      e.on("close", () =>
        t(this, f, "m", g).call(
          this,
          new Error("Sky Computer Use native pipe closed before response"),
        ),
      ));
  }
  get isClosed() {
    return null == t(this, y, "f");
  }
  request(r) {
    return e(this, void 0, void 0, function* () {
      const e = 1e3 * r.timeoutSeconds,
        o = t(this, v, "f").then(() =>
          t(this, f, "m", w).call(
            this,
            "request",
            {
              clientApiVersion: t(this, p, "f"),
              codexTurnMetadata: T(r.codexMetadata),
              deadlineUnixMilliseconds: Date.now() + e,
              request: r.request,
              requestType: r.requestType,
            },
            e,
          ),
        );
      return (
        n(
          this,
          v,
          o.then(
            () => {},
            () => {},
          ),
          "f",
        ),
        yield o
      );
    });
  }
  ping(n) {
    return e(this, void 0, void 0, function* () {
      const e = yield t(this, f, "m", w).call(
        this,
        "ping",
        { clientApiVersion: t(this, p, "f") },
        n,
      );
      if (e.serverApiVersion !== t(this, p, "f"))
        throw new N(
          `Sky Computer Use API version mismatch: client=${t(this, p, "f")} server=${String(e.serverApiVersion)}`,
        );
    });
  }
}
function b(e) {
  const t = [];
  let n = 0;
  for (; e.length - n >= 4;) {
    const r = e.readUInt32LE(n);
    if (r > E)
      throw new u(`Sky Computer Use native pipe frame is too large: ${r}`);
    const o = 4 + r;
    if (e.length - n < o) break;
    (t.push(e.subarray(n + 4, n + o).toString("utf8")), (n += o));
  }
  return { messages: t, remainingData: e.subarray(n) };
}
function j(e) {
  const t = r.from(e, "utf8");
  if (t.length > E)
    throw new u(`Sky Computer Use native pipe frame is too large: ${t.length}`);
  const n = r.alloc(4 + t.length);
  return (n.writeUInt32LE(t.length, 0), t.copy(n, 4), n);
}
function T(e) {
  return null == e || ("object" == typeof e && !ArrayBuffer.isView(e))
    ? e
    : JSON.parse(r.from(e).toString("utf8"));
}
function _(e) {
  if (
    "object" != typeof e ||
    null == e ||
    !("id" in e) ||
    "number" != typeof e.id ||
    !("jsonrpc" in e) ||
    "2.0" !== e.jsonrpc
  )
    throw new u("Sky Computer Use returned an invalid JSON-RPC response");
  const t = Object.prototype.hasOwnProperty.call(e, "result");
  if (t === Object.prototype.hasOwnProperty.call(e, "error"))
    throw new u("Sky Computer Use returned an invalid JSON-RPC response");
  if (t) return { id: e.id, jsonrpc: "2.0", result: Reflect.get(e, "result") };
  const n = Reflect.get(e, "error");
  if (
    "object" != typeof n ||
    null == n ||
    !("code" in n) ||
    "number" != typeof n.code ||
    !("message" in n) ||
    "string" != typeof n.message
  )
    throw new u("Sky Computer Use returned an invalid JSON-RPC response");
  return {
    error: { code: n.code, message: n.message },
    id: e.id,
    jsonrpc: "2.0",
  };
}
function A() {
  const e = globalThis.nodeRepl;
  if (null == e)
    throw new u("Sky Computer Use requires the trusted nodeRepl runtime");
  return e;
}
function O(t, n) {
  return e(this, void 0, void 0, function* () {
    var e, i;
    const s = A(),
      c = R(
        null === (e = s.env) || void 0 === e
          ? void 0
          : e.NODE_REPL_HOST_SERVICES_PIPE_PATH,
      );
    if (null == c) throw new Error("Computer Use desktop host is unavailable");
    const u =
      null === (i = s.nativePipe) || void 0 === i ? void 0 : i.createConnection;
    if ("function" != typeof u)
      throw new Error("Sky Computer Use requires nodeRepl.nativePipe support");
    const a = u(c);
    let l;
    try {
      l = yield q(a, 5e3, "Sky Computer Use host service connection timed out");
    } catch (e) {
      throw (
        a.then(
          (e) => e.end(),
          () => {},
        ),
        e
      );
    }
    try {
      yield (function (e, t, n) {
        return new Promise((i, s) => {
          const c = "ensureService" === t ? 0 : o();
          let u = r.alloc(0),
            a = !1;
          const l = (e) =>
              "attachComputerAudio" === t
                ? new Error(
                    "Computer audio attachment status is unknown. It may still arrive; do not retry this recording.",
                    { cause: e },
                  )
                : e,
            f = setTimeout(
              () =>
                p(
                  l(
                    new Error(
                      "ensureService" === t
                        ? "Sky Computer Use host service ensure timed out"
                        : "Sky Computer Use host service response timed out",
                    ),
                  ),
                ),
              "attachComputerAudio" === t ? 6e4 : U,
            ),
            p = (t) => {
              a ||
                ((a = !0),
                clearTimeout(f),
                e.off("data", d),
                e.off("error", h),
                e.off("close", m),
                null == t ? i() : s(t));
            },
            d = (e) => {
              try {
                u = r.concat([u, r.from(e)]);
                const t = b(u);
                u = t.remainingData;
                for (const e of t.messages) {
                  const t = JSON.parse(e);
                  if (
                    "object" == typeof t &&
                    null != t &&
                    "id" in t &&
                    t.id === c
                  )
                    if ("error" in t) {
                      const e = t.error,
                        n =
                          "object" == typeof e &&
                          null != e &&
                          "message" in e &&
                          "string" == typeof e.message
                            ? e.message
                            : "Sky Computer Use host service ensure failed";
                      p(new Error(n));
                    } else
                      "result" in t
                        ? p()
                        : p(
                            l(
                              new Error(
                                "Sky Computer Use host service returned an invalid response",
                              ),
                            ),
                          );
                }
              } catch (e) {
                p(l(I(e)));
              }
            },
            h = (e) => p(l(e)),
            m = () =>
              p(
                l(
                  new Error(
                    "Sky Computer Use host service connection closed before response",
                  ),
                ),
              );
          (e.on("data", d), e.on("error", h), e.on("close", m));
          try {
            e.write(
              j(
                JSON.stringify({ id: c, jsonrpc: "2.0", method: t, params: n }),
              ),
            );
          } catch (e) {
            p(l(I(e)));
          }
        });
      })(l, t, n);
    } finally {
      l.end();
    }
  });
}
function R(e) {
  return "string" == typeof e && "" !== e.trim() ? e.trim() : void 0;
}
function I(e) {
  return e instanceof Error ? e : new Error(String(e));
}
function M(e) {
  return new Promise((t) => setTimeout(t, e));
}
function q(t, n, r) {
  return e(this, void 0, void 0, function* () {
    let e;
    try {
      return yield Promise.race([
        t,
        new Promise((t, o) => {
          e = setTimeout(() => o(new Error(r)), n);
        }),
      ]);
    } finally {
      null != e && clearTimeout(e);
    }
  });
}
((p = new WeakMap()),
  (d = new WeakMap()),
  (h = new WeakMap()),
  (m = new WeakMap()),
  (v = new WeakMap()),
  (y = new WeakMap()),
  (f = new WeakSet()),
  (w = function (e, r, o) {
    var i, s;
    const c = t(this, y, "f");
    if (null == c) throw new u("Sky Computer Use native pipe is closed");
    const a = (n(this, d, ((s = t(this, d, "f")), (i = s++), s), "f"), i);
    return new Promise((n, i) => {
      t(this, m, "f").set(a, {
        reject: i,
        resolve: n,
        timeout: setTimeout(() => {
          (t(this, f, "m", g).call(
            this,
            new u(`Sky Computer Use ${e} timed out`),
          ),
            c.end());
        }, o),
      });
      try {
        c.write(
          j(JSON.stringify({ id: a, jsonrpc: "2.0", method: e, params: r })),
        );
      } catch (e) {
        const n = t(this, m, "f").get(a);
        (null != n && (t(this, m, "f").delete(a), clearTimeout(n.timeout)),
          i(I(e)));
      }
    });
  }),
  (S = function (e) {
    n(this, h, r.concat([t(this, h, "f"), r.from(e)]), "f");
    const o = b(t(this, h, "f"));
    n(this, h, o.remainingData, "f");
    for (const e of o.messages) t(this, f, "m", C).call(this, _(JSON.parse(e)));
  }),
  (C = function (e) {
    const n = e.id,
      r = t(this, m, "f").get(n);
    null != r &&
      (t(this, m, "f").delete(n),
      clearTimeout(r.timeout),
      "error" in e
        ? r.reject(
            new a({
              code: e.error.code,
              message: e.error.message,
              request: null,
              requestType: "jsonRPC",
            }),
          )
        : r.resolve(e.result));
  }),
  (g = function (e) {
    if (null != t(this, y, "f")) {
      n(this, y, null, "f");
      for (const n of t(this, m, "f").values())
        (clearTimeout(n.timeout), n.reject(e));
      t(this, m, "f").clear();
    }
  }),
  (k = function () {
    const e = t(this, y, "f");
    (n(this, y, null, "f"), null == e || e.end());
  }));
class D extends Error {
  constructor(e) {
    var t;
    super(
      `Sky Computer Use native pipe is unavailable: ${((t = e), t instanceof Error ? t.message : String(t))}`,
    );
  }
}
class N extends u {}
export {
  P as MacNativePipeTransport,
  b as decodeMessageFrames,
  j as encodeMessageFrame,
  O as requestComputerUseHost,
};
