import { __awaiter as o } from "../../../oai_js/node_modules/tslib/tslib.es6.js";
function n(n) {
  var i, e;
  const r = globalThis.nodeRepl,
    t =
      null !==
        (e =
          null === (i = null == r ? void 0 : r.env) || void 0 === i
            ? void 0
            : i.TINYSKY_ALT_INITIALIZE_DOCS) && void 0 !== e
        ? e
        : "core-cua-repl",
    l = "core-cua-repl" === t;
  return {
    read: n,
    read_core: function (i) {
      return o(this, void 0, void 0, function* () {
        const e = yield n(`${t}-${i}`);
        if (!l) return e;
        const r = yield (function () {
          return o(this, void 0, void 0, function* () {
            var o;
            const i = globalThis.nodeRepl,
              e =
                null === (o = null == i ? void 0 : i.env) || void 0 === o
                  ? void 0
                  : o.CUA_REPL_BROWSER_ENV;
            if ("orbit" === e) return "";
            const r = (function (o) {
              const n = null == o ? void 0 : o["openai/confirmation_policies"],
                i =
                  "object" != typeof n || null === n || Array.isArray(n)
                    ? void 0
                    : n,
                e = null == i ? void 0 : i.computer_use;
              if (
                "string" == typeof e &&
                "" !== e.trim() &&
                new TextEncoder().encode(e).byteLength <= 2e4
              )
                return e;
              return;
            })(null == i ? void 0 : i.requestMeta);
            return void 0 !== r
              ? r
              : "training" === e
                ? ""
                : n("confirmations");
          });
        })();
        return "" === r ? e : `${e}\n${r}`;
      });
    },
    exclude_browser_confirmations: l,
  };
}
export { n as create_documentation };
