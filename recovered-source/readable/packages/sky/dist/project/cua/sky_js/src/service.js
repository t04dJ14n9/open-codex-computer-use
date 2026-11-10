import { __awaiter as e } from "../../../../lib/js/oai_js/node_modules/tslib/tslib.es6.js";
import { UnreachableCaseError as t } from "../../../../lib/js/oai_js_core/src/UnreachableCaseError.js";
import { create_client as r } from "./create_client.js";
import { load_options as o } from "./load_options.js";
import { require_audio_model_support as n } from "./require_audio_model_support.js";
let i;
const s = new Map();
function a(a) {
  return e(this, void 0, void 0, function* () {
    var l;
    if (null == i) {
      const e = o();
      i = r(e);
    }
    switch (a.type) {
      case "setup": {
        const e = i,
          t = Object.keys(e).filter(
            (t) => "function" == typeof Reflect.get(e, t),
          );
        return { target: e.target, methods: t };
      }
      case "execute":
        return (function (t, r) {
          return e(this, void 0, void 0, function* () {
            const e = Object.getOwnPropertyDescriptor(t, r.method),
              o = null == e ? void 0 : e.value;
            if ("function" != typeof o)
              throw new Error(
                `Sky runtime method is not available: ${r.method}`,
              );
            if ("start_audio_recording" === r.method) {
              const e = globalThis.nodeRepl;
              n({
                model_allowlist: process.env.SKY_AUDIO_MODEL_ALLOWLIST,
                request_meta: null == e ? void 0 : e.requestMeta,
              });
            }
            const i = yield o.call(t, ...r.args);
            if ("get_screenshot" === r.method) {
              return i.map(d);
            }
            if ("get_window_state" === r.method && "linux" === t.target) {
              const e = i;
              return Object.assign(Object.assign({}, e), {
                screenshots: e.screenshots.map(d),
              });
            }
            if ("stop_audio_recording" === r.method) {
              return d(i);
            }
            return i;
          });
        })(i, a);
      case "drag_start": {
        if ("linux" !== i.target)
          throw new Error("Sky drag handles require the Linux runtime");
        const e =
          null !== (l = s.get(a.handle_id)) && void 0 !== l
            ? l
            : i.drag_handle();
        return (yield e.start(a.point), void s.set(a.handle_id, e));
      }
      case "drag_move": {
        const e = s.get(a.handle_id);
        if (null == e) throw new Error("Sky drag handle has not been started");
        return e.move_to(a.point);
      }
      case "drag_end": {
        const e = s.get(a.handle_id);
        if (null == e) throw new Error("Sky drag handle has not been started");
        return (yield e.end(), void s.delete(a.handle_id));
      }
      default:
        throw new t(a);
    }
  });
}
function d(e) {
  return { filepath: e.filepath, data_url: e.data_url };
}
export { a as handleRpc };
