// Derived readable view of exact installed @oai/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js; minified names are preserved.
var e = Object.defineProperty;
var t = (t, r) => {
  for (var a in r) e(t, a, {
    get: r[a],
    enumerable: true
  });
};
var r = "Browser Use rejected this action due to browser security policy. Reason:";
var a = "Browser Use could not complete this action because a browser security check was unavailable. Reason:";
var i = " The agent must not attempt to achieve the same outcome via workaround, indirect execution, raw CDP or browser commands, alternate browser surfaces, or policy circumvention. Proceed only with a materially safer alternative that does not require this blocked browser action; if none exists, stop and request user input.";
var s = ", but must not bypass browser security controls or use an indirect workaround.";
var n = " This browser action encountered an error. Continue through a safer or more directly authorized path. If additional authorization is clearly necessary, ask the user before proceeding.";
var o = {
  approval_cancelled: {
    decisionSource: "approval",
    message: "The permission request was dismissed before a decision was made.",
    retryable: true
  },
  approval_failed_closed: {
    decisionSource: "approval",
    message: "The permission request could not complete, so access was not granted.",
    retryable: true
  },
  approval_unavailable: {
    decisionSource: "approval",
    message: "Browser Use could not request permission.",
    retryable: true
  },
  browser_capability_blocked: {
    decisionSource: "browser",
    message: "The browser capability policy blocks this action.",
    retryable: false
  },
  browser_capability_unavailable: {
    decisionSource: "browser",
    message: "The browser capability policy could not be verified, so access was not granted.",
    retryable: true
  },
  browser_context_unavailable: {
    decisionSource: "browser",
    message: "The browser context needed for this action is unavailable.",
    retryable: true
  },
  browser_navigation_blocked: {
    decisionSource: "browser",
    message: "The browser blocked this navigation; this was not a site-status decision or a user rejection.",
    retryable: false
  },
  enterprise_policy_blocked: {
    decisionSource: "enterprise",
    message: "The admin-enforced policy blocks this action.",
    retryable: false
  },
  enterprise_policy_unavailable: {
    decisionSource: "enterprise",
    message: "The admin-enforced policy could not be verified, so access was not granted.",
    retryable: true
  },
  guardian_denied: {
    decisionSource: "guardian",
    message: "Auto-review denied this action; this was not a manual user rejection.",
    retryable: false
  },
  guardian_timed_out: {
    decisionSource: "guardian",
    message: "Auto-review timed out without an approval decision; this was not a determination that the action was unsafe. You may retry once.",
    retryable: true
  },
  navigation_url_policy_blocked: {
    decisionSource: "browser",
    message: "The browser URL policy blocks this action.",
    retryable: false
  },
  persisted_user_denied: {
    decisionSource: "user_persisted_setting",
    message: "A saved user permission setting blocks this action.",
    retryable: false
  },
  site_status_blocked: {
    decisionSource: "site_status",
    message: "The site-safety policy blocks this action; no user permission prompt or Auto-review was attempted.",
    retryable: false
  },
  site_status_unavailable: {
    decisionSource: "site_status",
    message: "The site-safety check was unavailable.",
    retryable: true
  },
  user_declined: {
    decisionSource: "user_decision",
    message: "The user declined permission for this action.",
    retryable: false
  }
};
var c = class extends Error {
  decisionSource;
  reason;
  retryable;
  constructor(e, t, n) {
    super(function (e, t) {
      let n = o[e];
      let c = `${n.message} ${t}`;
      return n.retryable ? `${a} ${c} This failure may be temporary. The agent may retry after the issue is resolved${s}` : function (e) {
        return `${r} ${e}${i}`;
      }(c);
    }(e, t), n);
    let c = o[e];
    this.name = "BrowserUseSecurityError";
    this.decisionSource = c.decisionSource;
    this.reason = e;
    this.retryable = c.retryable;
  }
};
var d = class extends Error {
  details;
  constructor(e) {
    super(function (e) {
      let t;
      switch (e.reason) {
        case "credential_delivery_in_progress":
          t = "Browser observation is unavailable while credential delivery is in progress.";
          break;
        case "credential_observation_restricted":
          t = "Browser observation is unavailable because credential protection restricts this observation.";
          break;
        case "retained_data_restricted":
          t = "Browser observation is unavailable because retained browser data remains restricted after native credential delivery.";
          break;
        case "credential_state_unavailable":
          t = "Browser observation is unavailable because native credential state cannot be safely resumed.";
          break;
        case "protected_command_failed":
          t = "Browser observation is unavailable because the browser command failed while credential protection was active. The underlying error was withheld because it may contain protected data; this does not establish a credential-policy denial.";
          break;
        case "browser_security_restricted":
        case "browser_security_unavailable":
          t = null == e.security_reason ? "A browser security check prevented this command from completing." : new c(e.security_reason, "").message;
      }
      let r = {
        retry_after_credential_delivery: "Wait for credential delivery to finish, then retry the command.",
        navigate_to_new_document: "Navigate to a new document to continue. If observation remains blocked, use Tab.requestUserTakeover() to let the user take over.",
        create_new_tab: "Select a browser by ID and create a new tab with cua.createBrowserTab(), or use Browser.tabs.new() followed by Tab.goto(), to continue on a new document.",
        request_manual_handoff: "Use Tab.requestUserTakeover() to let the user take over.",
        restart_browser_runtime: "Start a new browser runtime to continue.",
        retry_after_resolution: "Retry after the reported check is available.",
        stop: "Stop this browser action and report the failure."
      }[e.next_action];
      return `${t} ${r} Recovery v1: command=${e.command}, phase=${e.phase}, reason=${e.reason}, next_action=${e.next_action}.`;
    }(e));
    this.name = "BrowserCredentialRecoveryError";
    this.details = Object.freeze({
      schema_version: 1,
      command: e.command,
      phase: e.phase,
      reason: e.reason,
      next_action: e.next_action,
      security_reason: e.security_reason
    });
  }
};
function l(e) {
  if (null == e || "object" != typeof e) return;
  let t = e;
  if (1 !== t.schema_version || "string" != typeof t.command || !/^[a-z_]{1,64}$/.test(t.command) || "string" != typeof t.phase || !["before_command", "command", "after_command", "error_recheck"].includes(t.phase)) return;
  let r = {
    credential_delivery_in_progress: ["retry_after_credential_delivery"],
    credential_observation_restricted: ["navigate_to_new_document"],
    retained_data_restricted: ["create_new_tab", "stop"],
    credential_state_unavailable: ["restart_browser_runtime"],
    protected_command_failed: ["request_manual_handoff", "stop"],
    browser_security_restricted: ["stop"],
    browser_security_unavailable: ["retry_after_resolution"]
  };
  if ("string" != typeof t.reason || "string" != typeof t.next_action || !Object.hasOwn(r, t.reason) || !r[t.reason].includes(t.next_action)) return;
  let a = t.security_reason;
  if (t.reason.startsWith("browser_security_")) {
    if (!function (e) {
      return "string" == typeof e && Object.hasOwn(o, e);
    }(a) || new c(a, "").retryable !== ("browser_security_unavailable" === t.reason)) return;
  } else if (void 0 !== a) return;
  return {
    schema_version: 1,
    command: t.command,
    phase: t.phase,
    reason: t.reason,
    next_action: t.next_action,
    security_reason: a
  };
}
new TextEncoder();
var u = (e, t) => {
  if (!(e => Number.isInteger(e) && e > 0)(t)) return e;
  let r = t;
  if (e.length <= r) return e;
  let a = e.length - r;
  return `${e.slice(0, r)}[truncated ${a} chars]`;
};
var h = async (e, t, r) => {
  let {
    displayImage: a,
    displayValue: i
  } = e;
  let s = null;
  try {
    if (t instanceof Uint8Array) return void (await a(t));
    if (void 0 === t) s = {
      type: "value",
      value: void 0
    };else if ("function" == typeof t) s = {
      type: "function",
      value: void 0
    };else {
      let e = (e => {
        if (null === e) return null;
        if ("string" == typeof e || "boolean" == typeof e) return e;
        if ("number" == typeof e) return Number.isFinite(e) ? e : void 0;
        if (e instanceof String || e instanceof Boolean) return e.valueOf();
        if (e instanceof Number) {
          let t = e.valueOf();
          return Number.isFinite(t) ? t : void 0;
        }
      })(t);
      void 0 !== e && (s = {
        type: "value",
        value: e
      });
    }
    if (null === s) {
      let e = JSON.stringify(t);
      void 0 === e && (e = String(t));
      s = {
        type: "object",
        value: e
      };
    }
  } catch (e) {
    s = {
      type: "error",
      value: String(e)
    };
  }
  s && (await i(((e, t) => {
    switch (e.type) {
      case "function":
        return e;
      case "error":
      case "object":
        return {
          ...e,
          value: u(e.value, t)
        };
      case "value":
        return "string" != typeof e.value ? e : {
          ...e,
          value: u(e.value, t)
        };
    }
  })(s, r)));
};
function m({
  displayBridge: e,
  displayTruncateMaxChars: t
}) {
  return r => h(e, r, t);
}
var p = {};
t(p, {
  AXAPI: () => Fl,
  Agent: () => nl,
  AlertDialog: () => xh,
  AtlasCommand: () => _,
  BeforeUnloadDialog: () => kh,
  BotDetectionTabCapability: () => cu,
  Browser: () => fm,
  BrowserAuthTabCapability: () => Uu,
  BrowserManagementCommands: () => Ih,
  BrowserUser: () => ll,
  BrowserViewportCommands: () => rm,
  BrowserVisibilityCommands: () => Fh,
  Browsers: () => il,
  CUAAPI: () => Bl,
  CdpTabCapability: () => Su,
  Commands: () => b,
  ConfirmDialog: () => Sh,
  ContentAPI: () => Ul,
  Documentation: () => sl,
  DomCUAAPI: () => ql,
  FunctionAgentTransport: () => xm,
  ManagementBrowserCapability: () => Lh,
  PageAssetsTabCapability: () => mh,
  PlaywrightAPI: () => Nl,
  PlaywrightDownload: () => $l,
  PlaywrightFileChooser: () => Zl,
  PlaywrightFrameLocator: () => Ol,
  PlaywrightLocator: () => kl,
  PromptDialog: () => Th,
  Tab: () => jh,
  TabBotDetectionCommands: () => eu,
  TabBrowserAuthCommands: () => Cu,
  TabCdpCommands: () => lu,
  TabClipboardAPI: () => zl,
  TabDevAPI: () => Vl,
  TabPageAssetsCommands: () => Wu,
  TabWebMcpCapability: () => yh,
  Tabs: () => ol,
  ViewportBrowserCapability: () => pm,
  VisibilityBrowserCapability: () => em,
  botDetectionTabCapabilityDefinition: () => du,
  browserAuthTabCapabilityDefinition: () => zu,
  browserCapabilityDefinitions: () => _m,
  cdpTabCapabilityDefinition: () => Tu,
  generateRequestId: () => cl,
  hasErrorMessage: () => bl,
  isPlainObject: () => pl,
  isRegExp: () => ml,
  managementBrowserCapabilityDefinition: () => Bh,
  pageAssetsTabCapabilityDefinition: () => ph,
  tabCapabilityDefinitions: () => gh,
  toWebMcpToolDescriptor: () => _h,
  viewportBrowserCapabilityDefinition: () => bm,
  visibilityBrowserCapabilityDefinition: () => tm,
  webMcpTabCapabilityDefinition: () => fh,
  webMcpTabCapabilityInfo: () => bh
});
var b = {};
t(b, {
  AtlasCommand: () => _,
  BrowserUserClaimTab: () => ni,
  BrowserUserGetTabContext: () => ui,
  BrowserUserHistory: () => vi,
  BrowserUserOpenTabs: () => _i,
  CloseTab: () => Dr,
  CreateTab: () => Rr,
  CuaClick: () => en,
  CuaDoubleClick: () => un,
  CuaDownloadMedia: () => nn,
  CuaDrag: () => vn,
  CuaKeypress: () => _n,
  CuaMove: () => jn,
  CuaScroll: () => En,
  CuaType: () => Zn,
  DomCuaClick: () => Bn,
  DomCuaDoubleClick: () => Xn,
  DomCuaDownloadMedia: () => Kn,
  DomCuaGetVisibleDom: () => ao,
  DomCuaKeypress: () => co,
  DomCuaScroll: () => po,
  DomCuaType: () => go,
  GetBrowser: () => ir,
  GetBrowserDocumentation: () => gr,
  GetBrowserForUrl: () => Sr,
  GetDefaultBrowser: () => dr,
  GetDocumentation: () => pr,
  GetTab: () => Or,
  ListBrowsers: () => y,
  ListTabs: () => ya,
  ManualHandoff: () => Hr,
  MarkTab: () => zr,
  NameSession: () => oa,
  NavigateTab: () => La,
  NavigateTabBack: () => Va,
  NavigateTabForward: () => Ha,
  NavigateTabReload: () => ti,
  PlaywrightDomSnapshot: () => wd,
  PlaywrightDownloadPath: () => Ud,
  PlaywrightElementInfo: () => Td,
  PlaywrightElementScreenshot: () => Md,
  PlaywrightEvaluate: () => Gs,
  PlaywrightFileChooserSetFiles: () => Qd,
  PlaywrightLocatorAllTextContents: () => Ec,
  PlaywrightLocatorClick: () => So,
  PlaywrightLocatorCount: () => sc,
  PlaywrightLocatorDblclick: () => Ro,
  PlaywrightLocatorDownloadMedia: () => Oo,
  PlaywrightLocatorFill: () => Do,
  PlaywrightLocatorGetAttribute: () => Wc,
  PlaywrightLocatorInnerText: () => Bc,
  PlaywrightLocatorIsEnabled: () => jc,
  PlaywrightLocatorIsVisible: () => vc,
  PlaywrightLocatorPress: () => zo,
  PlaywrightLocatorPressSequentially: () => Go,
  PlaywrightLocatorReadAll: () => Yc,
  PlaywrightLocatorSelectOption: () => lc,
  PlaywrightLocatorSetChecked: () => _c,
  PlaywrightLocatorTextContent: () => Zc,
  PlaywrightLocatorWaitFor: () => ec,
  PlaywrightWaitForDownload: () => qd,
  PlaywrightWaitForFileChooser: () => Jd,
  PlaywrightWaitForLoadState: () => dd,
  PlaywrightWaitForTimeout: () => bd,
  PlaywrightWaitForURL: () => ad,
  RuntimeConfig: () => ra,
  SelectedTab: () => ha,
  TabAxAction: () => Ls,
  TabAxGetState: () => $s,
  TabClipboardRead: () => _s,
  TabClipboardReadText: () => ns,
  TabClipboardWrite: () => ks,
  TabClipboardWriteText: () => us,
  TabContentExport: () => zi,
  TabContentExportGSuite: () => Gi,
  TabContentExportYouTubeTranscript: () => ts,
  TabDevLogs: () => ji,
  TabGetJsDialog: () => Ai,
  TabHandleJsDialog: () => Di,
  TabScreenshot: () => Ps,
  TabsContent: () => xa,
  WebMcpInvokeTool: () => $a,
  WebMcpListTools: () => Ca
});
var _ = class {
  constructor(e, t, r) {
    this.type = e;
    this.schema = t;
    this.payload = r;
  }
  parse() {
    return this.schema.parse(this.payload);
  }
  toJSON() {
    return {
      type: this.type,
      ...this.payload
    };
  }
};
var y = {};
t(y, {
  PayloadSchema: () => er,
  ResultSchema: () => tr,
  commandType: () => rr,
  create: () => ar
});
var f;
var g;
var w;
var v = {};
t(v, {
  BRAND: () => et,
  DIRTY: () => N,
  EMPTY_PATH: () => A,
  INVALID: () => Z,
  NEVER: () => Kt,
  OK: () => q,
  ParseStatus: () => $,
  Schema: () => K,
  ZodAny: () => Te,
  ZodArray: () => Re,
  ZodBigInt: () => ge,
  ZodBoolean: () => we,
  ZodBranded: () => tt,
  ZodCatch: () => Xe,
  ZodDate: () => ve,
  ZodDefault: () => Ye,
  ZodDiscriminatedUnion: () => Oe,
  ZodEffects: () => Je,
  ZodEnum: () => Ve,
  ZodError: () => j,
  ZodFirstPartyTypeKind: () => nt,
  ZodFunction: () => Be,
  ZodIntersection: () => Ze,
  ZodIssueCode: () => S,
  ZodLazy: () => Fe,
  ZodLiteral: () => Ue,
  ZodMap: () => De,
  ZodNaN: () => Qe,
  ZodNativeEnum: () => We,
  ZodNever: () => Ie,
  ZodNull: () => Se,
  ZodNullable: () => He,
  ZodNumber: () => fe,
  ZodObject: () => Ee,
  ZodOptional: () => Ge,
  ZodParsedType: () => x,
  ZodPipeline: () => rt,
  ZodPromise: () => Ke,
  ZodReadonly: () => at,
  ZodRecord: () => qe,
  ZodSchema: () => K,
  ZodSet: () => Le,
  ZodString: () => _e,
  ZodSymbol: () => xe,
  ZodTransformer: () => Je,
  ZodTuple: () => Ne,
  ZodType: () => K,
  ZodUndefined: () => ke,
  ZodUnion: () => Ae,
  ZodUnknown: () => je,
  ZodVoid: () => Ce,
  addIssueToContext: () => M,
  any: () => ft,
  array: () => xt,
  bigint: () => ht,
  boolean: () => mt,
  coerce: () => Wt,
  custom: () => st,
  date: () => pt,
  datetimeRegex: () => he,
  defaultErrorMap: () => I,
  discriminatedUnion: () => jt,
  effect: () => qt,
  enum: () => $t,
  function: () => At,
  getErrorMap: () => P,
  getParsedType: () => k,
  instanceof: () => ct,
  intersection: () => It,
  isAborted: () => D,
  isAsync: () => F,
  isDirty: () => L,
  isValid: () => B,
  late: () => ot,
  lazy: () => Mt,
  literal: () => Ot,
  makeIssue: () => E,
  map: () => Pt,
  nan: () => ut,
  nativeEnum: () => Zt,
  never: () => wt,
  null: () => yt,
  nullable: () => Lt,
  number: () => lt,
  object: () => kt,
  objectUtil: () => w,
  oboolean: () => Vt,
  onumber: () => zt,
  optional: () => Dt,
  ostring: () => Ut,
  pipeline: () => Ft,
  preprocess: () => Bt,
  promise: () => Nt,
  quotelessJson: () => T,
  record: () => Rt,
  set: () => Et,
  setErrorMap: () => R,
  strictObject: () => St,
  string: () => dt,
  symbol: () => bt,
  transformer: () => qt,
  tuple: () => Ct,
  undefined: () => _t,
  union: () => Tt,
  unknown: () => gt,
  util: () => f,
  void: () => vt
});
(g = f || (f = {})).assertEqual = e => {};
g.assertIs = function (e) {};
g.assertNever = function (e) {
  throw new Error();
};
g.arrayToEnum = e => {
  let t = {};
  for (let r of e) t[r] = r;
  return t;
};
g.getValidEnumValues = e => {
  let t = g.objectKeys(e).filter(t => "number" != typeof e[e[t]]);
  let r = {};
  for (let a of t) r[a] = e[a];
  return g.objectValues(r);
};
g.objectValues = e => g.objectKeys(e).map(function (t) {
  return e[t];
});
g.objectKeys = "function" == typeof Object.keys ? e => Object.keys(e) : e => {
  let t = [];
  for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && t.push(r);
  return t;
};
g.find = (e, t) => {
  for (let r of e) if (t(r)) return r;
};
g.isInteger = "function" == typeof Number.isInteger ? e => Number.isInteger(e) : e => "number" == typeof e && Number.isFinite(e) && Math.floor(e) === e;
g.joinValues = function (e, t = " | ") {
  return e.map(e => "string" == typeof e ? `'${e}'` : e).join(t);
};
g.jsonStringifyReplacer = (e, t) => "bigint" == typeof t ? t.toString() : t;
(w || (w = {})).mergeShapes = (e, t) => ({
  ...e,
  ...t
});
var x = f.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]);
var k = e => {
  switch (typeof e) {
    case "undefined":
      return x.undefined;
    case "string":
      return x.string;
    case "number":
      return Number.isNaN(e) ? x.nan : x.number;
    case "boolean":
      return x.boolean;
    case "function":
      return x.function;
    case "bigint":
      return x.bigint;
    case "symbol":
      return x.symbol;
    case "object":
      return Array.isArray(e) ? x.array : null === e ? x.null : e.then && "function" == typeof e.then && e.catch && "function" == typeof e.catch ? x.promise : typeof Map < "u" && e instanceof Map ? x.map : typeof Set < "u" && e instanceof Set ? x.set : typeof Date < "u" && e instanceof Date ? x.date : x.object;
    default:
      return x.unknown;
  }
};
var S = f.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]);
var T = e => JSON.stringify(e, null, 2).replace(/"([^"]+)":/g, "$1:");
var j = class e extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super();
    this.issues = [];
    this.addIssue = e => {
      this.issues = [...this.issues, e];
    };
    this.addIssues = (e = []) => {
      this.issues = [...this.issues, ...e];
    };
    let t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t;
    this.name = "ZodError";
    this.issues = e;
  }
  format(e) {
    let t = e || function (e) {
      return e.message;
    };
    let r = {
      _errors: []
    };
    let a = e => {
      for (let i of e.issues) if ("invalid_union" === i.code) i.unionErrors.map(a);else if ("invalid_return_type" === i.code) a(i.returnTypeError);else if ("invalid_arguments" === i.code) a(i.argumentsError);else if (0 === i.path.length) r._errors.push(t(i));else {
        let e = r;
        let a = 0;
        for (; a < i.path.length;) {
          let r = i.path[a];
          a === i.path.length - 1 ? (e[r] = e[r] || {
            _errors: []
          }, e[r]._errors.push(t(i))) : e[r] = e[r] || {
            _errors: []
          };
          e = e[r];
          a++;
        }
      }
    };
    return a(this), r;
  }
  static assert(t) {
    if (!(t instanceof e)) throw new Error(`Not a ZodError: ${t}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, f.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return 0 === this.issues.length;
  }
  flatten(e = e => e.message) {
    let t = {};
    let r = [];
    for (let a of this.issues) if (a.path.length > 0) {
      let r = a.path[0];
      t[r] = t[r] || [];
      t[r].push(e(a));
    } else r.push(e(a));
    return {
      formErrors: r,
      fieldErrors: t
    };
  }
  get formErrors() {
    return this.flatten();
  }
};
j.create = e => new j(e);
var I = (e, t) => {
  let r;
  switch (e.code) {
    case S.invalid_type:
      r = e.received === x.undefined ? "Required" : `Expected ${e.expected}, received ${e.received}`;
      break;
    case S.invalid_literal:
      r = `Invalid literal value, expected ${JSON.stringify(e.expected, f.jsonStringifyReplacer)}`;
      break;
    case S.unrecognized_keys:
      r = `Unrecognized key(s) in object: ${f.joinValues(e.keys, ", ")}`;
      break;
    case S.invalid_union:
      r = "Invalid input";
      break;
    case S.invalid_union_discriminator:
      r = `Invalid discriminator value. Expected ${f.joinValues(e.options)}`;
      break;
    case S.invalid_enum_value:
      r = `Invalid enum value. Expected ${f.joinValues(e.options)}, received '${e.received}'`;
      break;
    case S.invalid_arguments:
      r = "Invalid function arguments";
      break;
    case S.invalid_return_type:
      r = "Invalid function return type";
      break;
    case S.invalid_date:
      r = "Invalid date";
      break;
    case S.invalid_string:
      "object" == typeof e.validation ? "includes" in e.validation ? (r = `Invalid input: must include "${e.validation.includes}"`, "number" == typeof e.validation.position && (r = `${r} at one or more positions greater than or equal to ${e.validation.position}`)) : "startsWith" in e.validation ? r = `Invalid input: must start with "${e.validation.startsWith}"` : "endsWith" in e.validation ? r = `Invalid input: must end with "${e.validation.endsWith}"` : f.assertNever(e.validation) : r = "regex" !== e.validation ? `Invalid ${e.validation}` : "Invalid";
      break;
    case S.too_small:
      r = "array" === e.type ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "more than"} ${e.minimum} element(s)` : "string" === e.type ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at least" : "over"} ${e.minimum} character(s)` : "number" === e.type || "bigint" === e.type ? `Number must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${e.minimum}` : "date" === e.type ? `Date must be ${e.exact ? "exactly equal to " : e.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(e.minimum))}` : "Invalid input";
      break;
    case S.too_big:
      r = "array" === e.type ? `Array must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "less than"} ${e.maximum} element(s)` : "string" === e.type ? `String must contain ${e.exact ? "exactly" : e.inclusive ? "at most" : "under"} ${e.maximum} character(s)` : "number" === e.type ? `Number must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : "bigint" === e.type ? `BigInt must be ${e.exact ? "exactly" : e.inclusive ? "less than or equal to" : "less than"} ${e.maximum}` : "date" === e.type ? `Date must be ${e.exact ? "exactly" : e.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(e.maximum))}` : "Invalid input";
      break;
    case S.custom:
      r = "Invalid input";
      break;
    case S.invalid_intersection_types:
      r = "Intersection results could not be merged";
      break;
    case S.not_multiple_of:
      r = `Number must be a multiple of ${e.multipleOf}`;
      break;
    case S.not_finite:
      r = "Number must be finite";
      break;
    default:
      r = t.defaultError;
      f.assertNever(e);
  }
  return {
    message: r
  };
};
var C = I;
function R(e) {
  C = e;
}
function P() {
  return C;
}
var E = e => {
  let {
    data: t,
    path: r,
    errorMaps: a,
    issueData: i
  } = e;
  let s = [...r, ...(i.path || [])];
  let n = {
    ...i,
    path: s
  };
  if (void 0 !== i.message) return {
    ...i,
    path: s,
    message: i.message
  };
  let o = "";
  let c = a.filter(e => !!e).slice().reverse();
  for (let e of c) o = e(n, {
    data: t,
    defaultError: o
  }).message;
  return {
    ...i,
    path: s,
    message: o
  };
};
var A = [];
function M(e, t) {
  let r = P();
  let a = E({
    issueData: t,
    data: e.data,
    path: e.path,
    errorMaps: [e.common.contextualErrorMap, e.schemaErrorMap, r, r === I ? void 0 : I].filter(e => !!e)
  });
  e.common.issues.push(a);
}
var O;
var $ = class e {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    "valid" === this.value && (this.value = "dirty");
  }
  abort() {
    "aborted" !== this.value && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    let r = [];
    for (let a of t) {
      if ("aborted" === a.status) return Z;
      "dirty" === a.status && e.dirty();
      r.push(a.value);
    }
    return {
      status: e.value,
      value: r
    };
  }
  static async mergeObjectAsync(t, r) {
    let a = [];
    for (let e of r) {
      let t = await e.key;
      let r = await e.value;
      a.push({
        key: t,
        value: r
      });
    }
    return e.mergeObjectSync(t, a);
  }
  static mergeObjectSync(e, t) {
    let r = {};
    for (let a of t) {
      let {
        key: t,
        value: i
      } = a;
      if ("aborted" === t.status || "aborted" === i.status) return Z;
      "dirty" === t.status && e.dirty();
      "dirty" === i.status && e.dirty();
      "__proto__" !== t.value && (typeof i.value < "u" || a.alwaysSet) && (r[t.value] = i.value);
    }
    return {
      status: e.value,
      value: r
    };
  }
};
var Z = Object.freeze({
  status: "aborted"
});
var N = e => ({
  status: "dirty",
  value: e
});
var q = e => ({
  status: "valid",
  value: e
});
var D = e => "aborted" === e.status;
var L = e => "dirty" === e.status;
var B = e => "valid" === e.status;
var F = e => typeof Promise < "u" && e instanceof Promise;
!function (e) {
  e.errToObj = e => "string" == typeof e ? {
    message: e
  } : e || {};
  e.toString = e => "string" == typeof e ? e : e?.message;
}(O || (O = {}));
var U = class {
  constructor(e, t, r, a) {
    this._cachedPath = [];
    this.parent = e;
    this.data = t;
    this._path = r;
    this._key = a;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
};
var z = (e, t) => {
  if (B(t)) return {
    success: true,
    data: t.value
  };
  if (!e.common.issues.length) throw new Error("Validation failed but no issues detected.");
  return {
    success: false,
    get error() {
      if (this._error) return this._error;
      let t = new j(e.common.issues);
      return this._error = t, this._error;
    }
  };
};
function V(e) {
  if (!e) return {};
  let {
    errorMap: t,
    invalid_type_error: r,
    required_error: a,
    description: i
  } = e;
  if (t && (r || a)) throw new Error('Can\'t use "invalid_type_error" or "required_error" in conjunction with custom error map.');
  return t ? {
    errorMap: t,
    description: i
  } : {
    errorMap: (t, i) => {
      let {
        message: s
      } = e;
      return "invalid_enum_value" === t.code ? {
        message: s ?? i.defaultError
      } : typeof i.data > "u" ? {
        message: s ?? a ?? i.defaultError
      } : "invalid_type" !== t.code ? {
        message: i.defaultError
      } : {
        message: s ?? r ?? i.defaultError
      };
    },
    description: i
  };
}
var W;
var K = class {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return k(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: k(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new $(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: k(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    let t = this._parse(e);
    if (F(t)) throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    let t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    let r = this.safeParse(e, t);
    if (r.success) return r.data;
    throw r.error;
  }
  safeParse(e, t) {
    let r = {
      common: {
        issues: [],
        async: t?.async ?? false,
        contextualErrorMap: t?.errorMap
      },
      path: t?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: k(e)
    };
    let a = this._parseSync({
      data: e,
      path: r.path,
      parent: r
    });
    return z(r, a);
  }
  "~validate"(e) {
    let t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: k(e)
    };
    if (!this["~standard"].async) try {
      let r = this._parseSync({
        data: e,
        path: [],
        parent: t
      });
      return B(r) ? {
        value: r.value
      } : {
        issues: t.common.issues
      };
    } catch (e) {
      e?.message?.toLowerCase()?.includes("encountered") && (this["~standard"].async = true);
      t.common = {
        issues: [],
        async: true
      };
    }
    return this._parseAsync({
      data: e,
      path: [],
      parent: t
    }).then(e => B(e) ? {
      value: e.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    let r = await this.safeParseAsync(e, t);
    if (r.success) return r.data;
    throw r.error;
  }
  async safeParseAsync(e, t) {
    let r = {
      common: {
        issues: [],
        contextualErrorMap: t?.errorMap,
        async: true
      },
      path: t?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: k(e)
    };
    let a = this._parse({
      data: e,
      path: r.path,
      parent: r
    });
    let i = await (F(a) ? a : Promise.resolve(a));
    return z(r, i);
  }
  refine(e, t) {
    let r = e => "string" == typeof t || typeof t > "u" ? {
      message: t
    } : "function" == typeof t ? t(e) : t;
    return this._refinement((t, a) => {
      let i = e(t);
      let s = () => a.addIssue({
        code: S.custom,
        ...r(t)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then(e => !!e || (s(), false)) : !!i || (s(), false);
    });
  }
  refinement(e, t) {
    return this._refinement((r, a) => !!e(r) || (a.addIssue("function" == typeof t ? t(r, a) : t), false));
  }
  _refinement(e) {
    return new Je({
      schema: this,
      typeName: nt.ZodEffects,
      effect: {
        type: "refinement",
        refinement: e
      }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync;
    this._def = e;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: e => this["~validate"](e)
    };
  }
  optional() {
    return Ge.create(this, this._def);
  }
  nullable() {
    return He.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return Re.create(this);
  }
  promise() {
    return Ke.create(this, this._def);
  }
  or(e) {
    return Ae.create([this, e], this._def);
  }
  and(e) {
    return Ze.create(this, e, this._def);
  }
  transform(e) {
    return new Je({
      ...V(this._def),
      schema: this,
      typeName: nt.ZodEffects,
      effect: {
        type: "transform",
        transform: e
      }
    });
  }
  default(e) {
    let t = "function" == typeof e ? e : () => e;
    return new Ye({
      ...V(this._def),
      innerType: this,
      defaultValue: t,
      typeName: nt.ZodDefault
    });
  }
  brand() {
    return new tt({
      typeName: nt.ZodBranded,
      type: this,
      ...V(this._def)
    });
  }
  catch(e) {
    let t = "function" == typeof e ? e : () => e;
    return new Xe({
      ...V(this._def),
      innerType: this,
      catchValue: t,
      typeName: nt.ZodCatch
    });
  }
  describe(e) {
    return new (0, this.constructor)({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return rt.create(this, e);
  }
  readonly() {
    return at.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var J = /^c[^\s-]{8,}$/i;
var G = /^[0-9a-z]+$/;
var H = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var Y = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var X = /^[a-z0-9_-]{21}$/i;
var Q = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var ee = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var te = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var re = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ae = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ie = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var se = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var ne = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var oe = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var ce = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))";
var de = new RegExp(`^${ce}$`);
function le(e) {
  let t = "[0-5]\\d";
  return e.precision ? t = `${t}\\.\\d{${e.precision}}` : null == e.precision && (t = `${t}(\\.\\d+)?`), `([01]\\d|2[0-3]):[0-5]\\d(:${t})${e.precision ? "+" : "?"}`;
}
function ue(e) {
  return new RegExp(`^${le(e)}$`);
}
function he(e) {
  let t = `${ce}T${le(e)}`;
  let r = [];
  return r.push(e.local ? "Z?" : "Z"), e.offset && r.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${r.join("|")})`, new RegExp(`^${t}$`);
}
function me(e, t) {
  return !(("v4" !== t && t || !re.test(e)) && ("v6" !== t && t || !ie.test(e)));
}
function pe(e, t) {
  if (!Q.test(e)) return false;
  try {
    let [r] = e.split(".");
    if (!r) return false;
    let a = r.replace(/-/g, "+").replace(/_/g, "/").padEnd(r.length + (4 - r.length % 4) % 4, "=");
    let i = JSON.parse(atob(a));
    return !("object" != typeof i || null === i || "typ" in i && "JWT" !== i?.typ || !i.alg || t && i.alg !== t);
  } catch {
    return false;
  }
}
function be(e, t) {
  return !(("v4" !== t && t || !ae.test(e)) && ("v6" !== t && t || !se.test(e)));
}
var _e = class e extends K {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== x.string) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.string,
        received: t.parsedType
      }), Z;
    }
    let t;
    let r = new $();
    for (let a of this._def.checks) if ("min" === a.kind) e.data.length < a.value && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_small,
      minimum: a.value,
      type: "string",
      inclusive: true,
      exact: false,
      message: a.message
    }), r.dirty());else if ("max" === a.kind) e.data.length > a.value && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_big,
      maximum: a.value,
      type: "string",
      inclusive: true,
      exact: false,
      message: a.message
    }), r.dirty());else if ("length" === a.kind) {
      let i = e.data.length > a.value;
      let s = e.data.length < a.value;
      (i || s) && (t = this._getOrReturnCtx(e, t), i ? M(t, {
        code: S.too_big,
        maximum: a.value,
        type: "string",
        inclusive: true,
        exact: true,
        message: a.message
      }) : s && M(t, {
        code: S.too_small,
        minimum: a.value,
        type: "string",
        inclusive: true,
        exact: true,
        message: a.message
      }), r.dirty());
    } else if ("email" === a.kind) te.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "email",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("emoji" === a.kind) W || (W = new RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u")), W.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "emoji",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("uuid" === a.kind) Y.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "uuid",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("nanoid" === a.kind) X.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "nanoid",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("cuid" === a.kind) J.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "cuid",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("cuid2" === a.kind) G.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "cuid2",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("ulid" === a.kind) H.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "ulid",
      code: S.invalid_string,
      message: a.message
    }), r.dirty());else if ("url" === a.kind) try {
      new URL(e.data);
    } catch {
      t = this._getOrReturnCtx(e, t);
      M(t, {
        validation: "url",
        code: S.invalid_string,
        message: a.message
      });
      r.dirty();
    } else "regex" === a.kind ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "regex",
      code: S.invalid_string,
      message: a.message
    }), r.dirty())) : "trim" === a.kind ? e.data = e.data.trim() : "includes" === a.kind ? e.data.includes(a.value, a.position) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: {
        includes: a.value,
        position: a.position
      },
      message: a.message
    }), r.dirty()) : "toLowerCase" === a.kind ? e.data = e.data.toLowerCase() : "toUpperCase" === a.kind ? e.data = e.data.toUpperCase() : "startsWith" === a.kind ? e.data.startsWith(a.value) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: {
        startsWith: a.value
      },
      message: a.message
    }), r.dirty()) : "endsWith" === a.kind ? e.data.endsWith(a.value) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: {
        endsWith: a.value
      },
      message: a.message
    }), r.dirty()) : "datetime" === a.kind ? he(a).test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: "datetime",
      message: a.message
    }), r.dirty()) : "date" === a.kind ? de.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: "date",
      message: a.message
    }), r.dirty()) : "time" === a.kind ? ue(a).test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_string,
      validation: "time",
      message: a.message
    }), r.dirty()) : "duration" === a.kind ? ee.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "duration",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : "ip" === a.kind ? me(e.data, a.version) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "ip",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : "jwt" === a.kind ? pe(e.data, a.alg) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "jwt",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : "cidr" === a.kind ? be(e.data, a.version) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "cidr",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : "base64" === a.kind ? ne.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "base64",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : "base64url" === a.kind ? oe.test(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      validation: "base64url",
      code: S.invalid_string,
      message: a.message
    }), r.dirty()) : f.assertNever(a);
    return {
      status: r.value,
      value: e.data
    };
  }
  _regex(e, t, r) {
    return this.refinement(t => e.test(t), {
      validation: t,
      code: S.invalid_string,
      ...O.errToObj(r)
    });
  }
  _addCheck(t) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, t]
    });
  }
  email(e) {
    return this._addCheck({
      kind: "email",
      ...O.errToObj(e)
    });
  }
  url(e) {
    return this._addCheck({
      kind: "url",
      ...O.errToObj(e)
    });
  }
  emoji(e) {
    return this._addCheck({
      kind: "emoji",
      ...O.errToObj(e)
    });
  }
  uuid(e) {
    return this._addCheck({
      kind: "uuid",
      ...O.errToObj(e)
    });
  }
  nanoid(e) {
    return this._addCheck({
      kind: "nanoid",
      ...O.errToObj(e)
    });
  }
  cuid(e) {
    return this._addCheck({
      kind: "cuid",
      ...O.errToObj(e)
    });
  }
  cuid2(e) {
    return this._addCheck({
      kind: "cuid2",
      ...O.errToObj(e)
    });
  }
  ulid(e) {
    return this._addCheck({
      kind: "ulid",
      ...O.errToObj(e)
    });
  }
  base64(e) {
    return this._addCheck({
      kind: "base64",
      ...O.errToObj(e)
    });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...O.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({
      kind: "jwt",
      ...O.errToObj(e)
    });
  }
  ip(e) {
    return this._addCheck({
      kind: "ip",
      ...O.errToObj(e)
    });
  }
  cidr(e) {
    return this._addCheck({
      kind: "cidr",
      ...O.errToObj(e)
    });
  }
  datetime(e) {
    return "string" == typeof e ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: false,
      local: false,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof e?.precision > "u" ? null : e?.precision,
      offset: e?.offset ?? false,
      local: e?.local ?? false,
      ...O.errToObj(e?.message)
    });
  }
  date(e) {
    return this._addCheck({
      kind: "date",
      message: e
    });
  }
  time(e) {
    return "string" == typeof e ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof e?.precision > "u" ? null : e?.precision,
      ...O.errToObj(e?.message)
    });
  }
  duration(e) {
    return this._addCheck({
      kind: "duration",
      ...O.errToObj(e)
    });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...O.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t?.position,
      ...O.errToObj(t?.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...O.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...O.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...O.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...O.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...O.errToObj(t)
    });
  }
  nonempty(e) {
    return this.min(1, O.errToObj(e));
  }
  trim() {
    return new e({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "trim"
      }]
    });
  }
  toLowerCase() {
    return new e({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "toLowerCase"
      }]
    });
  }
  toUpperCase() {
    return new e({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "toUpperCase"
      }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find(e => "datetime" === e.kind);
  }
  get isDate() {
    return !!this._def.checks.find(e => "date" === e.kind);
  }
  get isTime() {
    return !!this._def.checks.find(e => "time" === e.kind);
  }
  get isDuration() {
    return !!this._def.checks.find(e => "duration" === e.kind);
  }
  get isEmail() {
    return !!this._def.checks.find(e => "email" === e.kind);
  }
  get isURL() {
    return !!this._def.checks.find(e => "url" === e.kind);
  }
  get isEmoji() {
    return !!this._def.checks.find(e => "emoji" === e.kind);
  }
  get isUUID() {
    return !!this._def.checks.find(e => "uuid" === e.kind);
  }
  get isNANOID() {
    return !!this._def.checks.find(e => "nanoid" === e.kind);
  }
  get isCUID() {
    return !!this._def.checks.find(e => "cuid" === e.kind);
  }
  get isCUID2() {
    return !!this._def.checks.find(e => "cuid2" === e.kind);
  }
  get isULID() {
    return !!this._def.checks.find(e => "ulid" === e.kind);
  }
  get isIP() {
    return !!this._def.checks.find(e => "ip" === e.kind);
  }
  get isCIDR() {
    return !!this._def.checks.find(e => "cidr" === e.kind);
  }
  get isBase64() {
    return !!this._def.checks.find(e => "base64" === e.kind);
  }
  get isBase64url() {
    return !!this._def.checks.find(e => "base64url" === e.kind);
  }
  get minLength() {
    let e = null;
    for (let t of this._def.checks) "min" === t.kind && (null === e || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (let t of this._def.checks) "max" === t.kind && (null === e || t.value < e) && (e = t.value);
    return e;
  }
};
function ye(e, t) {
  let r = (e.toString().split(".")[1] || "").length;
  let a = (t.toString().split(".")[1] || "").length;
  let i = r > a ? r : a;
  return Number.parseInt(e.toFixed(i).replace(".", "")) % Number.parseInt(t.toFixed(i).replace(".", "")) / 10 ** i;
}
_e.create = e => new _e({
  checks: [],
  typeName: nt.ZodString,
  coerce: e?.coerce ?? false,
  ...V(e)
});
var fe = class e extends K {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== x.number) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.number,
        received: t.parsedType
      }), Z;
    }
    let t;
    let r = new $();
    for (let a of this._def.checks) "int" === a.kind ? f.isInteger(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.invalid_type,
      expected: "integer",
      received: "float",
      message: a.message
    }), r.dirty()) : "min" === a.kind ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_small,
      minimum: a.value,
      type: "number",
      inclusive: a.inclusive,
      exact: false,
      message: a.message
    }), r.dirty()) : "max" === a.kind ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_big,
      maximum: a.value,
      type: "number",
      inclusive: a.inclusive,
      exact: false,
      message: a.message
    }), r.dirty()) : "multipleOf" === a.kind ? 0 !== ye(e.data, a.value) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.not_multiple_of,
      multipleOf: a.value,
      message: a.message
    }), r.dirty()) : "finite" === a.kind ? Number.isFinite(e.data) || (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.not_finite,
      message: a.message
    }), r.dirty()) : f.assertNever(a);
    return {
      status: r.value,
      value: e.data
    };
  }
  gte(e, t) {
    return this.setLimit("min", e, true, O.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, false, O.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, true, O.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, false, O.toString(t));
  }
  setLimit(t, r, a, i) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, {
        kind: t,
        value: r,
        inclusive: a,
        message: O.toString(i)
      }]
    });
  }
  _addCheck(t) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, t]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: O.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: O.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: O.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: O.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: O.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: O.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: O.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: O.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: O.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (let t of this._def.checks) "min" === t.kind && (null === e || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let t of this._def.checks) "max" === t.kind && (null === e || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find(e => "int" === e.kind || "multipleOf" === e.kind && f.isInteger(e.value));
  }
  get isFinite() {
    let e = null;
    let t = null;
    for (let r of this._def.checks) {
      if ("finite" === r.kind || "int" === r.kind || "multipleOf" === r.kind) return true;
      "min" === r.kind ? (null === t || r.value > t) && (t = r.value) : "max" === r.kind && (null === e || r.value < e) && (e = r.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
};
fe.create = e => new fe({
  checks: [],
  typeName: nt.ZodNumber,
  coerce: e?.coerce || false,
  ...V(e)
});
var ge = class e extends K {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce) try {
      e.data = BigInt(e.data);
    } catch {
      return this._getInvalidInput(e);
    }
    if (this._getType(e) !== x.bigint) return this._getInvalidInput(e);
    let t;
    let r = new $();
    for (let a of this._def.checks) "min" === a.kind ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_small,
      type: "bigint",
      minimum: a.value,
      inclusive: a.inclusive,
      message: a.message
    }), r.dirty()) : "max" === a.kind ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_big,
      type: "bigint",
      maximum: a.value,
      inclusive: a.inclusive,
      message: a.message
    }), r.dirty()) : "multipleOf" === a.kind ? e.data % a.value !== BigInt(0) && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.not_multiple_of,
      multipleOf: a.value,
      message: a.message
    }), r.dirty()) : f.assertNever(a);
    return {
      status: r.value,
      value: e.data
    };
  }
  _getInvalidInput(e) {
    let t = this._getOrReturnCtx(e);
    return M(t, {
      code: S.invalid_type,
      expected: x.bigint,
      received: t.parsedType
    }), Z;
  }
  gte(e, t) {
    return this.setLimit("min", e, true, O.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, false, O.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, true, O.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, false, O.toString(t));
  }
  setLimit(t, r, a, i) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, {
        kind: t,
        value: r,
        inclusive: a,
        message: O.toString(i)
      }]
    });
  }
  _addCheck(t) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, t]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: O.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: O.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: O.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: O.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: O.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (let t of this._def.checks) "min" === t.kind && (null === e || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let t of this._def.checks) "max" === t.kind && (null === e || t.value < e) && (e = t.value);
    return e;
  }
};
ge.create = e => new ge({
  checks: [],
  typeName: nt.ZodBigInt,
  coerce: e?.coerce ?? false,
  ...V(e)
});
var we = class extends K {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== x.boolean) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.boolean,
        received: t.parsedType
      }), Z;
    }
    return q(e.data);
  }
};
we.create = e => new we({
  typeName: nt.ZodBoolean,
  coerce: e?.coerce || false,
  ...V(e)
});
var ve = class e extends K {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== x.date) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.date,
        received: t.parsedType
      }), Z;
    }
    if (Number.isNaN(e.data.getTime())) {
      return M(this._getOrReturnCtx(e), {
        code: S.invalid_date
      }), Z;
    }
    let t;
    let r = new $();
    for (let a of this._def.checks) "min" === a.kind ? e.data.getTime() < a.value && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_small,
      message: a.message,
      inclusive: true,
      exact: false,
      minimum: a.value,
      type: "date"
    }), r.dirty()) : "max" === a.kind ? e.data.getTime() > a.value && (t = this._getOrReturnCtx(e, t), M(t, {
      code: S.too_big,
      message: a.message,
      inclusive: true,
      exact: false,
      maximum: a.value,
      type: "date"
    }), r.dirty()) : f.assertNever(a);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(t) {
    return new e({
      ...this._def,
      checks: [...this._def.checks, t]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: O.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: O.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (let t of this._def.checks) "min" === t.kind && (null === e || t.value > e) && (e = t.value);
    return null != e ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (let t of this._def.checks) "max" === t.kind && (null === e || t.value < e) && (e = t.value);
    return null != e ? new Date(e) : null;
  }
};
ve.create = e => new ve({
  checks: [],
  coerce: e?.coerce || false,
  typeName: nt.ZodDate,
  ...V(e)
});
var xe = class extends K {
  _parse(e) {
    if (this._getType(e) !== x.symbol) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.symbol,
        received: t.parsedType
      }), Z;
    }
    return q(e.data);
  }
};
xe.create = e => new xe({
  typeName: nt.ZodSymbol,
  ...V(e)
});
var ke = class extends K {
  _parse(e) {
    if (this._getType(e) !== x.undefined) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.undefined,
        received: t.parsedType
      }), Z;
    }
    return q(e.data);
  }
};
ke.create = e => new ke({
  typeName: nt.ZodUndefined,
  ...V(e)
});
var Se = class extends K {
  _parse(e) {
    if (this._getType(e) !== x.null) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.null,
        received: t.parsedType
      }), Z;
    }
    return q(e.data);
  }
};
Se.create = e => new Se({
  typeName: nt.ZodNull,
  ...V(e)
});
var Te = class extends K {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(e) {
    return q(e.data);
  }
};
Te.create = e => new Te({
  typeName: nt.ZodAny,
  ...V(e)
});
var je = class extends K {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(e) {
    return q(e.data);
  }
};
je.create = e => new je({
  typeName: nt.ZodUnknown,
  ...V(e)
});
var Ie = class extends K {
  _parse(e) {
    let t = this._getOrReturnCtx(e);
    return M(t, {
      code: S.invalid_type,
      expected: x.never,
      received: t.parsedType
    }), Z;
  }
};
Ie.create = e => new Ie({
  typeName: nt.ZodNever,
  ...V(e)
});
var Ce = class extends K {
  _parse(e) {
    if (this._getType(e) !== x.undefined) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.void,
        received: t.parsedType
      }), Z;
    }
    return q(e.data);
  }
};
Ce.create = e => new Ce({
  typeName: nt.ZodVoid,
  ...V(e)
});
var Re = class e extends K {
  _parse(e) {
    let {
      ctx: t,
      status: r
    } = this._processInputParams(e);
    let a = this._def;
    if (t.parsedType !== x.array) return M(t, {
      code: S.invalid_type,
      expected: x.array,
      received: t.parsedType
    }), Z;
    if (null !== a.exactLength) {
      let e = t.data.length > a.exactLength.value;
      let i = t.data.length < a.exactLength.value;
      (e || i) && (M(t, {
        code: e ? S.too_big : S.too_small,
        minimum: i ? a.exactLength.value : void 0,
        maximum: e ? a.exactLength.value : void 0,
        type: "array",
        inclusive: true,
        exact: true,
        message: a.exactLength.message
      }), r.dirty());
    }
    if (null !== a.minLength && t.data.length < a.minLength.value && (M(t, {
      code: S.too_small,
      minimum: a.minLength.value,
      type: "array",
      inclusive: true,
      exact: false,
      message: a.minLength.message
    }), r.dirty()), null !== a.maxLength && t.data.length > a.maxLength.value && (M(t, {
      code: S.too_big,
      maximum: a.maxLength.value,
      type: "array",
      inclusive: true,
      exact: false,
      message: a.maxLength.message
    }), r.dirty()), t.common.async) return Promise.all([...t.data].map((e, r) => a.type._parseAsync(new U(t, e, t.path, r)))).then(e => $.mergeArray(r, e));
    let i = [...t.data].map((e, r) => a.type._parseSync(new U(t, e, t.path, r)));
    return $.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(t, r) {
    return new e({
      ...this._def,
      minLength: {
        value: t,
        message: O.toString(r)
      }
    });
  }
  max(t, r) {
    return new e({
      ...this._def,
      maxLength: {
        value: t,
        message: O.toString(r)
      }
    });
  }
  length(t, r) {
    return new e({
      ...this._def,
      exactLength: {
        value: t,
        message: O.toString(r)
      }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
function Pe(e) {
  if (e instanceof Ee) {
    let t = {};
    for (let r in e.shape) {
      let a = e.shape[r];
      t[r] = Ge.create(Pe(a));
    }
    return new Ee({
      ...e._def,
      shape: () => t
    });
  }
  return e instanceof Re ? new Re({
    ...e._def,
    type: Pe(e.element)
  }) : e instanceof Ge ? Ge.create(Pe(e.unwrap())) : e instanceof He ? He.create(Pe(e.unwrap())) : e instanceof Ne ? Ne.create(e.items.map(e => Pe(e))) : e;
}
Re.create = (e, t) => new Re({
  type: e,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: nt.ZodArray,
  ...V(t)
});
var Ee = class e extends K {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (null !== this._cached) return this._cached;
    let e = this._def.shape();
    let t = f.objectKeys(e);
    return this._cached = {
      shape: e,
      keys: t
    }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== x.object) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.object,
        received: t.parsedType
      }), Z;
    }
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    let {
      shape: a,
      keys: i
    } = this._getCached();
    let s = [];
    if (!(this._def.catchall instanceof Ie && "strip" === this._def.unknownKeys)) for (let e in r.data) i.includes(e) || s.push(e);
    let n = [];
    for (let e of i) {
      let t = a[e];
      let i = r.data[e];
      n.push({
        key: {
          status: "valid",
          value: e
        },
        value: t._parse(new U(r, i, r.path, e)),
        alwaysSet: e in r.data
      });
    }
    if (this._def.catchall instanceof Ie) {
      let e = this._def.unknownKeys;
      if ("passthrough" === e) for (let e of s) n.push({
        key: {
          status: "valid",
          value: e
        },
        value: {
          status: "valid",
          value: r.data[e]
        }
      });else if ("strict" === e) s.length > 0 && (M(r, {
        code: S.unrecognized_keys,
        keys: s
      }), t.dirty());else if ("strip" !== e) throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      let e = this._def.catchall;
      for (let t of s) {
        let a = r.data[t];
        n.push({
          key: {
            status: "valid",
            value: t
          },
          value: e._parse(new U(r, a, r.path, t)),
          alwaysSet: t in r.data
        });
      }
    }
    return r.common.async ? Promise.resolve().then(async () => {
      let e = [];
      for (let t of n) {
        let r = await t.key;
        let a = await t.value;
        e.push({
          key: r,
          value: a,
          alwaysSet: t.alwaysSet
        });
      }
      return e;
    }).then(e => $.mergeObjectSync(t, e)) : $.mergeObjectSync(t, n);
  }
  get shape() {
    return this._def.shape();
  }
  strict(t) {
    return O.errToObj, new e({
      ...this._def,
      unknownKeys: "strict",
      ...(void 0 !== t ? {
        errorMap: (e, r) => {
          let a = this._def.errorMap?.(e, r).message ?? r.defaultError;
          return "unrecognized_keys" === e.code ? {
            message: O.errToObj(t).message ?? a
          } : {
            message: a
          };
        }
      } : {})
    });
  }
  strip() {
    return new e({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new e({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(t) {
    return new e({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...t
      })
    });
  }
  merge(t) {
    return new e({
      unknownKeys: t._def.unknownKeys,
      catchall: t._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...t._def.shape()
      }),
      typeName: nt.ZodObject
    });
  }
  setKey(e, t) {
    return this.augment({
      [e]: t
    });
  }
  catchall(t) {
    return new e({
      ...this._def,
      catchall: t
    });
  }
  pick(t) {
    let r = {};
    for (let e of f.objectKeys(t)) t[e] && this.shape[e] && (r[e] = this.shape[e]);
    return new e({
      ...this._def,
      shape: () => r
    });
  }
  omit(t) {
    let r = {};
    for (let e of f.objectKeys(this.shape)) t[e] || (r[e] = this.shape[e]);
    return new e({
      ...this._def,
      shape: () => r
    });
  }
  deepPartial() {
    return Pe(this);
  }
  partial(t) {
    let r = {};
    for (let e of f.objectKeys(this.shape)) {
      let a = this.shape[e];
      t && !t[e] ? r[e] = a : r[e] = a.optional();
    }
    return new e({
      ...this._def,
      shape: () => r
    });
  }
  required(t) {
    let r = {};
    for (let e of f.objectKeys(this.shape)) if (t && !t[e]) r[e] = this.shape[e];else {
      let t = this.shape[e];
      for (; t instanceof Ge;) t = t._def.innerType;
      r[e] = t;
    }
    return new e({
      ...this._def,
      shape: () => r
    });
  }
  keyof() {
    return ze(f.objectKeys(this.shape));
  }
};
Ee.create = (e, t) => new Ee({
  shape: () => e,
  unknownKeys: "strip",
  catchall: Ie.create(),
  typeName: nt.ZodObject,
  ...V(t)
});
Ee.strictCreate = (e, t) => new Ee({
  shape: () => e,
  unknownKeys: "strict",
  catchall: Ie.create(),
  typeName: nt.ZodObject,
  ...V(t)
});
Ee.lazycreate = (e, t) => new Ee({
  shape: e,
  unknownKeys: "strip",
  catchall: Ie.create(),
  typeName: nt.ZodObject,
  ...V(t)
});
var Ae = class extends K {
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    let r = this._def.options;
    if (t.common.async) return Promise.all(r.map(async e => {
      let r = {
        ...t,
        common: {
          ...t.common,
          issues: []
        },
        parent: null
      };
      return {
        result: await e._parseAsync({
          data: t.data,
          path: t.path,
          parent: r
        }),
        ctx: r
      };
    })).then(function (e) {
      for (let t of e) if ("valid" === t.result.status) return t.result;
      for (let r of e) if ("dirty" === r.result.status) return t.common.issues.push(...r.ctx.common.issues), r.result;
      let r = e.map(e => new j(e.ctx.common.issues));
      return M(t, {
        code: S.invalid_union,
        unionErrors: r
      }), Z;
    });
    {
      let e;
      let a = [];
      for (let i of r) {
        let r = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        let s = i._parseSync({
          data: t.data,
          path: t.path,
          parent: r
        });
        if ("valid" === s.status) return s;
        "dirty" === s.status && !e && (e = {
          result: s,
          ctx: r
        });
        r.common.issues.length && a.push(r.common.issues);
      }
      if (e) return t.common.issues.push(...e.ctx.common.issues), e.result;
      let i = a.map(e => new j(e));
      return M(t, {
        code: S.invalid_union,
        unionErrors: i
      }), Z;
    }
  }
  get options() {
    return this._def.options;
  }
};
Ae.create = (e, t) => new Ae({
  options: e,
  typeName: nt.ZodUnion,
  ...V(t)
});
var Me = e => e instanceof Fe ? Me(e.schema) : e instanceof Je ? Me(e.innerType()) : e instanceof Ue ? [e.value] : e instanceof Ve ? e.options : e instanceof We ? f.objectValues(e.enum) : e instanceof Ye ? Me(e._def.innerType) : e instanceof ke ? [void 0] : e instanceof Se ? [null] : e instanceof Ge ? [void 0, ...Me(e.unwrap())] : e instanceof He ? [null, ...Me(e.unwrap())] : e instanceof tt || e instanceof at ? Me(e.unwrap()) : e instanceof Xe ? Me(e._def.innerType) : [];
var Oe = class e extends K {
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    if (t.parsedType !== x.object) return M(t, {
      code: S.invalid_type,
      expected: x.object,
      received: t.parsedType
    }), Z;
    let r = this.discriminator;
    let a = t.data[r];
    let i = this.optionsMap.get(a);
    return i ? t.common.async ? i._parseAsync({
      data: t.data,
      path: t.path,
      parent: t
    }) : i._parseSync({
      data: t.data,
      path: t.path,
      parent: t
    }) : (M(t, {
      code: S.invalid_union_discriminator,
      options: Array.from(this.optionsMap.keys()),
      path: [r]
    }), Z);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(t, r, a) {
    let i = new Map();
    for (let e of r) {
      let r = Me(e.shape[t]);
      if (!r.length) throw new Error(`A discriminator value for key \`${t}\` could not be extracted from all schema options`);
      for (let a of r) {
        if (i.has(a)) throw new Error(`Discriminator property ${String(t)} has duplicate value ${String(a)}`);
        i.set(a, e);
      }
    }
    return new e({
      typeName: nt.ZodDiscriminatedUnion,
      discriminator: t,
      options: r,
      optionsMap: i,
      ...V(a)
    });
  }
};
function $e(e, t) {
  let r = k(e);
  let a = k(t);
  if (e === t) return {
    valid: true,
    data: e
  };
  if (r === x.object && a === x.object) {
    let r = f.objectKeys(t);
    let a = f.objectKeys(e).filter(e => -1 !== r.indexOf(e));
    let i = {
      ...e,
      ...t
    };
    for (let r of a) {
      let a = $e(e[r], t[r]);
      if (!a.valid) return {
        valid: false
      };
      i[r] = a.data;
    }
    return {
      valid: true,
      data: i
    };
  }
  if (r === x.array && a === x.array) {
    if (e.length !== t.length) return {
      valid: false
    };
    let r = [];
    for (let a = 0; a < e.length; a++) {
      let i = $e(e[a], t[a]);
      if (!i.valid) return {
        valid: false
      };
      r.push(i.data);
    }
    return {
      valid: true,
      data: r
    };
  }
  return r === x.date && a === x.date && +e == +t ? {
    valid: true,
    data: e
  } : {
    valid: false
  };
}
var Ze = class extends K {
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    let a = (e, a) => {
      if (D(e) || D(a)) return Z;
      let i = $e(e.value, a.value);
      return i.valid ? ((L(e) || L(a)) && t.dirty(), {
        status: t.value,
        value: i.data
      }) : (M(r, {
        code: S.invalid_intersection_types
      }), Z);
    };
    return r.common.async ? Promise.all([this._def.left._parseAsync({
      data: r.data,
      path: r.path,
      parent: r
    }), this._def.right._parseAsync({
      data: r.data,
      path: r.path,
      parent: r
    })]).then(([e, t]) => a(e, t)) : a(this._def.left._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }), this._def.right._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }));
  }
};
Ze.create = (e, t, r) => new Ze({
  left: e,
  right: t,
  typeName: nt.ZodIntersection,
  ...V(r)
});
var Ne = class e extends K {
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    if (r.parsedType !== x.array) return M(r, {
      code: S.invalid_type,
      expected: x.array,
      received: r.parsedType
    }), Z;
    if (r.data.length < this._def.items.length) return M(r, {
      code: S.too_small,
      minimum: this._def.items.length,
      inclusive: true,
      exact: false,
      type: "array"
    }), Z;
    !this._def.rest && r.data.length > this._def.items.length && (M(r, {
      code: S.too_big,
      maximum: this._def.items.length,
      inclusive: true,
      exact: false,
      type: "array"
    }), t.dirty());
    let a = [...r.data].map((e, t) => {
      let a = this._def.items[t] || this._def.rest;
      return a ? a._parse(new U(r, e, r.path, t)) : null;
    }).filter(e => !!e);
    return r.common.async ? Promise.all(a).then(e => $.mergeArray(t, e)) : $.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(t) {
    return new e({
      ...this._def,
      rest: t
    });
  }
};
Ne.create = (e, t) => {
  if (!Array.isArray(e)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ne({
    items: e,
    typeName: nt.ZodTuple,
    rest: null,
    ...V(t)
  });
};
var qe = class e extends K {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    if (r.parsedType !== x.object) return M(r, {
      code: S.invalid_type,
      expected: x.object,
      received: r.parsedType
    }), Z;
    let a = [];
    let i = this._def.keyType;
    let s = this._def.valueType;
    for (let e in r.data) a.push({
      key: i._parse(new U(r, e, r.path, e)),
      value: s._parse(new U(r, r.data[e], r.path, e)),
      alwaysSet: e in r.data
    });
    return r.common.async ? $.mergeObjectAsync(t, a) : $.mergeObjectSync(t, a);
  }
  get element() {
    return this._def.valueType;
  }
  static create(t, r, a) {
    return new e(r instanceof K ? {
      keyType: t,
      valueType: r,
      typeName: nt.ZodRecord,
      ...V(a)
    } : {
      keyType: _e.create(),
      valueType: t,
      typeName: nt.ZodRecord,
      ...V(r)
    });
  }
};
var De = class extends K {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    if (r.parsedType !== x.map) return M(r, {
      code: S.invalid_type,
      expected: x.map,
      received: r.parsedType
    }), Z;
    let a = this._def.keyType;
    let i = this._def.valueType;
    let s = [...r.data.entries()].map(([e, t], s) => ({
      key: a._parse(new U(r, e, r.path, [s, "key"])),
      value: i._parse(new U(r, t, r.path, [s, "value"]))
    }));
    if (r.common.async) {
      let e = new Map();
      return Promise.resolve().then(async () => {
        for (let r of s) {
          let a = await r.key;
          let i = await r.value;
          if ("aborted" === a.status || "aborted" === i.status) return Z;
          ("dirty" === a.status || "dirty" === i.status) && t.dirty();
          e.set(a.value, i.value);
        }
        return {
          status: t.value,
          value: e
        };
      });
    }
    {
      let e = new Map();
      for (let r of s) {
        let a = r.key;
        let i = r.value;
        if ("aborted" === a.status || "aborted" === i.status) return Z;
        ("dirty" === a.status || "dirty" === i.status) && t.dirty();
        e.set(a.value, i.value);
      }
      return {
        status: t.value,
        value: e
      };
    }
  }
};
De.create = (e, t, r) => new De({
  valueType: t,
  keyType: e,
  typeName: nt.ZodMap,
  ...V(r)
});
var Le = class e extends K {
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    if (r.parsedType !== x.set) return M(r, {
      code: S.invalid_type,
      expected: x.set,
      received: r.parsedType
    }), Z;
    let a = this._def;
    null !== a.minSize && r.data.size < a.minSize.value && (M(r, {
      code: S.too_small,
      minimum: a.minSize.value,
      type: "set",
      inclusive: true,
      exact: false,
      message: a.minSize.message
    }), t.dirty());
    null !== a.maxSize && r.data.size > a.maxSize.value && (M(r, {
      code: S.too_big,
      maximum: a.maxSize.value,
      type: "set",
      inclusive: true,
      exact: false,
      message: a.maxSize.message
    }), t.dirty());
    let i = this._def.valueType;
    function s(e) {
      let r = new Set();
      for (let a of e) {
        if ("aborted" === a.status) return Z;
        "dirty" === a.status && t.dirty();
        r.add(a.value);
      }
      return {
        status: t.value,
        value: r
      };
    }
    let n = [...r.data.values()].map((e, t) => i._parse(new U(r, e, r.path, t)));
    return r.common.async ? Promise.all(n).then(e => s(e)) : s(n);
  }
  min(t, r) {
    return new e({
      ...this._def,
      minSize: {
        value: t,
        message: O.toString(r)
      }
    });
  }
  max(t, r) {
    return new e({
      ...this._def,
      maxSize: {
        value: t,
        message: O.toString(r)
      }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
Le.create = (e, t) => new Le({
  valueType: e,
  minSize: null,
  maxSize: null,
  typeName: nt.ZodSet,
  ...V(t)
});
var Be = class e extends K {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    if (t.parsedType !== x.function) return M(t, {
      code: S.invalid_type,
      expected: x.function,
      received: t.parsedType
    }), Z;
    function r(e, r) {
      return E({
        data: e,
        path: t.path,
        errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, P(), I].filter(e => !!e),
        issueData: {
          code: S.invalid_arguments,
          argumentsError: r
        }
      });
    }
    function a(e, r) {
      return E({
        data: e,
        path: t.path,
        errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, P(), I].filter(e => !!e),
        issueData: {
          code: S.invalid_return_type,
          returnTypeError: r
        }
      });
    }
    let i = {
      errorMap: t.common.contextualErrorMap
    };
    let s = t.data;
    if (this._def.returns instanceof Ke) {
      let e = this;
      return q(async function (...t) {
        let n = new j([]);
        let o = await e._def.args.parseAsync(t, i).catch(e => {
          throw n.addIssue(r(t, e)), n;
        });
        let c = await Reflect.apply(s, this, o);
        return await e._def.returns._def.type.parseAsync(c, i).catch(e => {
          throw n.addIssue(a(c, e)), n;
        });
      });
    }
    {
      let e = this;
      return q(function (...t) {
        let n = e._def.args.safeParse(t, i);
        if (!n.success) throw new j([r(t, n.error)]);
        let o = Reflect.apply(s, this, n.data);
        let c = e._def.returns.safeParse(o, i);
        if (!c.success) throw new j([a(o, c.error)]);
        return c.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...t) {
    return new e({
      ...this._def,
      args: Ne.create(t).rest(je.create())
    });
  }
  returns(t) {
    return new e({
      ...this._def,
      returns: t
    });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(t, r, a) {
    return new e({
      args: t || Ne.create([]).rest(je.create()),
      returns: r || je.create(),
      typeName: nt.ZodFunction,
      ...V(a)
    });
  }
};
var Fe = class extends K {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    return this._def.getter()._parse({
      data: t.data,
      path: t.path,
      parent: t
    });
  }
};
Fe.create = (e, t) => new Fe({
  getter: e,
  typeName: nt.ZodLazy,
  ...V(t)
});
var Ue = class extends K {
  _parse(e) {
    if (e.data !== this._def.value) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        received: t.data,
        code: S.invalid_literal,
        expected: this._def.value
      }), Z;
    }
    return {
      status: "valid",
      value: e.data
    };
  }
  get value() {
    return this._def.value;
  }
};
function ze(e, t) {
  return new Ve({
    values: e,
    typeName: nt.ZodEnum,
    ...V(t)
  });
}
Ue.create = (e, t) => new Ue({
  value: e,
  typeName: nt.ZodLiteral,
  ...V(t)
});
var Ve = class e extends K {
  _parse(e) {
    if ("string" != typeof e.data) {
      let t = this._getOrReturnCtx(e);
      let r = this._def.values;
      return M(t, {
        expected: f.joinValues(r),
        received: t.parsedType,
        code: S.invalid_type
      }), Z;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      let t = this._getOrReturnCtx(e);
      let r = this._def.values;
      return M(t, {
        received: t.data,
        code: S.invalid_enum_value,
        options: r
      }), Z;
    }
    return q(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    let e = {};
    for (let t of this._def.values) e[t] = t;
    return e;
  }
  get Values() {
    let e = {};
    for (let t of this._def.values) e[t] = t;
    return e;
  }
  get Enum() {
    let e = {};
    for (let t of this._def.values) e[t] = t;
    return e;
  }
  extract(t, r = this._def) {
    return e.create(t, {
      ...this._def,
      ...r
    });
  }
  exclude(t, r = this._def) {
    return e.create(this.options.filter(e => !t.includes(e)), {
      ...this._def,
      ...r
    });
  }
};
Ve.create = ze;
var We = class extends K {
  _parse(e) {
    let t = f.getValidEnumValues(this._def.values);
    let r = this._getOrReturnCtx(e);
    if (r.parsedType !== x.string && r.parsedType !== x.number) {
      let e = f.objectValues(t);
      return M(r, {
        expected: f.joinValues(e),
        received: r.parsedType,
        code: S.invalid_type
      }), Z;
    }
    if (this._cache || (this._cache = new Set(f.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      let e = f.objectValues(t);
      return M(r, {
        received: r.data,
        code: S.invalid_enum_value,
        options: e
      }), Z;
    }
    return q(e.data);
  }
  get enum() {
    return this._def.values;
  }
};
We.create = (e, t) => new We({
  values: e,
  typeName: nt.ZodNativeEnum,
  ...V(t)
});
var Ke = class extends K {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    if (t.parsedType !== x.promise && false === t.common.async) return M(t, {
      code: S.invalid_type,
      expected: x.promise,
      received: t.parsedType
    }), Z;
    let r = t.parsedType === x.promise ? t.data : Promise.resolve(t.data);
    return q(r.then(e => this._def.type.parseAsync(e, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
};
Ke.create = (e, t) => new Ke({
  type: e,
  typeName: nt.ZodPromise,
  ...V(t)
});
var Je = class extends K {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === nt.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    let a = this._def.effect || null;
    let i = {
      addIssue: e => {
        M(r, e);
        e.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), "preprocess" === a.type) {
      let e = a.transform(r.data, i);
      if (r.common.async) return Promise.resolve(e).then(async e => {
        if ("aborted" === t.value) return Z;
        let a = await this._def.schema._parseAsync({
          data: e,
          path: r.path,
          parent: r
        });
        return "aborted" === a.status ? Z : "dirty" === a.status || "dirty" === t.value ? N(a.value) : a;
      });
      {
        if ("aborted" === t.value) return Z;
        let a = this._def.schema._parseSync({
          data: e,
          path: r.path,
          parent: r
        });
        return "aborted" === a.status ? Z : "dirty" === a.status || "dirty" === t.value ? N(a.value) : a;
      }
    }
    if ("refinement" === a.type) {
      let e = e => {
        let t = a.refinement(e, i);
        if (r.common.async) return Promise.resolve(t);
        if (t instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return e;
      };
      if (false === r.common.async) {
        let a = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return "aborted" === a.status ? Z : ("dirty" === a.status && t.dirty(), e(a.value), {
          status: t.value,
          value: a.value
        });
      }
      return this._def.schema._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      }).then(r => "aborted" === r.status ? Z : ("dirty" === r.status && t.dirty(), e(r.value).then(() => ({
        status: t.value,
        value: r.value
      }))));
    }
    if ("transform" === a.type) {
      if (false === r.common.async) {
        let e = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!B(e)) return Z;
        let s = a.transform(e.value, i);
        if (s instanceof Promise) throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return {
          status: t.value,
          value: s
        };
      }
      return this._def.schema._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      }).then(e => B(e) ? Promise.resolve(a.transform(e.value, i)).then(e => ({
        status: t.value,
        value: e
      })) : Z);
    }
    f.assertNever(a);
  }
};
Je.create = (e, t, r) => new Je({
  schema: e,
  typeName: nt.ZodEffects,
  effect: t,
  ...V(r)
});
Je.createWithPreprocess = (e, t, r) => new Je({
  schema: t,
  effect: {
    type: "preprocess",
    transform: e
  },
  typeName: nt.ZodEffects,
  ...V(r)
});
var Ge = class extends K {
  _parse(e) {
    return this._getType(e) === x.undefined ? q(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
Ge.create = (e, t) => new Ge({
  innerType: e,
  typeName: nt.ZodOptional,
  ...V(t)
});
var He = class extends K {
  _parse(e) {
    return this._getType(e) === x.null ? q(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
He.create = (e, t) => new He({
  innerType: e,
  typeName: nt.ZodNullable,
  ...V(t)
});
var Ye = class extends K {
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    let r = t.data;
    return t.parsedType === x.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
Ye.create = (e, t) => new Ye({
  innerType: e,
  typeName: nt.ZodDefault,
  defaultValue: "function" == typeof t.default ? t.default : () => t.default,
  ...V(t)
});
var Xe = class extends K {
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    let r = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    };
    let a = this._def.innerType._parse({
      data: r.data,
      path: r.path,
      parent: {
        ...r
      }
    });
    return F(a) ? a.then(e => ({
      status: "valid",
      value: "valid" === e.status ? e.value : this._def.catchValue({
        get error() {
          return new j(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: "valid" === a.status ? a.value : this._def.catchValue({
        get error() {
          return new j(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
};
Xe.create = (e, t) => new Xe({
  innerType: e,
  typeName: nt.ZodCatch,
  catchValue: "function" == typeof t.catch ? t.catch : () => t.catch,
  ...V(t)
});
var Qe = class extends K {
  _parse(e) {
    if (this._getType(e) !== x.nan) {
      let t = this._getOrReturnCtx(e);
      return M(t, {
        code: S.invalid_type,
        expected: x.nan,
        received: t.parsedType
      }), Z;
    }
    return {
      status: "valid",
      value: e.data
    };
  }
};
Qe.create = e => new Qe({
  typeName: nt.ZodNaN,
  ...V(e)
});
var et = Symbol("zod_brand");
var tt = class extends K {
  _parse(e) {
    let {
      ctx: t
    } = this._processInputParams(e);
    let r = t.data;
    return this._def.type._parse({
      data: r,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var rt = class e extends K {
  _parse(e) {
    let {
      status: t,
      ctx: r
    } = this._processInputParams(e);
    if (r.common.async) return (async () => {
      let e = await this._def.in._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return "aborted" === e.status ? Z : "dirty" === e.status ? (t.dirty(), N(e.value)) : this._def.out._parseAsync({
        data: e.value,
        path: r.path,
        parent: r
      });
    })();
    {
      let e = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return "aborted" === e.status ? Z : "dirty" === e.status ? (t.dirty(), {
        status: "dirty",
        value: e.value
      }) : this._def.out._parseSync({
        data: e.value,
        path: r.path,
        parent: r
      });
    }
  }
  static create(t, r) {
    return new e({
      in: t,
      out: r,
      typeName: nt.ZodPipeline
    });
  }
};
var at = class extends K {
  _parse(e) {
    let t = this._def.innerType._parse(e);
    let r = e => (B(e) && (e.value = Object.freeze(e.value)), e);
    return F(t) ? t.then(e => r(e)) : r(t);
  }
  unwrap() {
    return this._def.innerType;
  }
};
function it(e, t) {
  let r = "function" == typeof e ? e(t) : "string" == typeof e ? {
    message: e
  } : e;
  return "string" == typeof r ? {
    message: r
  } : r;
}
function st(e, t = {}, r) {
  return e ? Te.create().superRefine((a, i) => {
    let s = e(a);
    if (s instanceof Promise) return s.then(e => {
      if (!e) {
        let e = it(t, a);
        let s = e.fatal ?? r ?? true;
        i.addIssue({
          code: "custom",
          ...e,
          fatal: s
        });
      }
    });
    if (!s) {
      let e = it(t, a);
      let s = e.fatal ?? r ?? true;
      i.addIssue({
        code: "custom",
        ...e,
        fatal: s
      });
    }
  }) : Te.create();
}
at.create = (e, t) => new at({
  innerType: e,
  typeName: nt.ZodReadonly,
  ...V(t)
});
var nt;
var ot = {
  object: Ee.lazycreate
};
!function (e) {
  e.ZodString = "ZodString";
  e.ZodNumber = "ZodNumber";
  e.ZodNaN = "ZodNaN";
  e.ZodBigInt = "ZodBigInt";
  e.ZodBoolean = "ZodBoolean";
  e.ZodDate = "ZodDate";
  e.ZodSymbol = "ZodSymbol";
  e.ZodUndefined = "ZodUndefined";
  e.ZodNull = "ZodNull";
  e.ZodAny = "ZodAny";
  e.ZodUnknown = "ZodUnknown";
  e.ZodNever = "ZodNever";
  e.ZodVoid = "ZodVoid";
  e.ZodArray = "ZodArray";
  e.ZodObject = "ZodObject";
  e.ZodUnion = "ZodUnion";
  e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion";
  e.ZodIntersection = "ZodIntersection";
  e.ZodTuple = "ZodTuple";
  e.ZodRecord = "ZodRecord";
  e.ZodMap = "ZodMap";
  e.ZodSet = "ZodSet";
  e.ZodFunction = "ZodFunction";
  e.ZodLazy = "ZodLazy";
  e.ZodLiteral = "ZodLiteral";
  e.ZodEnum = "ZodEnum";
  e.ZodEffects = "ZodEffects";
  e.ZodNativeEnum = "ZodNativeEnum";
  e.ZodOptional = "ZodOptional";
  e.ZodNullable = "ZodNullable";
  e.ZodDefault = "ZodDefault";
  e.ZodCatch = "ZodCatch";
  e.ZodPromise = "ZodPromise";
  e.ZodBranded = "ZodBranded";
  e.ZodPipeline = "ZodPipeline";
  e.ZodReadonly = "ZodReadonly";
}(nt || (nt = {}));
var ct = (e, t = {
  message: `Input not instance of ${e.name}`
}) => st(t => t instanceof e, t);
var dt = _e.create;
var lt = fe.create;
var ut = Qe.create;
var ht = ge.create;
var mt = we.create;
var pt = ve.create;
var bt = xe.create;
var _t = ke.create;
var yt = Se.create;
var ft = Te.create;
var gt = je.create;
var wt = Ie.create;
var vt = Ce.create;
var xt = Re.create;
var kt = Ee.create;
var St = Ee.strictCreate;
var Tt = Ae.create;
var jt = Oe.create;
var It = Ze.create;
var Ct = Ne.create;
var Rt = qe.create;
var Pt = De.create;
var Et = Le.create;
var At = Be.create;
var Mt = Fe.create;
var Ot = Ue.create;
var $t = Ve.create;
var Zt = We.create;
var Nt = Ke.create;
var qt = Je.create;
var Dt = Ge.create;
var Lt = He.create;
var Bt = Je.createWithPreprocess;
var Ft = rt.create;
var Ut = () => dt().optional();
var zt = () => lt().optional();
var Vt = () => mt().optional();
var Wt = {
  string: e => _e.create({
    ...e,
    coerce: true
  }),
  number: e => fe.create({
    ...e,
    coerce: true
  }),
  boolean: e => we.create({
    ...e,
    coerce: true
  }),
  bigint: e => ge.create({
    ...e,
    coerce: true
  }),
  date: e => ve.create({
    ...e,
    coerce: true
  })
};
var Kt = Z;
var Jt = v.object({
  id: v.string(),
  description: v.string()
});
var Gt = v.object({
  browser: v.array(Jt).optional(),
  tab: v.array(Jt).optional()
});
var Ht = v.enum(["iab", "extension", "cdp", "mcpapps"]);
var Yt = v.string().trim().min(1);
var Xt = v.object({
  family: Yt.optional(),
  id: v.string(),
  name: v.string(),
  type: Ht,
  profileName: v.string().optional(),
  metadata: v.object({
    extensionInstanceId: v.string().optional(),
    codexSessionId: v.string().optional()
  }).optional()
});
var Qt = Xt.extend({
  apiSupportOverrides: v.record(v.boolean()).optional(),
  capabilities: Gt
});
var er = v.object({});
var tr = v.array(Xt);
var rr = "list_browsers";
function ar(e = {}) {
  return new _(rr, er, e);
}
var ir = {};
t(ir, {
  PayloadSchema: () => sr,
  ResultSchema: () => nr,
  commandType: () => or,
  create: () => cr
});
var sr = v.object({
  id: v.string()
});
var nr = Qt;
var or = "get_browser";
function cr(e) {
  return new _(or, sr, e);
}
var dr = {};
t(dr, {
  PayloadSchema: () => lr,
  ResultSchema: () => ur,
  commandType: () => hr,
  create: () => mr
});
var lr = v.object({});
var ur = Qt;
var hr = "get_default_browser";
function mr(e = {}) {
  return new _(hr, lr, e);
}
var pr = {};
t(pr, {
  PayloadSchema: () => br,
  ResultSchema: () => _r,
  commandType: () => yr,
  create: () => fr
});
var br = v.object({
  name: v.string()
});
var _r = v.string();
var yr = "get_documentation";
function fr(e) {
  return new _(yr, br, e);
}
var gr = {};
t(gr, {
  PayloadSchema: () => wr,
  ResultSchema: () => vr,
  commandType: () => xr,
  create: () => kr
});
var wr = v.object({
  browser_id: v.string()
});
var vr = v.string();
var xr = "get_browser_documentation";
function kr(e) {
  return new _(xr, wr, e);
}
var Sr = {};
t(Sr, {
  PayloadSchema: () => Tr,
  ResultSchema: () => jr,
  commandType: () => Ir,
  create: () => Cr
});
var Tr = v.object({
  url: v.string().url()
});
var jr = Qt;
var Ir = "get_browser_for_url";
function Cr(e) {
  return new _(Ir, Tr, e);
}
var Rr = {};
t(Rr, {
  PayloadSchema: () => Pr,
  ResultSchema: () => Er,
  commandType: () => Ar,
  create: () => Mr
});
var Pr = v.object({
  browser_id: v.string()
});
var Er = v.object({
  id: v.string()
});
var Ar = "create_tab";
function Mr(e) {
  return new _(Ar, Pr, e);
}
var Or = {};
t(Or, {
  PayloadSchema: () => $r,
  ResultSchema: () => Zr,
  commandType: () => Nr,
  create: () => qr
});
var $r = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Zr = v.object({
  id: v.string(),
  title: v.string().optional(),
  url: v.string().optional()
});
var Nr = "get_tab";
function qr(e) {
  return new _(Nr, $r, e);
}
var Dr = {};
t(Dr, {
  PayloadSchema: () => Lr,
  ResultSchema: () => Br,
  commandType: () => Fr,
  create: () => Ur
});
var Lr = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Br = v.object({});
var Fr = "close_tab";
function Ur(e) {
  return new _(Fr, Lr, e);
}
var zr = {};
t(zr, {
  MarkTabStatusSchema: () => Vr,
  PayloadSchema: () => Wr,
  ResultSchema: () => Kr,
  commandType: () => Jr,
  create: () => Gr
});
var Vr = v.enum(["handoff", "deliverable"]);
var Wr = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  status: Vr
});
var Kr = v.object({});
var Jr = "mark_tab";
function Gr(e) {
  return new _(Jr, Wr, e);
}
var Hr = {};
t(Hr, {
  PayloadSchema: () => Qr,
  ReasonSchema: () => Xr,
  ResultSchema: () => ea,
  commandType: () => Yr,
  create: () => ta
});
var Yr = "tab_manual_handoff_request";
var Xr = v.enum(["authentication", "captcha", "user_requested", "other"]);
var Qr = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  reason: Xr.optional()
});
var ea = v.object({});
function ta(e) {
  return new _(Yr, Qr, e);
}
var ra = {};
t(ra, {
  PayloadSchema: () => aa,
  ResultSchema: () => ia,
  commandType: () => sa,
  create: () => na
});
var aa = v.object({
  browser_id: v.string()
});
var ia = v.object({
  display_truncate_max_chars: v.number().int().positive().optional()
});
var sa = "runtime_config";
function na(e) {
  return new _(sa, aa, e);
}
var oa = {};
t(oa, {
  PayloadSchema: () => ca,
  ResultSchema: () => da,
  commandType: () => la,
  create: () => ua
});
var ca = v.object({
  browser_id: v.string(),
  name: v.string()
});
var da = v.object({});
var la = "name_session";
function ua(e) {
  return new _(la, ca, e);
}
var ha = {};
t(ha, {
  PayloadSchema: () => ma,
  ResultSchema: () => pa,
  commandType: () => ba,
  create: () => _a
});
var ma = v.object({
  browser_id: v.string()
});
var pa = v.object({
  id: v.string().optional()
});
var ba = "selected_tab";
function _a(e) {
  return new _(ba, ma, e);
}
var ya = {};
t(ya, {
  PayloadSchema: () => fa,
  ResultSchema: () => ga,
  commandType: () => wa,
  create: () => va
});
var fa = v.object({
  browser_id: v.string()
});
var ga = v.object({
  tabs: v.array(v.object({
    id: v.string(),
    providerTabId: v.string().optional(),
    url: v.string().optional(),
    title: v.string().optional()
  }))
});
var wa = "list_tabs";
function va(e) {
  return new _(wa, fa, e);
}
var xa = {};
t(xa, {
  ContentTypeSchema: () => ka,
  PayloadSchema: () => Sa,
  ResultSchema: () => Ta,
  commandType: () => ja,
  create: () => Ia
});
var ka = v.enum(["html", "text", "domSnapshot"]);
var Sa = v.object({
  browser_id: v.string(),
  urls: v.array(v.string()),
  content_type: ka,
  timeout_ms: v.number().int().positive().optional()
});
var Ta = v.object({
  results: v.array(v.object({
    url: v.string(),
    title: v.string().nullable(),
    content: v.string().nullable()
  }))
});
var ja = "tabs_content";
function Ia(e) {
  return new _(ja, Sa, e);
}
var Ca = {};
t(Ca, {
  PayloadSchema: () => Ea,
  ResultSchema: () => Aa,
  commandType: () => Ma,
  create: () => Oa
});
var Ra = v.object({
  readOnlyHint: v.boolean().optional(),
  untrustedContentHint: v.boolean().optional(),
  consequentialHint: v.boolean().optional()
});
var Pa = v.object({
  name: v.string(),
  call_name: v.string(),
  registration_id: v.string(),
  title: v.string().optional(),
  description: v.string().optional(),
  input_schema: v.unknown(),
  annotations: Ra.optional(),
  origin: v.string().optional(),
  pageUrl: v.string().optional()
});
var Ea = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Aa = v.object({
  tools: v.array(Pa)
});
var Ma = "webmcp_list_tools";
function Oa(e) {
  return new _(Ma, Ea, e);
}
var $a = {};
t($a, {
  PayloadSchema: () => Za,
  ResultSchema: () => Na,
  commandType: () => qa,
  create: () => Da
});
var Za = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  tool_name: v.string(),
  tool_description: v.string().optional(),
  tool_origin: v.string().optional(),
  tool_title: v.string().optional(),
  registration_id: v.string(),
  input: v.unknown(),
  timeout_ms: v.number().int().positive().optional()
});
var Na = v.object({
  result: v.unknown()
});
var qa = "webmcp_invoke_tool";
function Da(e) {
  return new _(qa, Za, e);
}
var La = {};
t(La, {
  PayloadSchema: () => Ba,
  ResultSchema: () => Fa,
  commandType: () => Ua,
  create: () => za
});
var Ba = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  url: v.string()
});
var Fa = v.object({});
var Ua = "navigate_tab_url";
function za(e) {
  return new _(Ua, Ba, e);
}
var Va = {};
t(Va, {
  PayloadSchema: () => Wa,
  ResultSchema: () => Ka,
  commandType: () => Ja,
  create: () => Ga
});
var Wa = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Ka = v.object({});
var Ja = "navigate_tab_back";
function Ga(e) {
  return new _(Ja, Wa, e);
}
var Ha = {};
t(Ha, {
  PayloadSchema: () => Ya,
  ResultSchema: () => Xa,
  commandType: () => Qa,
  create: () => ei
});
var Ya = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Xa = v.object({});
var Qa = "navigate_tab_forward";
function ei(e) {
  return new _(Qa, Ya, e);
}
var ti = {};
t(ti, {
  PayloadSchema: () => ri,
  ResultSchema: () => ai,
  commandType: () => ii,
  create: () => si
});
var ri = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var ai = v.object({});
var ii = "navigate_tab_reload";
function si(e) {
  return new _(ii, ri, e);
}
var ni = {};
t(ni, {
  PayloadSchema: () => oi,
  ResultSchema: () => ci,
  commandType: () => di,
  create: () => li
});
var oi = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var ci = v.object({
  id: v.string(),
  title: v.string().optional(),
  url: v.string().optional()
});
var di = "browser_user_claim_tab";
function li(e) {
  return new _(di, oi, e);
}
var ui = {};
t(ui, {
  PayloadSchema: () => hi,
  ResultSchema: () => mi,
  commandType: () => pi,
  create: () => bi
});
var hi = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var mi = v.discriminatedUnion("kind", [v.object({
  kind: v.literal("library_file"),
  libraryFileId: v.string().min(1),
  fileId: v.string().min(1),
  fileName: v.string(),
  mimeType: v.string(),
  title: v.string(),
  url: v.string()
}), v.object({
  kind: v.literal("text"),
  text: v.string(),
  title: v.string(),
  truncated: v.boolean(),
  url: v.string()
}), v.object({
  dataBase64: v.string(),
  fileName: v.string(),
  kind: v.literal("document"),
  mimeType: v.string(),
  title: v.string(),
  url: v.string()
})]);
var pi = "browser_user_get_tab_context";
function bi(e) {
  return new _(pi, hi, e);
}
var _i = {};
t(_i, {
  PayloadSchema: () => yi,
  ResultSchema: () => fi,
  commandType: () => gi,
  create: () => wi
});
var yi = v.object({
  browser_id: v.string()
});
var fi = v.object({
  tabs: v.array(v.object({
    id: v.string(),
    providerTabId: v.string().optional(),
    title: v.string().optional(),
    url: v.string().optional(),
    lastOpened: v.string().optional(),
    tabGroup: v.string().optional()
  }))
});
var gi = "browser_user_open_tabs";
function wi(e) {
  return new _(gi, yi, e);
}
var vi = {};
t(vi, {
  PayloadSchema: () => xi,
  ResultSchema: () => ki,
  commandType: () => Si,
  create: () => Ti
});
var xi = v.object({
  browser_id: v.string(),
  queries: v.array(v.string()).min(1).optional(),
  limit: v.number().int().positive().optional(),
  from: v.string().optional(),
  to: v.string().optional()
});
var ki = v.object({
  items: v.array(v.object({
    url: v.string(),
    title: v.string().optional(),
    dateVisited: v.string()
  }))
});
var Si = "browser_user_history";
function Ti(e) {
  return new _(Si, xi, e);
}
var ji = {};
t(ji, {
  LogLevelSchema: () => Ii,
  PayloadSchema: () => Ci,
  ResultSchema: () => Ri,
  commandType: () => Pi,
  create: () => Ei
});
var Ii = v.enum(["debug", "info", "log", "warn", "error"]);
var Ci = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  filter: v.string().optional(),
  levels: v.array(Ii).optional(),
  limit: v.number().int().positive().optional()
});
var Ri = v.object({
  logs: v.array(v.object({
    level: Ii,
    message: v.string(),
    timestamp: v.string(),
    url: v.string().optional()
  }))
});
var Pi = "tab_dev_logs";
function Ei(e) {
  return new _(Pi, Ci, e);
}
var Ai = {};
t(Ai, {
  JsDialogTypeSchema: () => Mi,
  PayloadSchema: () => $i,
  ResultDialogSchema: () => Oi,
  ResultSchema: () => Zi,
  commandType: () => Ni,
  create: () => qi
});
var Mi = v.enum(["alert", "beforeunload", "confirm", "prompt"]);
var Oi = v.object({
  id: v.string(),
  type: Mi
});
var $i = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Zi = v.object({
  dialog: Oi.nullable()
});
var Ni = "tab_get_js_dialog";
function qi(e) {
  return new _(Ni, $i, e);
}
var Di = {};
t(Di, {
  PayloadSchema: () => Li,
  ResultSchema: () => Bi,
  commandType: () => Fi,
  create: () => Ui
});
var Li = v.object({
  action: v.enum(["accept", "dismiss"]),
  browser_id: v.string(),
  dialog_id: v.string(),
  prompt_text: v.string().optional(),
  tab_id: v.string()
});
var Bi = v.object({});
var Fi = "tab_handle_js_dialog";
function Ui(e) {
  return new _(Fi, Li, e);
}
var zi = {};
t(zi, {
  PayloadSchema: () => Vi,
  ResultSchema: () => Wi,
  commandType: () => Ki,
  create: () => Ji
});
var Vi = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var Wi = v.object({
  path: v.string()
});
var Ki = "tab_content_export";
function Ji(e) {
  return new _(Ki, Vi, e);
}
var Gi = {};
t(Gi, {
  GSuiteExportTypeSchema: () => Hi,
  PayloadSchema: () => Yi,
  ResultSchema: () => Xi,
  commandType: () => Qi,
  create: () => es
});
var Hi = v.enum(["pdf", "md", "xlsx", "csv", "docx", "pptx"]);
var Yi = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  format: Hi
});
var Xi = v.object({
  path: v.string()
});
var Qi = "tab_content_export_gsuite";
function es(e) {
  return new _(Qi, Yi, e);
}
var ts = {};
t(ts, {
  PayloadSchema: () => rs,
  ResultSchema: () => as,
  commandType: () => is,
  create: () => ss
});
var rs = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var as = v.object({
  path: v.string()
});
var is = "tab_content_export_youtube_transcript";
function ss(e) {
  return new _(is, rs, e);
}
var ns = {};
t(ns, {
  PayloadSchema: () => os,
  ResultSchema: () => cs,
  commandType: () => ds,
  create: () => ls
});
var os = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var cs = v.object({
  text: v.string()
});
var ds = "tab_clipboard_read_text";
function ls(e) {
  return new _(ds, os, e);
}
var us = {};
t(us, {
  PayloadSchema: () => hs,
  ResultSchema: () => ms,
  commandType: () => ps,
  create: () => bs
});
var hs = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  text: v.string()
});
var ms = v.object({});
var ps = "tab_clipboard_write_text";
function bs(e) {
  return new _(ps, hs, e);
}
var _s = {};
t(_s, {
  PayloadSchema: () => gs,
  ResultSchema: () => ws,
  commandType: () => vs,
  create: () => xs
});
var ys = v.object({
  mime_type: v.string(),
  text: v.string().optional(),
  base64: v.string().optional()
}).superRefine((e, t) => {
  void 0 !== e.text === (void 0 !== e.base64) && t.addIssue({
    code: v.ZodIssueCode.custom,
    message: "Clipboard entries must set exactly one of text or base64"
  });
});
var fs = v.object({
  entries: v.array(ys),
  presentation_style: v.enum(["unspecified", "inline", "attachment"]).optional()
});
var gs = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var ws = v.object({
  items: v.array(fs)
});
var vs = "tab_clipboard_read";
function xs(e) {
  return new _(vs, gs, e);
}
var ks = {};
t(ks, {
  PayloadSchema: () => js,
  ResultSchema: () => Is,
  commandType: () => Cs,
  create: () => Rs
});
var Ss = v.object({
  mime_type: v.string(),
  text: v.string().optional(),
  base64: v.string().optional()
}).superRefine((e, t) => {
  void 0 !== e.text === (void 0 !== e.base64) && t.addIssue({
    code: v.ZodIssueCode.custom,
    message: "Clipboard entries must set exactly one of text or base64"
  });
});
var Ts = v.object({
  entries: v.array(Ss),
  presentation_style: v.enum(["unspecified", "inline", "attachment"]).optional()
});
var js = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  items: v.array(Ts)
});
var Is = v.object({});
var Cs = "tab_clipboard_write";
function Rs(e) {
  return new _(Cs, js, e);
}
var Ps = {};
t(Ps, {
  PayloadSchema: () => Es,
  ResultSchema: () => As,
  commandType: () => Ms,
  create: () => Os
});
var Es = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  fullPage: v.boolean().optional(),
  cropX: v.number().optional(),
  cropY: v.number().optional(),
  cropWidth: v.number().optional(),
  cropHeight: v.number().optional()
});
var As = v.object({
  data: v.string()
});
var Ms = "tab_screenshot";
function Os(e) {
  return new _(Ms, Es, e);
}
var $s = {};
t($s, {
  PayloadSchema: () => Zs,
  ResultSchema: () => Ns,
  commandType: () => qs,
  create: () => Ds
});
var Zs = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  content: v.enum(["axState", "screenshot", "axStateAndScreenshot"]),
  disable_diffing: v.boolean().optional()
});
var Ns = v.object({
  state: v.string().optional(),
  data: v.string().optional(),
  screenshot_unavailable: v.string().optional()
});
var qs = "tab_ax_get_state";
function Ds(e) {
  return new _(qs, Zs, e);
}
var Ls = {};
t(Ls, {
  ActionSchema: () => zs,
  PayloadSchema: () => Vs,
  ResultSchema: () => Ws,
  commandType: () => Ks,
  create: () => Js
});
var Bs = v.tuple([v.number(), v.number()]);
var Fs = v.number().int().nonnegative();
var Us = v.union([Fs, Bs]);
var zs = v.discriminatedUnion("kind", [v.object({
  kind: v.literal("paste"),
  element_index: Fs.nullable(),
  text: v.string(),
  format: v.enum(["text", "md", "html"]).optional()
}), v.object({
  kind: v.literal("click"),
  target: Us,
  mouse_button: v.enum(["left", "right", "middle", "l", "r", "m"]).optional(),
  click_count: v.number().int().positive().optional(),
  key: v.string().optional(),
  duration: v.number().finite().min(0).max(30).optional()
}), v.object({
  kind: v.literal("drag"),
  from: Bs,
  to: Bs
}), v.object({
  kind: v.literal("perform_secondary_action"),
  element_index: Fs,
  action: v.string()
}), v.object({
  kind: v.literal("press_key"),
  element_index: Fs.nullable(),
  key: v.string(),
  duration: v.number().finite().min(0).max(30).optional()
}), v.object({
  kind: v.literal("scroll"),
  target: Us,
  direction: v.enum(["up", "down", "left", "right", "u", "d", "l", "r"]),
  pages: v.number().optional()
}), v.object({
  kind: v.literal("select_text"),
  element_index: Fs,
  text: v.string(),
  prefix: v.string().optional(),
  suffix: v.string().optional(),
  selection_type: v.enum(["text", "cursor_before", "cursor_after"]).optional()
}), v.object({
  kind: v.literal("set_value"),
  element_index: Fs,
  value: v.string()
}), v.object({
  kind: v.literal("type_text"),
  element_index: Fs.nullable(),
  text: v.string()
})]);
var Vs = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  action: zs
});
var Ws = v.object({});
var Ks = "tab_ax_action";
function Js(e) {
  return new _(Ks, Vs, e);
}
var Gs = {};
t(Gs, {
  PayloadSchema: () => Hs,
  ResultSchema: () => Ys,
  commandType: () => Xs,
  create: () => Qs
});
var Hs = v.object({
  browser_id: v.string(),
  selector: v.string().optional(),
  selector_mode: v.literal("all").optional(),
  tab_id: v.string(),
  script: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Ys = v.object({
  value: v.unknown().optional()
});
var Xs = "playwright_evaluate";
function Qs(e) {
  return new _(Xs, Hs, e);
}
var en = {};
t(en, {
  PayloadSchema: () => tn,
  ResultSchema: () => rn,
  commandType: () => an,
  create: () => sn
});
var tn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  button: v.number().optional(),
  keys: v.array(v.string()).optional()
});
var rn = v.object({});
var an = "cua_click";
function sn(e) {
  return new _(an, tn, e);
}
var nn = {};
t(nn, {
  PayloadSchema: () => on,
  ResultSchema: () => cn,
  commandType: () => dn,
  create: () => ln
});
var on = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  timeout_ms: v.number().int().positive().optional()
});
var cn = v.object({});
var dn = "cua_download_media";
function ln(e) {
  return new _(dn, on, e);
}
var un = {};
t(un, {
  PayloadSchema: () => hn,
  ResultSchema: () => mn,
  commandType: () => pn,
  create: () => bn
});
var hn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  keys: v.array(v.string()).optional()
});
var mn = v.object({});
var pn = "cua_double_click";
function bn(e) {
  return new _(pn, hn, e);
}
var _n = {};
t(_n, {
  PayloadSchema: () => yn,
  ResultSchema: () => fn,
  commandType: () => gn,
  create: () => wn
});
var yn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  keys: v.array(v.string())
});
var fn = v.object({});
var gn = "cua_keypress";
function wn(e) {
  return new _(gn, yn, e);
}
var vn = {};
t(vn, {
  PayloadSchema: () => xn,
  ResultSchema: () => kn,
  commandType: () => Sn,
  create: () => Tn
});
var xn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  path: v.array(v.object({
    x: v.number(),
    y: v.number()
  })),
  keys: v.array(v.string()).optional()
});
var kn = v.object({});
var Sn = "cua_drag";
function Tn(e) {
  return new _(Sn, xn, e);
}
var jn = {};
t(jn, {
  PayloadSchema: () => In,
  ResultSchema: () => Cn,
  commandType: () => Rn,
  create: () => Pn
});
var In = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  keys: v.array(v.string()).optional()
});
var Cn = v.object({});
var Rn = "cua_move";
function Pn(e) {
  return new _(Rn, In, e);
}
var En = {};
t(En, {
  PayloadSchema: () => An,
  ResultSchema: () => Mn,
  commandType: () => On,
  create: () => $n
});
var An = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  scroll_x: v.number(),
  scroll_y: v.number(),
  keys: v.array(v.string()).optional()
});
var Mn = v.object({});
var On = "cua_scroll";
function $n(e) {
  return new _(On, An, e);
}
var Zn = {};
t(Zn, {
  PayloadSchema: () => Nn,
  ResultSchema: () => qn,
  commandType: () => Dn,
  create: () => Ln
});
var Nn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  text: v.string()
});
var qn = v.object({});
var Dn = "cua_type";
function Ln(e) {
  return new _(Dn, Nn, e);
}
var Bn = {};
t(Bn, {
  DomNodeIdSchema: () => Fn,
  PayloadSchema: () => Un,
  ResultSchema: () => zn,
  commandType: () => Vn,
  create: () => Wn
});
var Fn = v.string({
  required_error: "node_id is required",
  invalid_type_error: "node_id must be a string"
}).min(1, "node_id must not be empty");
var Un = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  node_id: Fn
});
var zn = v.object({});
var Vn = "dom_cua_click";
function Wn(e) {
  return new _(Vn, Un, e);
}
var Kn = {};
t(Kn, {
  PayloadSchema: () => Jn,
  ResultSchema: () => Gn,
  commandType: () => Hn,
  create: () => Yn
});
var Jn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  node_id: Fn,
  timeout_ms: v.number().int().positive().optional()
});
var Gn = v.object({});
var Hn = "dom_cua_download_media";
function Yn(e) {
  return new _(Hn, Jn, e);
}
var Xn = {};
t(Xn, {
  PayloadSchema: () => Qn,
  ResultSchema: () => eo,
  commandType: () => to,
  create: () => ro
});
var Qn = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  node_id: Fn
});
var eo = v.object({});
var to = "dom_cua_double_click";
function ro(e) {
  return new _(to, Qn, e);
}
var ao = {};
t(ao, {
  PayloadSchema: () => io,
  ResultSchema: () => so,
  commandType: () => no,
  create: () => oo
});
var io = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var so = v.unknown();
var no = "dom_cua_get_visible_dom";
function oo(e) {
  return new _(no, io, e);
}
var co = {};
t(co, {
  PayloadSchema: () => lo,
  ResultSchema: () => uo,
  commandType: () => ho,
  create: () => mo
});
var lo = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  keys: v.array(v.string())
});
var uo = v.object({});
var ho = "dom_cua_keypress";
function mo(e) {
  return new _(ho, lo, e);
}
var po = {};
t(po, {
  PayloadSchema: () => bo,
  ResultSchema: () => _o,
  commandType: () => yo,
  create: () => fo
});
var bo = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  scroll_x: v.number(),
  scroll_y: v.number(),
  node_id: Fn.optional()
});
var _o = v.object({});
var yo = "dom_cua_scroll";
function fo(e) {
  return new _(yo, bo, e);
}
var go = {};
t(go, {
  PayloadSchema: () => wo,
  ResultSchema: () => vo,
  commandType: () => xo,
  create: () => ko
});
var wo = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  text: v.string()
});
var vo = v.object({});
var xo = "dom_cua_type";
function ko(e) {
  return new _(xo, wo, e);
}
var So = {};
t(So, {
  PayloadSchema: () => To,
  ResultSchema: () => jo,
  commandType: () => Io,
  create: () => Co
});
var To = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  modifiers: v.array(v.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional(),
  button: v.enum(["left", "right", "middle"]).optional(),
  force: v.boolean().optional(),
  timeout_ms: v.number().int().positive().optional()
});
var jo = v.object({});
var Io = "playwright_locator_click";
function Co(e) {
  return new _(Io, To, e);
}
var Ro = {};
t(Ro, {
  PayloadSchema: () => Po,
  ResultSchema: () => Eo,
  commandType: () => Ao,
  create: () => Mo
});
var Po = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  modifiers: v.array(v.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional(),
  button: v.enum(["left", "right", "middle"]).optional(),
  force: v.boolean().optional(),
  timeout_ms: v.number().int().positive().optional()
});
var Eo = v.object({});
var Ao = "playwright_locator_dblclick";
function Mo(e) {
  return new _(Ao, Po, e);
}
var Oo = {};
t(Oo, {
  PayloadSchema: () => $o,
  ResultSchema: () => Zo,
  commandType: () => No,
  create: () => qo
});
var $o = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Zo = v.object({
  path: v.string()
});
var No = "playwright_locator_download_media";
function qo(e) {
  return new _(No, $o, e);
}
var Do = {};
t(Do, {
  PayloadSchema: () => Lo,
  ResultSchema: () => Bo,
  commandType: () => Fo,
  create: () => Uo
});
var Lo = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  value: v.string(),
  replace: v.boolean(),
  timeout_ms: v.number().int().positive().optional()
});
var Bo = v.object({});
var Fo = "playwright_locator_fill";
function Uo(e) {
  return new _(Fo, Lo, e);
}
var zo = {};
t(zo, {
  PayloadSchema: () => Vo,
  ResultSchema: () => Wo,
  commandType: () => Ko,
  create: () => Jo
});
var Vo = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  value: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Wo = v.object({});
var Ko = "playwright_locator_press";
function Jo(e) {
  return new _(Ko, Vo, e);
}
var Go = {};
t(Go, {
  PayloadSchema: () => Ho,
  ResultSchema: () => Yo,
  commandType: () => Xo,
  create: () => Qo
});
var Ho = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  value: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Yo = v.object({});
var Xo = "playwright_locator_press_sequentially";
function Qo(e) {
  return new _(Xo, Ho, e);
}
var ec = {};
t(ec, {
  PayloadSchema: () => tc,
  ResultSchema: () => rc,
  commandType: () => ac,
  create: () => ic
});
var tc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  state: v.enum(["attached", "detached", "visible", "hidden"]),
  timeout_ms: v.number().int().positive().optional()
});
var rc = v.object({});
var ac = "playwright_locator_wait_for";
function ic(e) {
  return new _(ac, tc, e);
}
var sc = {};
t(sc, {
  PayloadSchema: () => nc,
  ResultSchema: () => oc,
  commandType: () => cc,
  create: () => dc
});
var nc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string()
});
var oc = v.object({
  count: v.number().int()
});
var cc = "playwright_locator_count";
function dc(e) {
  return new _(cc, nc, e);
}
var lc = {};
t(lc, {
  PayloadSchema: () => hc,
  ResultSchema: () => mc,
  SelectOptionSchema: () => uc,
  commandType: () => pc,
  create: () => bc
});
var uc = v.object({
  value: v.string().optional(),
  label: v.string().optional(),
  index: v.number().int().nonnegative().optional()
}).superRefine((e, t) => {
  void 0 === e.value && void 0 === e.label && void 0 === e.index && t.addIssue({
    code: v.ZodIssueCode.custom,
    message: "Select option requires value, label, or index"
  });
});
var hc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  selections: v.array(uc).min(1),
  timeout_ms: v.number().int().positive().optional()
});
var mc = v.object({});
var pc = "playwright_locator_select_option";
function bc(e) {
  return new _(pc, hc, e);
}
var _c = {};
t(_c, {
  PayloadSchema: () => yc,
  ResultSchema: () => fc,
  commandType: () => gc,
  create: () => wc
});
var yc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  checked: v.boolean(),
  force: v.boolean().optional(),
  timeout_ms: v.number().int().positive().optional()
});
var fc = v.object({});
var gc = "playwright_locator_set_checked";
function wc(e) {
  return new _(gc, yc, e);
}
var vc = {};
t(vc, {
  PayloadSchema: () => xc,
  ResultSchema: () => kc,
  commandType: () => Sc,
  create: () => Tc
});
var xc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string()
});
var kc = v.object({
  value: v.boolean()
});
var Sc = "playwright_locator_is_visible";
function Tc(e) {
  return new _(Sc, xc, e);
}
var jc = {};
t(jc, {
  PayloadSchema: () => Ic,
  ResultSchema: () => Cc,
  commandType: () => Rc,
  create: () => Pc
});
var Ic = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string()
});
var Cc = v.object({
  value: v.boolean()
});
var Rc = "playwright_locator_is_enabled";
function Pc(e) {
  return new _(Rc, Ic, e);
}
var Ec = {};
t(Ec, {
  PayloadSchema: () => Ac,
  ResultSchema: () => Mc,
  commandType: () => Oc,
  create: () => $c
});
var Ac = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Mc = v.object({
  values: v.array(v.string())
});
var Oc = "playwright_locator_all_text_contents";
function $c(e) {
  return new _(Oc, Ac, e);
}
var Zc = {};
t(Zc, {
  PayloadSchema: () => Nc,
  ResultSchema: () => qc,
  commandType: () => Dc,
  create: () => Lc
});
var Nc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var qc = v.object({
  value: v.string().nullable()
});
var Dc = "playwright_locator_text_content";
function Lc(e) {
  return new _(Dc, Nc, e);
}
var Bc = {};
t(Bc, {
  PayloadSchema: () => Fc,
  ResultSchema: () => Uc,
  commandType: () => zc,
  create: () => Vc
});
var Fc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Uc = v.object({
  value: v.string()
});
var zc = "playwright_locator_inner_text";
function Vc(e) {
  return new _(zc, Fc, e);
}
var Wc = {};
t(Wc, {
  PayloadSchema: () => Kc,
  ResultSchema: () => Jc,
  commandType: () => Gc,
  create: () => Hc
});
var Kc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  name: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Jc = v.object({
  value: v.string().nullable()
});
var Gc = "playwright_locator_get_attribute";
function Hc(e) {
  return new _(Gc, Kc, e);
}
var Yc = {};
t(Yc, {
  PayloadSchema: () => Xc,
  ResultSchema: () => ed,
  commandType: () => td,
  create: () => rd
});
var Xc = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  selector: v.string(),
  relative_selector: v.string().optional(),
  timeout_ms: v.number().int().positive().optional()
});
var Qc = v.object({
  attributes: v.record(v.string()),
  inner_text: v.string(),
  text_content: v.string().nullable()
});
var ed = v.object({
  values: v.array(Qc.nullable())
});
var td = "playwright_locator_read_all";
function rd(e) {
  return new _(td, Xc, e);
}
var ad = {};
t(ad, {
  PayloadSchema: () => sd,
  ResultSchema: () => nd,
  commandType: () => od,
  create: () => cd
});
var id = v.enum(["load", "domcontentloaded", "networkidle", "commit"]);
var sd = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  url: v.string(),
  wait_until: id.optional(),
  timeout_ms: v.number().int().positive().optional()
});
var nd = v.object({
  url: v.string().optional()
});
var od = "playwright_wait_for_url";
function cd(e) {
  return new _(od, sd, e);
}
var dd = {};
t(dd, {
  LoadStateSchema: () => ld,
  PayloadSchema: () => ud,
  ResultSchema: () => hd,
  commandType: () => md,
  create: () => pd
});
var ld = v.enum(["load", "domcontentloaded", "networkidle"]);
var ud = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  state: ld.optional(),
  timeout_ms: v.number().int().positive().optional()
});
var hd = v.object({});
var md = "playwright_wait_for_load_state";
function pd(e) {
  return new _(md, ud, e);
}
var bd = {};
t(bd, {
  PayloadSchema: () => _d,
  ResultSchema: () => yd,
  commandType: () => fd,
  create: () => gd
});
var _d = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  timeout_ms: v.number().int().nonnegative()
});
var yd = v.object({});
var fd = "playwright_wait_for_timeout";
function gd(e) {
  return new _(fd, _d, e);
}
var wd = {};
t(wd, {
  PayloadSchema: () => vd,
  ResultSchema: () => xd,
  commandType: () => kd,
  create: () => Sd
});
var vd = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var xd = v.object({
  dom_snapshot: v.string()
});
var kd = "playwright_dom_snapshot";
function Sd(e) {
  return new _(kd, vd, e);
}
var Td = {};
t(Td, {
  PayloadSchema: () => Rd,
  ResultSchema: () => Pd,
  commandType: () => Ed,
  create: () => Ad
});
var jd = v.object({
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number()
});
var Id = v.object({
  primary: v.string().nullable().optional(),
  candidates: v.array(v.string()),
  frameSelectors: v.array(v.string()).optional()
});
var Cd = v.object({
  nodeId: v.number().int().positive().nullable().optional(),
  tagName: v.string(),
  role: v.string().nullable().optional(),
  visibleText: v.string().nullable().optional(),
  ariaName: v.string().nullable().optional(),
  testId: v.string().nullable().optional(),
  boundingBox: jd.nullable().optional(),
  preview: v.string(),
  selector: Id
});
var Rd = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  include_non_interactable: v.boolean().optional()
});
var Pd = v.array(Cd);
var Ed = "playwright_element_info";
function Ad(e) {
  return new _(Ed, Rd, e);
}
var Md = {};
t(Md, {
  PayloadSchema: () => Od,
  ResultSchema: () => $d,
  commandType: () => Zd,
  create: () => Nd
});
var Od = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  x: v.number(),
  y: v.number(),
  include_non_interactable: v.boolean().optional()
});
var $d = v.object({
  data: v.string()
});
var Zd = "playwright_element_screenshot";
function Nd(e) {
  return new _(Zd, Od, e);
}
var qd = {};
t(qd, {
  PayloadSchema: () => Dd,
  ResultSchema: () => Ld,
  commandType: () => Bd,
  create: () => Fd
});
var Dd = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Ld = v.object({
  download_id: v.string()
});
var Bd = "playwright_wait_for_download";
function Fd(e) {
  return new _(Bd, Dd, e);
}
var Ud = {};
t(Ud, {
  PayloadSchema: () => zd,
  ResultSchema: () => Vd,
  commandType: () => Wd,
  create: () => Kd
});
var zd = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  download_id: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Vd = v.object({
  path: v.string().nullable()
});
var Wd = "playwright_download_path";
function Kd(e) {
  return new _(Wd, zd, e);
}
var Jd = {};
t(Jd, {
  PayloadSchema: () => Gd,
  ResultSchema: () => Hd,
  commandType: () => Yd,
  create: () => Xd
});
var Gd = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  timeout_ms: v.number().int().positive().optional()
});
var Hd = v.object({
  file_chooser_id: v.string(),
  is_multiple: v.boolean()
});
var Yd = "playwright_wait_for_file_chooser";
function Xd(e) {
  return new _(Yd, Gd, e);
}
var Qd = {};
t(Qd, {
  PayloadSchema: () => el,
  ResultSchema: () => tl,
  commandType: () => rl,
  create: () => al
});
var el = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  file_chooser_id: v.string(),
  files: v.array(v.string()),
  timeout_ms: v.number().int().positive().optional()
});
var tl = v.object({});
var rl = "playwright_file_chooser_set_files";
function al(e) {
  return new _(rl, el, e);
}
var il = class {
  #e;
  #t;
  #r;
  constructor({
    createBrowser: e,
    onBrowserUsed: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async list() {
    return await this.#r.send({
      command: y.create()
    });
  }
  async get(e) {
    if (!e) throw new Error("browsers.get requires a browser id");
    let t = await this.#r.send({
      command: ir.create({
        id: e
      })
    });
    return this.#a(t);
  }
  async getDefault() {
    let e = await this.#r.send({
      command: dr.create()
    });
    return this.#a(e);
  }
  async getForUrl(e) {
    let t = await this.#r.send({
      command: Sr.create({
        url: e
      })
    });
    return this.#a(t);
  }
  #a(e) {
    return this.#t?.(e), this.#e({
      browserInfo: e,
      onBrowserUsed: () => this.#t?.(e),
      transport: this.#r
    });
  }
};
var sl = class {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async get(e) {
    return await this.#e.send({
      command: pr.create({
        name: e
      })
    });
  }
};
var nl = class {
  constructor({
    createBrowser: e,
    onBrowserUsed: t,
    transport: r
  }) {
    if (!r) throw new Error("Agent requires a transport instance");
    this.documentation = new sl(r);
    this.browsers = new il({
      createBrowser: e,
      onBrowserUsed: t,
      transport: r
    });
  }
};
var ol = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    createTab: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async new() {
    let e = await this.#r.send({
      command: Rr.create({
        browser_id: this.#e
      })
    });
    return this.#t(e);
  }
  async selected() {
    let e = await this.#r.send({
      command: ha.create({
        browser_id: this.#e
      })
    });
    if (e.id) return this.#t(e);
  }
  async list() {
    return (await this.#r.send({
      command: ya.create({
        browser_id: this.#e
      })
    })).tabs;
  }
  async content(e) {
    let t = xa.create({
      browser_id: this.#e,
      urls: e.urls,
      content_type: e.contentType,
      ...(void 0 === e.timeoutMs ? {} : {
        timeout_ms: e.timeoutMs
      })
    });
    return t.parse(), 0 === e.urls.length ? [] : (await this.#r.send({
      command: t
    })).results;
  }
  async get(e) {
    if (!e) throw new Error("tabs.get requires a tab id");
    let t = await this.#r.send({
      command: Or.create({
        browser_id: this.#e,
        tab_id: e
      })
    });
    return this.#t(t);
  }
};
var cl = () => `req-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
var dl = e => {
  let t = atob(e);
  let r = new Uint8Array(t.length);
  for (let e = 0; e < t.length; e += 1) r[e] = t.charCodeAt(e);
  return r;
};
var ll = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    createTab: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async openTabs() {
    return (await this.#r.send({
      command: _i.create({
        browser_id: this.#e
      })
    })).tabs;
  }
  async getTabContext(e) {
    let t = await this.#r.send({
      command: ui.create({
        browser_id: this.#e,
        tab_id: ul(e, "getTabContext")
      })
    });
    let r = ui.ResultSchema.parse(t);
    return "document" !== r.kind ? r : {
      data: dl(r.dataBase64),
      fileName: r.fileName,
      kind: r.kind,
      mimeType: r.mimeType,
      title: r.title,
      url: r.url
    };
  }
  async claimTab(e) {
    let t = ul(e, "claimTab");
    let r = await this.#r.send({
      command: ni.create({
        browser_id: this.#e,
        tab_id: t
      })
    });
    return this.#t(r);
  }
};
var ul = (e, t) => {
  if ("string" == typeof e) {
    if (0 === e.length) throw new Error(`browser.user.${t} received an empty tab id`);
    return e;
  }
  if (e && "object" == typeof e && "string" == typeof e.id) return e.id;
  throw new Error(`browser.user.${t} expects a tab returned by browser.user.openTabs() or a tab id`);
};
var hl = Object.getOwnPropertyDescriptor(RegExp.prototype, "source")?.get;
function ml(e) {
  if (null == e || "object" != typeof e || !hl) return false;
  try {
    return Reflect.apply(hl, e, []), true;
  } catch {
    return false;
  }
}
function pl(e) {
  if (null == e || "object" != typeof e) return false;
  let t = Object.getPrototypeOf(e);
  return null === t || null === Object.getPrototypeOf(t);
}
function bl(e, t) {
  if (null == e || "object" != typeof e) return false;
  try {
    return "message" in e && e.message === t;
  } catch {
    return false;
  }
}
function _l(e, t) {
  let r = e instanceof Error ? e.message : String(e);
  let a = new Error(`${r}\n${t}`);
  return e instanceof Error && e.stack && (a.stack = `${a.name}: ${a.message}\n${e.stack}`), a;
}
function yl(e, t) {
  let r = e instanceof Error ? e.message : String(e);
  return /strict mode violation/i.test(r) ? "multiple_matches" : /intercept|receives pointer events/i.test(r) ? "intercepted" : 0 === t.matchCount ? "no_matches" : 0 === t.visibleCount ? "no_visible_match" : "action_failed";
}
function fl(e, t) {
  let r = wl(t);
  if ("string" == typeof e) {
    if (0 === e.length) throw new Error("playwright.evaluate requires a pageFunction");
    return `const arg = ${r};\nreturn (${e});`;
  }
  if ("function" == typeof e) return [`const arg = ${r};`, `const __playwrightEvaluate = (${e.toString()});`, "return await __playwrightEvaluate(arg);"].join("\n");
  throw new Error("playwright.evaluate requires a string or function");
}
function gl(e, t, r) {
  let a = wl(t);
  let i = "all" === r ? "locator.evaluateAll" : "locator.evaluate";
  if ("string" == typeof e) {
    if (0 === e.length) throw new Error(`${i} requires a pageFunction`);
    return `const arg = ${a};\nreturn (${e});`;
  }
  if ("function" == typeof e) return [`const arg = ${a};`, `const __playwrightEvaluate = (${e.toString()});`, `return await __playwrightEvaluate(${"all" === r ? "elements" : "element"}, arg);`].join("\n");
  throw new Error(`${i} requires a string or function`);
}
function wl(e) {
  if (void 0 === e) return "undefined";
  try {
    let t = JSON.stringify(e);
    if (void 0 !== t) return t;
  } catch (e) {
    throw _l(e, "playwright.evaluate arg must be JSON-serializable");
  }
  throw new Error("playwright.evaluate arg must be JSON-serializable");
}
function vl(e, t) {
  let {
    x: r,
    y: a
  } = t;
  if (!Number.isFinite(r) || !Number.isFinite(a)) throw new Error(`${e} requires numeric x and y coordinates`);
  return {
    x: r,
    y: a
  };
}
var xl = Symbol("browserAuthSelectorDetails");
var kl = class e {
  #e;
  #t;
  #r;
  #a;
  #i;
  #s;
  #n;
  constructor({
    browserId: e,
    tabId: t,
    selector: r,
    transport: a,
    collectionReadCache: i,
    collectionReadIndex: s,
    collectionRelativeSelector: n
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
    this.#a = a;
    this.#i = i;
    this.#s = s;
    this.#n = n;
  }
  static browserAuthSelector(e) {
    return e[xl]();
  }
  [xl]() {
    return {
      browserId: this.#e,
      selector: this.#r,
      tabId: this.#t
    };
  }
  async click(e = {}) {
    try {
      await this.#a.send({
        command: So.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          modifiers: e.modifiers,
          button: e.button,
          force: e.force,
          timeout_ms: e.timeoutMs
        }),
        timeoutMs: e.timeoutMs
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "click", `waiting on click for selector ${this.#r}`);
    }
  }
  async dblclick(e = {}) {
    try {
      await this.#a.send({
        command: Ro.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          modifiers: e.modifiers,
          button: e.button,
          force: e.force,
          timeout_ms: e.timeoutMs
        }),
        timeoutMs: e.timeoutMs
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "dblclick", `waiting on dblclick for selector ${this.#r}`);
    }
  }
  async selectOption(e, {
    timeoutMs: t
  } = {}) {
    let r = function (e) {
      let t = Array.isArray(e) ? e : [e];
      if (!t.length) throw new Error("locator.selectOption requires at least one value");
      return t.map(e => {
        if ("string" == typeof e) return {
          value: e
        };
        if (!e || "object" != typeof e) throw new Error("locator.selectOption requires a string or { value?, label?, index? }");
        let t = {};
        if (void 0 !== e.value) {
          if ("string" != typeof e.value) throw new Error("locator.selectOption value must be a string");
          t.value = e.value;
        }
        if (void 0 !== e.label) {
          if ("string" != typeof e.label) throw new Error("locator.selectOption label must be a string");
          t.label = e.label;
        }
        if (void 0 !== e.index) {
          if (!Number.isInteger(e.index) || e.index < 0) throw new Error("locator.selectOption index must be a non-negative integer");
          t.index = e.index;
        }
        if (void 0 === t.value && void 0 === t.label && void 0 === t.index) throw new Error("locator.selectOption requires value, label, or index for each selection");
        return t;
      });
    }(e);
    try {
      await this.#a.send({
        command: lc.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          selections: r,
          timeout_ms: t
        }),
        timeoutMs: t
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "selectOption", `locator.selectOption failed for selector ${this.#r}`);
    }
  }
  async fill(e, {
    timeoutMs: t
  } = {}) {
    if (null == e) throw new Error("locator.fill requires a value");
    try {
      await this.#a.send({
        command: Do.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          value: e,
          replace: true,
          timeout_ms: t
        }),
        timeoutMs: t
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "fill", `locator.fill failed for selector ${this.#r}`);
    }
  }
  async type(e, {
    timeoutMs: t
  } = {}) {
    if (null == e) throw new Error("locator.type requires a value");
    try {
      await this.#a.send({
        command: Do.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          value: e,
          replace: false,
          timeout_ms: t
        }),
        timeoutMs: t
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "type", `locator.type failed for selector ${this.#r}`);
    }
  }
  async pressSequentially(e, t = {}) {
    if (null == e) throw new Error("locator.pressSequentially requires a value");
    try {
      await this.#a.send({
        command: Go.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          value: e,
          ...(null == t.timeoutMs ? {} : {
            timeout_ms: t.timeoutMs
          })
        }),
        timeoutMs: t.timeoutMs
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "pressSequentially", `locator.pressSequentially failed for selector ${this.#r}`);
    }
  }
  async press(e, {
    timeoutMs: t
  } = {}) {
    if (null == e) throw new Error("locator.press requires a value");
    try {
      await this.#a.send({
        command: zo.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          value: e,
          timeout_ms: t
        }),
        timeoutMs: t
      });
      this.#i?.clear();
    } catch (e) {
      throw await this.actionError(e, "press", `locator.press failed for selector ${this.#r}`);
    }
  }
  async setChecked(e, t = {}) {
    if ("boolean" != typeof e) throw new Error("locator.setChecked requires a boolean");
    try {
      await this.#a.send({
        command: _c.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          checked: e,
          force: t.force,
          timeout_ms: t.timeoutMs
        }),
        timeoutMs: t.timeoutMs
      });
      this.#i?.clear();
    } catch (t) {
      throw await this.actionError(t, "setChecked", `locator.setChecked(${e}) failed for selector ${this.#r}`);
    }
  }
  async check(e = {}) {
    await this.setChecked(true, e);
  }
  async uncheck(e = {}) {
    await this.setChecked(false, e);
  }
  async waitFor({
    state: e,
    timeoutMs: t
  }) {
    if (!e) throw new Error("locator.waitFor requires a state");
    try {
      await this.#a.send({
        command: ec.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          state: e,
          timeout_ms: t
        }),
        timeoutMs: t
      });
    } catch (t) {
      throw await this.actionError(t, "waitFor", `locator.waitFor(${e}) timed out for selector ${this.#r}`);
    }
  }
  async count() {
    return (await this.#a.send({
      command: sc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r
      })
    })).count;
  }
  async all() {
    let t = await this.count();
    let r = new Sl({
      browserId: this.#e,
      tabId: this.#t,
      selector: this.#r,
      transport: this.#a
    });
    return Array.from({
      length: t
    }, (t, a) => new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> nth=${a}`,
      transport: this.#a,
      collectionReadCache: r,
      collectionReadIndex: a
    }));
  }
  async textContent({
    timeoutMs: e
  } = {}) {
    let t = await this.cachedRead(e);
    return t ? t.text_content : (await this.#a.send({
      command: Zc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r,
        timeout_ms: e
      }),
      timeoutMs: e
    })).value;
  }
  async innerText({
    timeoutMs: e
  } = {}) {
    let t = await this.cachedRead(e);
    return t ? t.inner_text : (await this.#a.send({
      command: Bc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r,
        timeout_ms: e
      }),
      timeoutMs: e
    })).value;
  }
  async getAttribute(e, {
    timeoutMs: t
  } = {}) {
    if (!e) throw new Error("locator.getAttribute requires a name");
    let r = await this.cachedRead(t);
    return r ? Object.prototype.hasOwnProperty.call(r.attributes, e) ? r.attributes[e] ?? null : null : (await this.#a.send({
      command: Wc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r,
        name: e,
        timeout_ms: t
      }),
      timeoutMs: t
    })).value;
  }
  async isVisible() {
    return (await this.#a.send({
      command: vc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r
      })
    })).value;
  }
  async isEnabled() {
    return (await this.#a.send({
      command: jc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r
      })
    })).value;
  }
  async allTextContents({
    timeoutMs: e
  } = {}) {
    return (await this.#a.send({
      command: Ec.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r,
        timeout_ms: e
      }),
      timeoutMs: e
    })).values;
  }
  async evaluate(e, t, r) {
    return (await this.#a.send({
      command: Gs.create({
        browser_id: this.#e,
        script: gl(e, t),
        selector: this.#r,
        tab_id: this.#t,
        timeout_ms: r?.timeoutMs
      }),
      timeoutMs: r?.timeoutMs
    })).value;
  }
  async evaluateAll(e, t, r) {
    return (await this.#a.send({
      command: Gs.create({
        browser_id: this.#e,
        script: gl(e, t, "all"),
        selector: this.#r,
        selector_mode: "all",
        tab_id: this.#t,
        timeout_ms: r?.timeoutMs
      }),
      timeoutMs: r?.timeoutMs
    })).value;
  }
  async actionError(e, t, r) {
    try {
      let a = await this.evaluateAll(e => ({
        matchCount: e.length,
        visibleCount: e.reduce((e, t) => e + +(t.getClientRects().length > 0), 0),
        matches: e.slice(0, 5).map(e => ({
          tag: e.tagName.toLowerCase(),
          role: e.getAttribute("role"),
          type: e.getAttribute("type"),
          ariaLabel: e.getAttribute("aria-label"),
          text: e.textContent?.trim().slice(0, 120) ?? "",
          visible: e.getClientRects().length > 0,
          disabled: "disabled" in e && !!e.disabled
        }))
      }), void 0, {
        timeoutMs: 1e3
      });
      return _l(e, `${r}\nLocator diagnostics: ${JSON.stringify({
        kind: yl(e, a),
        action: t,
        locator: this.#r,
        ...a,
        truncated: a.matchCount > a.matches.length
      })}`);
    } catch {
      return _l(e, r);
    }
  }
  async downloadMedia({
    timeoutMs: e = 12e4
  } = {}) {
    try {
      let t = await this.#a.send({
        command: Oo.create({
          browser_id: this.#e,
          tab_id: this.#t,
          selector: this.#r,
          timeout_ms: e
        }),
        timeoutMs: e
      });
      return this.#i?.clear(), t.path;
    } catch (e) {
      throw await this.actionError(e, "downloadMedia", `locator.downloadMedia failed for selector ${this.#r}`);
    }
  }
  locator(t, r = {}) {
    if (!t) throw new Error("locator.locator requires a selector");
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${t}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, t) : void 0
    }).filter(r);
  }
  first() {
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> nth=0`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, "nth=0") : void 0
    });
  }
  last() {
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> nth=-1`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, "nth=-1") : void 0
    });
  }
  nth(t) {
    if ("number" != typeof t) throw new Error("locator.nth requires a numeric index");
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> nth=${t}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, `nth=${t}`) : void 0
    });
  }
  and(t) {
    if (!(t instanceof e)) throw new Error("locator.and requires a PlaywrightLocator");
    if (t.#e !== this.#e || t.#t !== this.#t) throw new Error("Locators must belong to the same tab");
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> internal:and=${JSON.stringify(t.#r)}`,
      transport: this.#a
    });
  }
  or(t) {
    if (!(t instanceof e)) throw new Error("locator.or requires a PlaywrightLocator");
    if (t.#e !== this.#e || t.#t !== this.#t) throw new Error("Locators must belong to the same tab");
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> internal:or=${JSON.stringify(t.#r)}`,
      transport: this.#a
    });
  }
  filter(t = {}) {
    let r = [this.#r];
    if (void 0 !== t.hasText && r.push(`internal:has-text=${Il(t.hasText, false)}`), void 0 !== t.hasNotText && r.push(`internal:has-not-text=${Il(t.hasNotText, false)}`), void 0 !== t.has && (this.assertCompatibleLocator(t.has, "locator.filter has"), r.push(`internal:has=${JSON.stringify(t.has.#r)}`)), void 0 !== t.hasNot && (this.assertCompatibleLocator(t.hasNot, "locator.filter hasNot"), r.push(`internal:has-not=${JSON.stringify(t.hasNot.#r)}`)), void 0 !== t.visible) {
      if ("boolean" != typeof t.visible) throw new Error("locator.filter visible must be a boolean");
      r.push(`visible=${t.visible}`);
    }
    let a = r.slice(1).join(" >> ");
    let i = this.#i && void 0 !== this.#s && (!a || void 0 !== this.#n);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: r.join(" >> "),
      transport: this.#a,
      collectionReadCache: i ? this.#i : void 0,
      collectionReadIndex: i ? this.#s : void 0,
      collectionRelativeSelector: i ? Tl(this.#n, a) : void 0
    });
  }
  getByRole(t, r = {}) {
    let a = Rl(t, r);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${a}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, a) : void 0
    });
  }
  getByText(t, r = {}) {
    let a = Pl(t, r);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${a}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, a) : void 0
    });
  }
  getByLabel(t, r = {}) {
    let a = El(t, r);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${a}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, a) : void 0
    });
  }
  getByPlaceholder(t, r = {}) {
    let a = Al(t, r);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${a}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, a) : void 0
    });
  }
  getByTestId(t) {
    let r = Ml(t);
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      selector: `${this.#r} >> ${r}`,
      transport: this.#a,
      collectionReadCache: this.#i,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#i && void 0 !== this.#s ? Tl(this.#n, r) : void 0
    });
  }
  async cachedRead(e) {
    return this.#i && void 0 !== this.#s ? await this.#i.read({
      index: this.#s,
      relativeSelector: this.#n,
      timeoutMs: e
    }) : null;
  }
  assertCompatibleLocator(t, r) {
    if (!(t instanceof e)) throw new Error(`${r} requires a PlaywrightLocator`);
    if (t.#e !== this.#e || t.#t !== this.#t) throw new Error("Locators must belong to the same tab");
  }
};
var Sl = class {
  #e;
  #t;
  #r;
  #a;
  #i = new Map();
  constructor({
    browserId: e,
    tabId: t,
    selector: r,
    transport: a
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
    this.#a = a;
  }
  clear() {
    this.#i.clear();
  }
  async read({
    index: e,
    relativeSelector: t,
    timeoutMs: r
  }) {
    let a = t ?? "";
    let i = this.#i.get(a);
    return i || (i = this.#s(t, r).catch(e => {
      throw this.#i.delete(a), e;
    }), this.#i.set(a, i)), (await i)[e] ?? null;
  }
  async #s(e, t) {
    return (await this.#a.send({
      command: Yc.create({
        browser_id: this.#e,
        tab_id: this.#t,
        selector: this.#r,
        relative_selector: e,
        timeout_ms: t
      }),
      timeoutMs: t
    })).values;
  }
};
function Tl(e, t) {
  return e ? t ? `${e} >> ${t}` : e : t || void 0;
}
function jl(e) {
  let t = e;
  return e.unicode || t.unicodeSets ? String(e) : String(e).replace(/(^|[^\\])(\\\\)*(["'`])/g, "$1$2\\\\$3").replace(/>>/g, "\\>\\>");
}
function Il(e, t) {
  return "string" != typeof e ? jl(e) : `${JSON.stringify(e)}${t ? "s" : "i"}`;
}
function Cl(e, t) {
  return "string" != typeof e ? jl(e) : `"${e.replace(/\\/g, "\\\\").replace(/["]/g, '\\"')}"${t ? "s" : "i"}`;
}
function Rl(e, t) {
  if (!e) throw new Error("getByRole requires a role");
  let r = [];
  return void 0 !== t.name && r.push(`[name=${Cl(t.name, !!t.exact)}]`), `internal:role=${e}${r.join("")}`;
}
function Pl(e, t) {
  if ("string" != typeof e && !ml(e)) throw new Error("getByText requires a string or RegExp");
  return `internal:text=${Il(e, !!t.exact)}`;
}
function El(e, t) {
  if ("string" != typeof e && !ml(e)) throw new Error("getByLabel requires a string or RegExp");
  return `internal:label=${Il(e, !!t.exact)}`;
}
function Al(e, t) {
  if ("string" != typeof e && !ml(e)) throw new Error("getByPlaceholder requires a string or RegExp");
  return `internal:attr=[placeholder=${Cl(e, !!t.exact)}]`;
}
function Ml(e) {
  if (!e) throw new Error("getByTestId requires a testId");
  return `internal:testid=[data-testid=${Cl(e, true)}]`;
}
var Ol = class e {
  #e;
  #t;
  #r;
  #a;
  constructor({
    browserId: e,
    tabId: t,
    frameSelector: r,
    transport: a
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
    this.#a = a;
  }
  locator(e) {
    if (!e) throw new Error("frameLocator.locator requires a selector");
    let t = `${this.#r} >> internal:control=enter-frame >> ${e}`;
    return new kl({
      browserId: this.#e,
      tabId: this.#t,
      selector: t,
      transport: this.#a
    });
  }
  frameLocator(t) {
    if (!t) throw new Error("frameLocator.frameLocator requires a selector");
    return new e({
      browserId: this.#e,
      tabId: this.#t,
      frameSelector: `${this.#r} >> internal:control=enter-frame >> ${t}`,
      transport: this.#a
    });
  }
  getByRole(e, t = {}) {
    return this.locator(Rl(e, t));
  }
  getByText(e, t = {}) {
    return this.locator(Pl(e, t));
  }
  getByLabel(e, t = {}) {
    return this.locator(El(e, t));
  }
  getByPlaceholder(e, t = {}) {
    return this.locator(Al(e, t));
  }
  getByTestId(e) {
    return this.locator(Ml(e));
  }
};
var $l = class {
  #e;
  #t;
  #r;
  #a;
  constructor({
    browserId: e,
    tabId: t,
    downloadId: r,
    transport: a
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
    this.#a = a;
  }
  async path({
    timeoutMs: e
  } = {}) {
    return (await this.#a.send({
      command: Ud.create({
        browser_id: this.#e,
        tab_id: this.#t,
        download_id: this.#r,
        timeout_ms: e
      }),
      timeoutMs: e
    })).path ?? null;
  }
};
var Zl = class {
  #e;
  #t;
  #r;
  #a;
  #i;
  constructor({
    browserId: e,
    tabId: t,
    fileChooserId: r,
    isMultiple: a,
    transport: i
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
    this.#a = a;
    this.#i = i;
  }
  isMultiple() {
    return this.#a;
  }
  async setFiles(e, {
    timeoutMs: t
  } = {}) {
    if (null == e) throw new Error("fileChooser.setFiles requires files");
    let r = Array.isArray(e) ? e : [e];
    if (!r.length) throw new Error("fileChooser.setFiles requires at least one file");
    try {
      await this.#i.send({
        command: Qd.create({
          browser_id: this.#e,
          tab_id: this.#t,
          file_chooser_id: this.#r,
          files: r,
          timeout_ms: t
        }),
        timeoutMs: t
      });
    } catch (e) {
      throw _l(e, "fileChooser.setFiles failed");
    }
  }
};
var Nl = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async goBack() {
    await this.#r.send({
      command: Va.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    });
  }
  async goForward() {
    await this.#r.send({
      command: Ha.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    });
  }
  async evaluate(e, t, r) {
    return (await this.#r.send({
      command: Gs.create({
        browser_id: this.#e,
        script: fl(e, t),
        tab_id: this.#t,
        timeout_ms: r?.timeoutMs
      }),
      timeoutMs: r?.timeoutMs
    })).value;
  }
  locator(e) {
    if (!e) throw new Error("playwright.locator requires a selector");
    return new kl({
      browserId: this.#e,
      tabId: this.#t,
      selector: e,
      transport: this.#r
    });
  }
  getByRole(e, t = {}) {
    return this.locator(Rl(e, t));
  }
  getByText(e, t = {}) {
    return this.locator(Pl(e, t));
  }
  getByLabel(e, t = {}) {
    return this.locator(El(e, t));
  }
  getByPlaceholder(e, t = {}) {
    return this.locator(Al(e, t));
  }
  getByTestId(e) {
    return this.locator(Ml(e));
  }
  frameLocator(e) {
    if (!e) throw new Error("playwright.frameLocator requires a selector");
    return new Ol({
      browserId: this.#e,
      tabId: this.#t,
      frameSelector: e,
      transport: this.#r
    });
  }
  async waitForURL(e, t = {}) {
    if (!e) throw new Error("playwright.waitForURL requires a url");
    await this.#r.send({
      command: ad.create({
        browser_id: this.#e,
        tab_id: this.#t,
        url: e,
        wait_until: t.waitUntil,
        timeout_ms: t.timeoutMs
      }),
      timeoutMs: t.timeoutMs
    });
  }
  async waitForLoadState(e = {}) {
    await this.#r.send({
      command: dd.create({
        browser_id: this.#e,
        tab_id: this.#t,
        state: e.state,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
  async waitForTimeout(e) {
    if (!Number.isInteger(e) || e < 0) throw new Error("playwright.waitForTimeout requires a non-negative integer");
    await this.#r.send({
      command: bd.create({
        browser_id: this.#e,
        tab_id: this.#t,
        timeout_ms: e
      }),
      timeoutMs: e + 2e3
    });
  }
  waitForEvent(e, t = {}) {
    let r = this.#a(e, t);
    return r.catch(() => {}), r;
  }
  async #a(e, t) {
    if ("download" === e) {
      let e = t.timeoutMs ?? 12e4;
      let r = await this.#r.send({
        command: qd.create({
          browser_id: this.#e,
          tab_id: this.#t,
          timeout_ms: e
        }),
        timeoutMs: e
      });
      return new $l({
        browserId: this.#e,
        tabId: this.#t,
        downloadId: r.download_id,
        transport: this.#r
      });
    }
    if ("filechooser" === e) {
      let e = await this.#r.send({
        command: Jd.create({
          browser_id: this.#e,
          tab_id: this.#t,
          timeout_ms: t.timeoutMs
        }),
        timeoutMs: t.timeoutMs
      });
      return new Zl({
        browserId: this.#e,
        tabId: this.#t,
        fileChooserId: e.file_chooser_id,
        isMultiple: e.is_multiple,
        transport: this.#r
      });
    }
    throw new Error("playwright.waitForEvent only supports 'download' and 'filechooser'");
  }
  async expectNavigation(e, t = {}) {
    let r = t.url ? this.waitForURL(t.url, {
      timeoutMs: t.timeoutMs,
      waitUntil: t.waitUntil
    }) : this.waitForLoadState({
      timeoutMs: t.timeoutMs,
      state: t.waitUntil
    });
    let a = Promise.resolve().then(e);
    let [i] = await Promise.all([a, r]);
    return i;
  }
  async elementInfo(e) {
    let t = vl("playwright.elementInfo", e);
    return await this.#r.send({
      command: Td.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: t.x,
        y: t.y,
        include_non_interactable: e.includeNonInteractable
      })
    });
  }
  async elementScreenshot(e) {
    let t = vl("playwright.elementScreenshot", e);
    let r = await this.#r.send({
      command: Md.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: t.x,
        y: t.y,
        include_non_interactable: e.includeNonInteractable
      })
    });
    return dl(r.data);
  }
  async domSnapshot() {
    return (await this.#r.send({
      command: wd.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    })).dom_snapshot;
  }
};
var ql = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async get_visible_dom() {
    return this.#r.send({
      command: ao.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    });
  }
  async click(e) {
    let t = Dl(e?.node_id, "dom_cua.click");
    await this.#r.send({
      command: Bn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        node_id: t
      })
    });
  }
  async double_click(e) {
    let t = Dl(e?.node_id, "dom_cua.double_click");
    await this.#r.send({
      command: Xn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        node_id: t
      })
    });
  }
  async scroll({
    node_id: e,
    x: t,
    y: r
  }) {
    if ("number" != typeof t || "number" != typeof r) throw new Error("dom_cua.scroll requires x and y numbers");
    let a = void 0 === e ? void 0 : Ll(e, "dom_cua.scroll");
    await this.#r.send({
      command: po.create({
        browser_id: this.#e,
        tab_id: this.#t,
        node_id: a,
        scroll_x: t,
        scroll_y: r
      })
    });
  }
  async type({
    text: e
  }) {
    if ("string" != typeof e) throw new Error("dom_cua.type requires text");
    await this.#r.send({
      command: go.create({
        browser_id: this.#e,
        tab_id: this.#t,
        text: e
      })
    });
  }
  async keypress(e) {
    if (!Array.isArray(e?.keys) || 0 === e.keys.length) throw new Error("dom_cua.keypress requires a non-empty keys array");
    await this.#r.send({
      command: co.create({
        browser_id: this.#e,
        tab_id: this.#t,
        keys: e.keys
      })
    });
  }
  async downloadMedia(e) {
    let t = Dl(e?.node_id, "dom_cua.downloadMedia");
    await this.#r.send({
      command: Kn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        node_id: t,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
};
function Dl(e, t) {
  if (void 0 === e) throw new Error(`${t} requires a node_id`);
  return Ll(e, t);
}
function Ll(e, t) {
  let r = Bn.DomNodeIdSchema.safeParse(e);
  if (!r.success) throw new Error(`${t} ${r.error.issues[0]?.message ?? "has an invalid node_id"}`);
  return r.data;
}
var Bl = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async click(e) {
    if ("number" != typeof e?.x || "number" != typeof e?.y) throw new Error("cua.click requires x and y");
    await this.#r.send({
      command: en.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: e.x,
        y: e.y,
        button: e.button,
        keys: e.keypress
      })
    });
  }
  async scroll(e) {
    if ("number" != typeof e?.x || "number" != typeof e?.y || "number" != typeof e?.scrollX || "number" != typeof e?.scrollY) throw new Error("cua.scroll requires x, y, scrollX, and scrollY");
    await this.#r.send({
      command: En.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: e.x,
        y: e.y,
        scroll_x: e.scrollX,
        scroll_y: e.scrollY,
        keys: e.keypress
      })
    });
  }
  async double_click(e) {
    if ("number" != typeof e?.x || "number" != typeof e?.y) throw new Error("cua.double_click requires x and y");
    await this.#r.send({
      command: un.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: e.x,
        y: e.y,
        keys: e.keypress
      })
    });
  }
  async type(e) {
    if ("string" != typeof e?.text) throw new Error("cua.type requires text");
    await this.#r.send({
      command: Zn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        text: e.text
      })
    });
  }
  async keypress(e) {
    if (!Array.isArray(e?.keys) || 0 === e.keys.length) throw new Error("cua.keypress requires a non-empty keys array");
    await this.#r.send({
      command: _n.create({
        browser_id: this.#e,
        tab_id: this.#t,
        keys: e.keys
      })
    });
  }
  async drag(e) {
    if (!Array.isArray(e?.path) || 0 === e.path.length || e.path.some(e => "number" != typeof e?.x || "number" != typeof e?.y)) throw new Error("cua.drag requires a non-empty path of {x, y} points");
    await this.#r.send({
      command: vn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        path: e.path,
        keys: e.keys
      })
    });
  }
  async move(e) {
    if ("number" != typeof e?.x || "number" != typeof e?.y) throw new Error("cua.move requires x and y");
    await this.#r.send({
      command: jn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: e.x,
        y: e.y,
        keys: e.keys
      })
    });
  }
  async downloadMedia(e) {
    if ("number" != typeof e?.x || "number" != typeof e?.y) throw new Error("cua.downloadMedia requires x and y");
    await this.#r.send({
      command: nn.create({
        browser_id: this.#e,
        tab_id: this.#t,
        x: e.x,
        y: e.y,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
};
var Fl = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async get(e = "state", t) {
    let r = await this.#a(e, t);
    switch (r.mode) {
      case "state":
        return r.state;
      case "screenshot":
        return r.screenshot;
      case "both":
        return void 0 === r.screenshot ? {
          state: r.state
        } : {
          state: r.state,
          screenshot: r.screenshot
        };
    }
  }
  async write(e = "state", t) {
    let r = await this.#a(e, t);
    "screenshot" !== r.mode && (await this.#r.display(r.state));
    "state" !== r.mode && void 0 !== r.screenshot && (await this.#r.display(r.screenshot));
  }
  async click(e, t) {
    await this.#i({
      kind: "click",
      target: e,
      ...(void 0 === t?.mouseButton ? {} : {
        mouse_button: t.mouseButton
      }),
      ...(void 0 === t?.clickCount ? {} : {
        click_count: t.clickCount
      }),
      ...(void 0 === t?.key ? {} : {
        key: t.key
      }),
      ...(void 0 === t?.duration ? {} : {
        duration: t.duration
      })
    });
  }
  async drag(e, t) {
    await this.#i({
      kind: "drag",
      from: e,
      to: t
    });
  }
  async paste(e, t, r) {
    await this.#i({
      kind: "paste",
      element_index: e,
      text: t,
      format: r?.format
    });
  }
  async performSecondaryAction(e, t) {
    await this.#i({
      kind: "perform_secondary_action",
      element_index: e,
      action: t
    });
  }
  async pressKey(e, t, r) {
    await this.#i({
      kind: "press_key",
      element_index: e,
      key: t,
      ...(void 0 === r?.duration ? {} : {
        duration: r.duration
      })
    });
  }
  async scroll(e, t, r) {
    await this.#i({
      kind: "scroll",
      target: e,
      direction: t,
      ...(void 0 === r ? {} : {
        pages: r
      })
    });
  }
  async selectText(e, t, r) {
    await this.#i({
      kind: "select_text",
      element_index: e,
      text: t,
      ...(void 0 === r?.prefix ? {} : {
        prefix: r.prefix
      }),
      ...(void 0 === r?.suffix ? {} : {
        suffix: r.suffix
      }),
      ...(void 0 === r?.selectionType ? {} : {
        selection_type: r.selectionType
      })
    });
  }
  async setValue(e, t) {
    await this.#i({
      kind: "set_value",
      element_index: e,
      value: t
    });
  }
  async typeText(e, t) {
    await this.#i({
      kind: "type_text",
      element_index: e,
      text: t
    });
  }
  async #a(e, t) {
    let r = await this.#r.send({
      command: $s.create({
        browser_id: this.#e,
        tab_id: this.#t,
        content: "state" === e ? "axState" : "screenshot" === e ? "screenshot" : "axStateAndScreenshot",
        ...(void 0 === t?.disableDiffing ? {} : {
          disable_diffing: t.disableDiffing
        })
      })
    });
    if ("state" === e) {
      if ("string" != typeof r.state) throw new Error("ax capture returned no accessibility state");
      return {
        mode: e,
        state: r.state
      };
    }
    if ("string" != typeof r.data) {
      if ("both" === e && "string" == typeof r.screenshot_unavailable && "string" == typeof r.state) return {
        mode: e,
        state: r.state
      };
      throw new Error("ax capture returned no screenshot data");
    }
    let a = dl(r.data);
    if ("screenshot" === e) return {
      mode: e,
      screenshot: a
    };
    if ("string" != typeof r.state) throw new Error("ax capture returned no accessibility state");
    return {
      mode: e,
      state: r.state,
      screenshot: a
    };
  }
  async #i(e) {
    await this.#r.send({
      command: Ls.create({
        browser_id: this.#e,
        tab_id: this.#t,
        action: e
      })
    });
  }
};
var Ul = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async export() {
    return (await this.#r.send({
      command: zi.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    })).path;
  }
  async exportGsuite(e) {
    return (await this.#r.send({
      command: Gi.create({
        browser_id: this.#e,
        tab_id: this.#t,
        format: e
      })
    })).path;
  }
  async exportYouTubeTranscript() {
    return (await this.#r.send({
      command: ts.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    })).path;
  }
};
var zl = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async readText() {
    return (await this.#r.send({
      command: ns.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    })).text;
  }
  async writeText(e) {
    if (null == e) throw new Error("tab.clipboard.writeText requires text");
    await this.#r.send({
      command: us.create({
        browser_id: this.#e,
        tab_id: this.#t,
        text: e
      })
    });
  }
  async read() {
    return (await this.#r.send({
      command: _s.create({
        browser_id: this.#e,
        tab_id: this.#t
      })
    })).items.map(e => ({
      entries: e.entries.map(e => ({
        mimeType: e.mime_type,
        text: e.text,
        base64: e.base64
      })),
      presentationStyle: e.presentation_style
    }));
  }
  async write(e) {
    if (!Array.isArray(e) || 0 === e.length) throw new Error("tab.clipboard.write requires at least one clipboard item");
    await this.#r.send({
      command: ks.create({
        browser_id: this.#e,
        tab_id: this.#t,
        items: e.map(e => ({
          presentation_style: e.presentationStyle,
          entries: e.entries.map(e => ({
            mime_type: e.mimeType,
            text: e.text,
            base64: e.base64
          }))
        }))
      })
    });
  }
};
var Vl = class {
  #e;
  #t;
  #r;
  constructor({
    browserId: e,
    tabId: t,
    transport: r
  }) {
    this.#e = e;
    this.#t = t;
    this.#r = r;
  }
  async logs(e = {}) {
    let t = Wl(e.filter);
    let r = Kl(e.levels);
    let a = Jl(e.limit);
    let i = {
      browser_id: this.#e,
      tab_id: this.#t,
      ...(void 0 !== t ? {
        filter: t
      } : {}),
      ...(void 0 !== r ? {
        levels: r
      } : {}),
      ...(void 0 !== a ? {
        limit: a
      } : {})
    };
    return (await this.#r.send({
      command: ji.create(i)
    })).logs;
  }
};
var Wl = e => {
  if (null != e) {
    if ("string" != typeof e) throw new Error("tab.dev.logs received an invalid filter");
    return e;
  }
};
var Kl = e => {
  if (null != e) {
    if (!Array.isArray(e) || 0 === e.length) throw new Error("tab.dev.logs received invalid levels");
    return e.map(e => {
      if ("warning" === e) return "warn";
      if (ji.LogLevelSchema.options.includes(e)) return e;
      throw new Error(`tab.dev.logs received invalid level "${String(e)}"`);
    });
  }
};
var Jl = e => {
  if (null != e) {
    if (!Number.isInteger(e) || e <= 0) throw new Error("tab.dev.logs received an invalid limit");
    return e;
  }
};
var Gl = class {
  constructor(e, t, r, a) {
    this.transport = e;
    this.browserId = t;
    this.documentationApi = r;
    this.info = a;
  }
  get id() {
    return this.info.id;
  }
  async documentation() {
    return await this.documentationApi.get(`capabilities/browser/${this.id}`);
  }
};
var Hl = class {
  constructor(e, t, r, a, i) {
    this.transport = e;
    this.browserId = t;
    this.tabId = r;
    this.documentationApi = a;
    this.info = i;
  }
  get id() {
    return this.info.id;
  }
  async documentation() {
    return await this.documentationApi.get(`capabilities/tab/${this.id}`);
  }
};
function Yl({
  capability: e,
  info: t,
  internalOnly: r
}) {
  return {
    capability: e,
    create: r => new e({
      ...r,
      info: t
    }),
    id: t.id,
    info: t,
    ...(null == r ? {} : {
      internalOnly: r
    })
  };
}
function Xl({
  capability: e,
  info: t,
  internalOnly: r
}) {
  return {
    capability: e,
    create: r => new e({
      ...r,
      info: t
    }),
    id: t.id,
    info: t,
    ...(null == r ? {} : {
      internalOnly: r
    })
  };
}
var Ql = class {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async get(e) {
    let t = this.#e[e];
    if (!t) throw new Error(`Capability is not available: ${e}`);
    return t;
  }
  async list() {
    return Object.values(this.#e).map(e => e.info);
  }
};
var eu = {};
t(eu, {
  Report: () => tu
});
var tu = {};
t(tu, {
  PayloadSchema: () => su,
  ResultSchema: () => nu,
  commandType: () => iu,
  create: () => ou
});
var ru = v.enum(["captcha_failed", "access_denied", "challenge_loop", "sign_in_blocked", "add_to_cart_blocked", "purchase_blocked", "unexpected_bot_error"]);
var au = v.object({
  reason: ru
});
var iu = "tab_bot_detection_report";
var su = au.extend({
  browser_id: v.string(),
  tab_id: v.string()
});
var nu = v.object({
  status: v.literal("reported"),
  hostname: v.string().nullable()
});
function ou(e) {
  return new _(iu, su, e);
}
var cu = class extends Hl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    tabId: a,
    transport: i
  }) {
    super(i, e, a, t, r);
  }
  async report(e) {
    let t = tu.PayloadSchema.parse({
      ...e,
      browser_id: this.browserId,
      tab_id: this.tabId
    });
    let r = await this.transport.send({
      command: tu.create(t)
    });
    return tu.ResultSchema.parse(r);
  }
};
var du = Xl({
  capability: cu,
  info: {
    id: "botDetection",
    description: "Use when the current tab is blocked by bot detection, a failed CAPTCHA, a hard access denial, or a repeated challenge/login loop."
  }
});
var lu = {};
t(lu, {
  Call: () => uu,
  Events: () => gu
});
var uu = {};
t(uu, {
  PayloadSchema: () => _u,
  ResultSchema: () => yu,
  commandType: () => bu,
  create: () => fu
});
var hu = v.object({
  session_id: v.string().min(1).optional(),
  target_id: v.string().min(1).optional()
}).refine(e => null == e.session_id != (null == e.target_id), "CDP target must provide exactly one of session_id or target_id.");
var mu = v.object({
  extensionId: v.string().optional(),
  sessionId: v.string().optional(),
  tabId: v.number().int().optional(),
  targetId: v.string().optional()
});
var pu = v.object({
  sequence: v.number().int().positive(),
  source: mu,
  method: v.string().min(1),
  params: v.record(v.string(), v.unknown()).optional()
});
var bu = "tab_cdp_call";
var _u = v.object({
  browser_id: v.string(),
  tab_id: v.string(),
  method: v.string().min(1),
  params: v.record(v.string(), v.unknown()).optional(),
  target: hu.optional(),
  timeout_ms: v.number().int().positive().optional()
});
var yu = v.unknown();
function fu(e) {
  return new _(bu, _u, e);
}
var gu = {};
t(gu, {
  PayloadSchema: () => vu,
  ResultSchema: () => xu,
  commandType: () => wu,
  create: () => ku
});
var wu = "tab_cdp_events";
var vu = v.object({
  after_sequence: v.number().int().nonnegative().optional(),
  browser_id: v.string(),
  limit: v.number().int().positive().max(1e3).optional(),
  methods: v.array(v.string().min(1)).min(1).optional(),
  tab_id: v.string(),
  target: hu.optional(),
  timeout_ms: v.number().int().nonnegative().optional()
});
var xu = v.object({
  cursor: v.number().int().nonnegative(),
  events: v.array(pu),
  hasMore: v.boolean(),
  truncated: v.boolean()
});
function ku(e) {
  return new _(wu, vu, e);
}
var Su = class extends Hl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    tabId: a,
    transport: i
  }) {
    super(i, e, a, t, r);
  }
  async send(e, t, r) {
    let a = await this.transport.send({
      command: uu.create({
        browser_id: this.browserId,
        method: e,
        params: t,
        tab_id: this.tabId,
        target: ju(r?.target),
        timeout_ms: r?.timeoutMs
      }),
      timeoutMs: r?.timeoutMs
    });
    return uu.ResultSchema.parse(a);
  }
  async readEvents(e) {
    let t = await this.transport.send({
      command: gu.create({
        after_sequence: e?.afterSequence,
        browser_id: this.browserId,
        limit: e?.limit,
        methods: e?.methods,
        tab_id: this.tabId,
        target: ju(e?.target),
        timeout_ms: e?.timeoutMs
      }),
      timeoutMs: Iu(e?.timeoutMs)
    });
    return gu.ResultSchema.parse(t);
  }
};
var Tu = Xl({
  capability: Su,
  info: {
    id: "cdp",
    description: "Send raw Chrome DevTools Protocol commands and read debugger events through a supported tab for developer use cases."
  }
});
function ju(e) {
  if (null != e) return {
    session_id: e.sessionId,
    target_id: e.targetId
  };
}
function Iu(e) {
  return null != e && e > 0 ? e + 2e3 : void 0;
}
var Cu = {};
t(Cu, {
  Handoff: () => Ru
});
var Ru = {};
t(Ru, {
  PayloadSchema: () => Nu,
  ResultSchema: () => Bu,
  SubmissionAttemptEventSchema: () => Du,
  SubmissionDiagnosticsSchema: () => Lu,
  SubmissionRejectionSchema: () => qu,
  commandType: () => Zu,
  create: () => Fu
});
var Pu = /^[A-Za-z0-9_-]{1,48}$/;
var Eu = new Set(["__proto__", "constructor", "prototype"]);
var Au = v.object({
  id: v.string().regex(Pu).refine(e => !Eu.has(e)),
  label: v.string(),
  type: v.string().min(1),
  autocomplete: v.string().nullable().optional(),
  required: v.boolean(),
  selector: v.string()
});
var Mu = v.object({
  selector: v.string(),
  action: v.enum(["click", "press_enter"])
});
var Ou = v.object({
  id: v.string().regex(Pu).refine(e => !Eu.has(e)),
  label: v.string().trim().min(1).max(120),
  selector: v.string().optional(),
  field_ids: v.array(v.string()).max(6).optional()
}).refine(e => null != e.selector != (e.field_ids?.length ?? 0) > 0, "browser auth options require either a selector or credential fields");
var $u = v.object({
  origin: v.string(),
  account_identifier: v.string().min(1).max(320).refine(e => e.trim().length > 0).optional(),
  fields: v.array(Au).max(6),
  options: v.array(Ou).min(2).max(10).optional(),
  qr_code: v.literal(true).optional(),
  submit: Mu.optional(),
  otpHandle: v.string().min(1).max(16384).optional()
}).refine(e => null == e.account_identifier || 1 === e.fields.length && "password" === e.fields[0]?.type && null == e.options && null == e.qr_code && null == e.otpHandle, "account_identifier is only supported for a password-only sign-in").refine(e => e.fields.length > 0 || null != e.options || true === e.qr_code, "browser auth requests require credential fields, sign-in options, or a QR code");
var Zu = "tab_browser_auth_handoff";
var Nu = $u.and(v.object({
  browser_id: v.string(),
  tab_id: v.string()
}));
var qu = v.object({
  outcome: v.enum(["origin_changed", "submission_failed"]),
  reason: v.enum(["request_url_invalid", "request_scheme", "request_origin", "paused_iframe", "iframe_origin", "child_frame_origin", "other"]),
  request_class: v.enum(["main_document", "background", "other"]),
  submission_phase: v.enum(["pending", "settled", "not_applicable"])
});
var Du = v.object({
  sequence: v.number().int().min(0).max(65535),
  kind: v.enum(["prompt_completed", "field_fill_started", "field_fill_completed", "field_fill_uncertain", "url_changed", "document_changed", "frame_changed", "reinspection_started", "reinspection_succeeded", "reinspection_failed", "site_request", "site_navigation", "site_submission_verified", "submit_started", "attempt_completed"]),
  phase: v.enum(["prompt", "filling", "before_submit", "submitting", "settled"]),
  field_index: v.number().int().min(0).max(63).optional(),
  reinspection: v.number().int().min(1).max(3).optional(),
  outcome: v.enum(["submitted", "unavailable", "origin_changed", "page_changed", "locator_invalid", "submission_failed", "prompt_changed"]).optional(),
  request_class: v.enum(["main_document", "background"]).optional(),
  method: v.enum(["get", "post", "other"]).optional(),
  origin_relation: v.enum(["same", "cross", "other"]).optional()
});
var Lu = v.object({
  schema_version: v.literal(1),
  request_id: v.string().uuid(),
  submission_mode: v.enum(["ordinary", "private"]),
  first_rejection: qu.optional(),
  terminal_rejection: qu.optional(),
  attempt_events: v.array(Du).max(64).optional(),
  dropped_attempt_events: v.number().int().min(0).max(65535).optional()
});
var Bu = v.object({
  status: v.enum(["submitted", "declined", "cancelled", "unavailable", "expired", "origin_changed", "page_changed", "locator_invalid", "submission_failed"]),
  locator_error: v.object({
    field_id: v.string(),
    reason: v.literal("not_user_visible")
  }).optional(),
  selected_option: v.string().optional(),
  reason: v.literal("user_took_over").optional(),
  submission_diagnostics: Lu.optional()
});
function Fu(e) {
  return new _(Zu, Nu, e);
}
var Uu = class extends Hl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    tabId: a,
    transport: i
  }) {
    super(i, e, a, t, r);
  }
  async request(e) {
    let t = function (e, t) {
      let r = {
        origin: e.origin,
        account_identifier: e.account_identifier,
        otpHandle: e.otpHandle,
        fields: e.fields.map(e => {
          let r = {
            id: e.id,
            label: e.label,
            type: e.type,
            required: e.required,
            selector: Vu(e.selector, t)
          };
          return void 0 !== e.autocomplete && (r.autocomplete = e.autocomplete), r;
        }),
        ...(true === e.qr_code ? {
          qr_code: true
        } : {})
      };
      return null != e.options && (r.options = e.options.map(e => ({
        id: e.id,
        label: e.label,
        ...(null == e.field_ids ? {} : {
          field_ids: e.field_ids
        }),
        ...(null == e.selector ? {} : {
          selector: Vu(e.selector, t)
        })
      }))), null != e.submit && (r.submit = {
        action: e.submit.action,
        selector: Vu(e.submit.selector, t)
      }), r;
    }(e, {
      browserId: this.browserId,
      tabId: this.tabId
    });
    let r = Ru.create({
      ...t,
      browser_id: this.browserId,
      tab_id: this.tabId
    });
    r.parse();
    let a = await this.transport.send({
      command: r
    });
    return Ru.ResultSchema.parse(a);
  }
};
var zu = Xl({
  capability: Uu,
  info: {
    id: "browserAuth",
    description: "MUST read its documentation before the first interaction with any authentication or sign-in flow required for the task. Covers method selection, secure user-provided credentials, and post-authentication verification and recovery."
  }
});
function Vu(e, t) {
  if ("string" == typeof e) return e;
  if (!(e instanceof kl)) throw new Error("browserAuth selector must be a string or PlaywrightLocator");
  let r = kl.browserAuthSelector(e);
  if (r.browserId !== t.browserId || r.tabId !== t.tabId) throw new Error("browserAuth selector locator must belong to this tab");
  return r.selector;
}
var Wu = {};
t(Wu, {
  Bundle: () => Ku,
  List: () => ch
});
var Ku = {};
t(Ku, {
  PayloadSchema: () => sh,
  ResultSchema: () => nh,
  commandType: () => ih,
  create: () => oh
});
var Ju = v.enum(["font", "image", "script", "stylesheet", "video", "other"]);
var Gu = v.enum(["font", "image", "stylesheet", "video"]);
var Hu = v.object({
  kind: v.enum(["attribute", "computedStyle", "resource"]),
  nodeId: v.number().int().positive().optional(),
  property: v.string().optional()
});
var Yu = v.object({
  id: v.string(),
  kind: Ju,
  name: v.string(),
  sources: v.array(Hu),
  url: v.string()
});
var Xu = v.object({
  id: v.string(),
  markup: v.string(),
  name: v.string()
});
var Qu = v.object({
  assets: v.array(Yu),
  id: v.string(),
  inlineSvgs: v.array(Xu),
  pageUrl: v.string().nullable(),
  summary: v.object({
    byKind: v.record(Ju, v.number().int().nonnegative()),
    inlineSvgCount: v.number().int().nonnegative(),
    totalCount: v.number().int().nonnegative()
  })
});
var eh = v.object({
  assetIds: v.array(v.string()).optional(),
  inventoryId: v.string(),
  kinds: v.array(Gu).optional()
});
var th = v.object({
  contentType: v.string().nullable(),
  id: v.string(),
  kind: Gu,
  name: v.string(),
  path: v.string(),
  url: v.string()
});
var rh = v.object({
  contentType: v.string().nullable(),
  id: v.string(),
  name: v.string(),
  reason: v.string(),
  url: v.string()
});
var ah = v.object({
  assets: v.array(th),
  directoryPath: v.string(),
  failures: v.array(rh),
  manifestPath: v.string(),
  summary: v.object({
    downloadedCount: v.number().int().nonnegative(),
    elapsedMs: v.number().nonnegative(),
    failedCount: v.number().int().nonnegative(),
    requestedCount: v.number().int().nonnegative()
  })
});
var ih = "tab_page_assets_bundle";
var sh = eh.extend({
  browser_id: v.string(),
  tab_id: v.string()
});
var nh = ah;
function oh(e) {
  return new _(ih, sh, e);
}
var ch = {};
t(ch, {
  PayloadSchema: () => lh,
  ResultSchema: () => uh,
  commandType: () => dh,
  create: () => hh
});
var dh = "tab_page_assets_list";
var lh = v.object({
  browser_id: v.string(),
  tab_id: v.string()
});
var uh = Qu;
function hh(e) {
  return new _(dh, lh, e);
}
var mh = class extends Hl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    tabId: a,
    transport: i
  }) {
    super(i, e, a, t, r);
  }
  async list() {
    let e = await this.transport.send({
      command: ch.create({
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    });
    return ch.ResultSchema.parse(e);
  }
  async bundle(e) {
    let t = await this.transport.send({
      command: Ku.create({
        ...e,
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    });
    return Ku.ResultSchema.parse(t);
  }
};
var ph = Xl({
  capability: mh,
  info: {
    id: "pageAssets",
    description: "List assets already observed in the current page state and bundle selected assets into a temporary local artifact."
  }
});
var bh = {
  id: "webmcp",
  description: "Fetch page-defined WebMCP tools bound to the current document, then call them through the returned object."
};
function _h(e) {
  return {
    name: e.name,
    call_name: e.call_name,
    ...(null == e.title ? {} : {
      title: e.title
    }),
    ...(null == e.description ? {} : {
      description: e.description
    }),
    inputSchema: e.input_schema,
    ...(null == e.annotations ? {} : {
      annotations: e.annotations
    }),
    ...(null == e.origin ? {} : {
      origin: e.origin
    }),
    ...(null == e.pageUrl ? {} : {
      pageUrl: e.pageUrl
    })
  };
}
var yh = class extends Hl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    tabId: a,
    transport: i
  }) {
    super(i, e, a, t, r);
  }
  async fetchTools() {
    let e = Ca.ResultSchema.parse(await this.transport.send({
      command: Ca.create({
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    }));
    let t = e.tools.map(_h);
    let r = new Map(e.tools.map(e => [e.call_name, e]));
    let a = function (e) {
      return 0 === e.length ? "No WebMCP tools are available in this document." : ["WebMCP tools available in this document:", JSON.stringify(e.map(({
        call_name: e,
        ...t
      }) => ({
        ...t,
        name: e
      })), null, 2), "Call tools.call(name, input) to invoke one."].join("\n");
    }(t);
    return Object.freeze({
      description: () => a,
      call: async (e, t, a) => {
        let i = e.trim();
        let s = r.get(i);
        if (null == s) throw new Error(`WebMCP tool ${JSON.stringify(i)} is not available in this snapshot. Call fetchTools() again.`);
        return (await this.transport.send({
          command: $a.create({
            browser_id: this.browserId,
            tab_id: this.tabId,
            tool_name: s.name,
            tool_description: s.description,
            tool_title: s.title,
            registration_id: s.registration_id,
            input: t,
            ...(null == a?.timeoutMs ? {} : {
              timeout_ms: a.timeoutMs
            })
          })
        })).result;
      }
    });
  }
};
var fh = Xl({
  capability: yh,
  info: bh
});
var gh = [Tu, du, zu, ph, fh];
var wh = function (e) {
  return new Map(e.map(e => [e.id, e.create]));
}(gh);
var vh = class {
  constructor({
    browserId: e,
    dialogId: t,
    tabId: r,
    transport: a,
    type: i
  }) {
    this.browserId = e;
    this.dialogId = t;
    this.tabId = r;
    this.transport = a;
    this.type = i;
  }
  async dismiss() {
    await this.transport.send({
      command: Di.create({
        action: "dismiss",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        tab_id: this.tabId
      })
    });
  }
};
var xh = class extends vh {
  constructor(e) {
    super({
      ...e,
      type: "alert"
    });
  }
};
var kh = class extends vh {
  constructor(e) {
    super({
      ...e,
      type: "beforeunload"
    });
  }
};
var Sh = class extends vh {
  constructor(e) {
    super({
      ...e,
      type: "confirm"
    });
  }
  async accept() {
    await this.transport.send({
      command: Di.create({
        action: "accept",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        tab_id: this.tabId
      })
    });
  }
};
var Th = class extends vh {
  constructor(e) {
    super({
      ...e,
      type: "prompt"
    });
  }
  async accept(e) {
    if ("string" != typeof e) throw new Error("prompt.accept requires text");
    await this.transport.send({
      command: Di.create({
        action: "accept",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        prompt_text: e,
        tab_id: this.tabId
      })
    });
  }
};
var jh = class {
  #e;
  #t;
  constructor({
    browserId: e,
    capabilities: t,
    documentation: r,
    transport: a,
    tabPayload: i = {}
  }) {
    if (!i.id) throw new Error("Tab requires an id");
    this.#e = e;
    this.#t = a;
    this.id = i.id;
    this.playwright = new Nl({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.dom_cua = new ql({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.cua = new Bl({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.ax = new Fl({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.content = new Ul({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.clipboard = new zl({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.dev = new Vl({
      browserId: e,
      tabId: this.id,
      transport: this.#t
    });
    this.capabilities = (({
      browserId: e,
      capabilities: t,
      documentation: r,
      tabId: a,
      transport: i
    }) => {
      let s = {};
      for (let n of t ?? []) {
        let t = wh.get(n.id);
        null != t && Object.assign(s, {
          [n.id]: t({
            browserId: e,
            documentation: r,
            info: n,
            tabId: a,
            transport: i
          })
        });
      }
      return new Ql(s);
    })({
      browserId: this.#e,
      capabilities: t,
      documentation: r,
      tabId: this.id,
      transport: this.#t
    });
  }
  async goto(e) {
    if (!e) throw new Error("tab.goto requires a url");
    if (this.#a(), !this.id) throw new Error("tab.goto requires a tab id");
    await this.#t.send({
      command: La.create({
        browser_id: this.#e,
        tab_id: this.id,
        url: e
      })
    });
  }
  async markHandoff() {
    await this.#r("handoff");
  }
  async markDeliverable() {
    await this.#r("deliverable");
  }
  async requestManualHandoff() {
    return this.requestUserTakeover();
  }
  async requestUserTakeover(e) {
    await this.#t.send({
      command: Hr.create({
        browser_id: this.#e,
        tab_id: this.id,
        reason: e
      })
    });
  }
  async back() {
    this.#a();
    await this.#t.send({
      command: Va.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async forward() {
    this.#a();
    await this.#t.send({
      command: Ha.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async reload() {
    this.#a();
    await this.#t.send({
      command: ti.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async close() {
    this.#a();
    await this.#t.send({
      command: Dr.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async screenshot(e = {}) {
    this.#a();
    let t = {
      browser_id: this.#e,
      tab_id: this.id,
      fullPage: e.fullPage
    };
    if (e.clip) {
      let {
        x: r,
        y: a,
        width: i,
        height: s
      } = e.clip;
      if ("number" != typeof r || "number" != typeof a || "number" != typeof i || "number" != typeof s) throw new Error("tab.screenshot clip requires x, y, width, and height");
      t.cropX = r;
      t.cropY = a;
      t.cropWidth = i;
      t.cropHeight = s;
    }
    let r = await this.#t.send({
      command: Ps.create(t)
    });
    return dl(r.data);
  }
  async title() {
    return (await this.#i()).title;
  }
  async url() {
    return (await this.#i()).url;
  }
  async getJsDialog() {
    this.#a();
    let e = (await this.#t.send({
      command: Ai.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    })).dialog;
    if (null != e) return function ({
      browserId: e,
      dialogId: t,
      tabId: r,
      transport: a,
      type: i
    }) {
      switch (i) {
        case "alert":
          return new xh({
            browserId: e,
            dialogId: t,
            tabId: r,
            transport: a
          });
        case "beforeunload":
          return new kh({
            browserId: e,
            dialogId: t,
            tabId: r,
            transport: a
          });
        case "confirm":
          return new Sh({
            browserId: e,
            dialogId: t,
            tabId: r,
            transport: a
          });
        case "prompt":
          return new Th({
            browserId: e,
            dialogId: t,
            tabId: r,
            transport: a
          });
      }
    }({
      browserId: this.#e,
      dialogId: e.id,
      tabId: this.id,
      transport: this.#t,
      type: e.type
    });
  }
  async #r(e) {
    this.#a();
    await this.#t.send({
      command: zr.create({
        browser_id: this.#e,
        tab_id: this.id,
        status: e
      })
    });
  }
  #a() {
    if (!this.#t) throw new Error("Tab is not bound to a transport");
  }
  async #i() {
    return this.#a(), await this.#t.send({
      command: Or.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
};
var Ih = {};
t(Ih, {
  Call: () => Ch,
  GetAuditTrail: () => Mh,
  commands: () => Dh
});
var Ch = {};
t(Ch, {
  PayloadSchema: () => Ph,
  ResultSchema: () => Eh,
  commandType: () => Rh,
  create: () => Ah
});
var Rh = "browser_management_call";
var Ph = v.object({
  args: v.array(v.unknown()),
  browser_id: v.string(),
  method: v.string(),
  namespace: v.string()
});
var Eh = v.object({
  value: v.unknown()
});
function Ah(e) {
  return new _(Rh, Ph, e);
}
var Mh = {};
t(Mh, {
  AuditChangeSchema: () => Zh,
  PayloadSchema: () => $h,
  ResultSchema: () => Nh,
  commandType: () => Oh,
  create: () => qh
});
var Oh = "browser_management_get_audit_trail";
var $h = Ph.pick({
  browser_id: true
});
var Zh = Ph.omit({
  browser_id: true
}).extend({
  before: v.object({
    bookmarks: v.array(v.object({
      id: v.string(),
      index: v.number().optional(),
      parentId: v.string().optional(),
      title: v.string(),
      url: v.string().optional()
    })),
    tabLayout: v.object({
      groups: v.array(v.object({
        collapsed: v.boolean(),
        color: v.string(),
        id: v.number(),
        title: v.string().optional(),
        windowId: v.number()
      })),
      tabs: v.array(v.object({
        autoDiscardable: v.boolean(),
        groupId: v.number(),
        id: v.number(),
        index: v.number(),
        pinned: v.boolean(),
        url: v.string().optional(),
        windowId: v.number()
      }))
    }),
    windows: v.array(v.object({
      focused: v.boolean(),
      height: v.number().optional(),
      id: v.number(),
      left: v.number().optional(),
      state: v.string().optional(),
      top: v.number().optional(),
      width: v.number().optional()
    }))
  }).partial(),
  createdAt: v.number(),
  result: v.union([v.number(), v.object({
    id: v.string()
  })]).optional()
});
var Nh = v.object({
  changes: v.array(Zh)
});
function qh(e) {
  return new _(Oh, $h, e);
}
var Dh = {
  [Rh]: Ch,
  [Oh]: Mh
};
var Lh = class extends Gl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    transport: a
  }) {
    super(a, e, t, r);
    this.windows = this.createNamespace("windows");
    this.tabs = this.createNamespace("tabs");
    this.tabGroups = this.createNamespace("tabGroups");
    this.bookmarks = this.createNamespace("bookmarks");
  }
  async getAuditTrail() {
    let e = await this.transport.send({
      command: Mh.create({
        browser_id: this.browserId
      })
    });
    return Mh.ResultSchema.parse(e);
  }
  async invoke(e, t, ...r) {
    let a = await this.transport.send({
      command: Ch.create({
        args: r,
        browser_id: this.browserId,
        method: t,
        namespace: e
      })
    });
    return Ch.ResultSchema.parse(a).value;
  }
  createNamespace(e) {
    return new Proxy({}, {
      get: (t, r) => {
        if ("string" == typeof r && "then" !== r && "toJSON" !== r && !(r in Object.prototype)) return (...t) => this.invoke(e, r, ...t);
      }
    });
  }
};
var Bh = Yl({
  capability: Lh,
  info: {
    id: "management",
    description: "Organize windows, tabs, tab groups, and bookmarks. Use only for user-requested browser organization."
  }
});
var Fh = {};
t(Fh, {
  Get: () => Uh,
  Set: () => Jh,
  commands: () => Qh
});
var Uh = {};
t(Uh, {
  PayloadSchema: () => Vh,
  ResultSchema: () => Wh,
  commandType: () => zh,
  create: () => Kh
});
var zh = "browser_visibility_get";
var Vh = v.object({
  browser_id: v.string()
});
var Wh = v.object({
  visible: v.boolean()
});
function Kh(e) {
  return new _(zh, Vh, e);
}
var Jh = {};
t(Jh, {
  PayloadSchema: () => Hh,
  ResultSchema: () => Yh,
  commandType: () => Gh,
  create: () => Xh
});
var Gh = "browser_visibility_set";
var Hh = v.object({
  browser_id: v.string(),
  visible: v.boolean()
});
var Yh = v.object({});
function Xh(e) {
  return new _(Gh, Hh, e);
}
var Qh = {
  [zh]: Uh,
  [Gh]: Jh
};
var em = class extends Gl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    transport: a
  }) {
    super(a, e, t, r);
  }
  async set(e) {
    let t = await this.transport.send({
      command: Jh.create({
        browser_id: this.browserId,
        visible: e
      })
    });
    Jh.ResultSchema.parse(t);
  }
  async get() {
    let e = await this.transport.send({
      command: Uh.create({
        browser_id: this.browserId
      })
    });
    return Uh.ResultSchema.parse(e).visible;
  }
};
var tm = Yl({
  capability: em,
  info: {
    id: "visibility",
    description: "Use to show or hide the browser to the user, and to determine the browser's current visibility. Keep browser work in the background unless the user asks to see it or live viewing is useful. When the browser should be visible, call set(true)."
  }
});
var rm = {};
t(rm, {
  Reset: () => am,
  Set: () => cm,
  commands: () => mm
});
var am = {};
t(am, {
  PayloadSchema: () => sm,
  ResultSchema: () => nm,
  commandType: () => im,
  create: () => om
});
var im = "browser_viewport_reset";
var sm = v.object({
  browser_id: v.string()
});
var nm = v.object({});
function om(e) {
  return new _(im, sm, e);
}
var cm = {};
t(cm, {
  PayloadSchema: () => lm,
  ResultSchema: () => um,
  commandType: () => dm,
  create: () => hm
});
var dm = "browser_viewport_set";
var lm = v.object({
  browser_id: v.string(),
  height: v.number().int().positive(),
  width: v.number().int().positive()
});
var um = v.object({});
function hm(e) {
  return new _(dm, lm, e);
}
var mm = {
  [im]: am,
  [dm]: cm
};
var pm = class extends Gl {
  constructor({
    browserId: e,
    documentation: t,
    info: r,
    transport: a
  }) {
    super(a, e, t, r);
  }
  async set(e) {
    let t = await this.transport.send({
      command: cm.create({
        browser_id: this.browserId,
        ...e
      })
    });
    cm.ResultSchema.parse(t);
  }
  async reset() {
    let e = await this.transport.send({
      command: am.create({
        browser_id: this.browserId
      })
    });
    am.ResultSchema.parse(e);
  }
};
var bm = Yl({
  capability: pm,
  info: {
    id: "viewport",
    description: "Controls an explicit browser viewport override for responsive or device-size testing. Use it when a task calls for specific dimensions or breakpoint validation; otherwise leave it unset so the browser uses its normal viewport. Reset temporary overrides before finishing unless the user asked to keep them."
  }
});
var _m = [Bh, tm, bm];
var ym = function (e) {
  return new Map(e.map(e => [e.id, e.create]));
}(_m);
var fm = class {
  #e;
  #t;
  #r;
  constructor({
    capabilities: e,
    onBrowserUsed: t,
    transport: r,
    browserId: a
  }) {
    this.#e = a;
    this.#t = t;
    this.#r = r;
    this.browserId = a;
    let i = new sl(r);
    this.capabilities = (({
      browserId: e,
      capabilities: t,
      documentation: r,
      transport: a
    }) => {
      let i = {};
      for (let s of t ?? []) {
        let t = ym.get(s.id);
        null != t && (i[s.id] = t({
          browserId: e,
          documentation: r,
          info: s,
          transport: a
        }));
      }
      return new Ql(i);
    })({
      browserId: a,
      capabilities: e?.browser,
      documentation: i,
      transport: r
    });
    let s = t => new jh({
      browserId: a,
      capabilities: e?.tab,
      documentation: i,
      transport: r,
      tabPayload: t
    });
    this.tabs = new ol({
      browserId: a,
      createTab: s,
      transport: r
    });
    this.user = new ll({
      browserId: a,
      createTab: s,
      transport: r
    });
  }
  async documentation() {
    return this.#t?.(), await this.#r.send({
      command: gr.create({
        browser_id: this.browserId
      })
    });
  }
  async history(e = {}) {
    if (null === e || Array.isArray(e) || "object" != typeof e) throw new Error("browser.history expects an options object");
    let t = {
      browser_id: this.#e
    };
    let r = wm(e.queries);
    let a = vm(e.limit);
    let i = gm(e.from, "from");
    let s = gm(e.to, "to");
    return void 0 !== r && (t.queries = r), void 0 !== a && (t.limit = a), void 0 !== i && (t.from = i), void 0 !== s && (t.to = s), (await this.#r.send({
      command: vi.create(t)
    })).items;
  }
  async nameSession(e) {
    let t = e.trim();
    if (!t) throw new Error("browser.nameSession requires a name");
    await this.#r.send({
      command: oa.create({
        browser_id: this.browserId,
        name: t
      })
    });
  }
};
var gm = (e, t) => {
  if (null == e) return;
  let r = e instanceof Date ? e : new Date(e);
  if (Number.isNaN(r.getTime())) throw new Error(`browser.history received an invalid ${t} date`);
  return r.toISOString();
};
var wm = e => {
  if (null == e) return;
  if (!Array.isArray(e) || 0 === e.length) throw new Error("browser.history received invalid queries");
  let t = [];
  for (let r of e) {
    if ("string" != typeof r) throw new Error("browser.history received invalid queries");
    t.push(r);
  }
  return t;
};
var vm = e => {
  if (null != e) {
    if (!Number.isInteger(e) || e <= 0) throw new Error("browser.history received an invalid limit");
    return e;
  }
};
var xm = class {
  constructor({
    executeAgentCommand: e,
    displaySideEffect: t
  } = {}) {
    if ("function" != typeof e) throw new Error("FunctionAgentTransport requires an executeAgentCommand function");
    this.executeAgentCommand = e;
    this.displaySideEffect = t ?? Tm;
  }
  async display(e) {
    await this.displaySideEffect(e);
  }
  async send({
    command: e,
    timeoutMs: t
  }) {
    let r = e.toJSON();
    let a = await this.executeAgentCommand({
      ...r,
      client_timeout_ms: "number" == typeof t && t > 0 ? t : void 0
    });
    let i = await km(a, this.displaySideEffect);
    if (null == i) throw new Error("transport send returned empty response");
    return i;
  }
};
var km = async (e, t) => {
  let r = Sm.safeParse(e);
  if (!r.success) return e;
  for (let e of r.data.side_effects) await t(e);
  let {
    side_effects: a,
    ...i
  } = r.data;
  return i;
};
var Sm = v.object({
  side_effects: v.array(v.string())
}).passthrough();
var Tm = async e => {
  let t = globalThis.display;
  "function" != typeof t ? console.log(e) : await t(e);
};
var jm = class {
  apiManifest;
  disabledMemberIds;
  view;
  constructor({
    apiManifest: e,
    decorateTab: t,
    disabledMemberIds: r
  }) {
    this.apiManifest = e;
    this.disabledMemberIds = r;
    this.view = function (e, t) {
      let r = new WeakMap();
      let a = Object.keys(e.interfaces).map(e => {
        let t = Reflect.get(p, e);
        if (!function (e) {
          return "function" == typeof e && null != e.prototype;
        }(t)) throw new Error(`Browser API interface has no runtime type: ${e}`);
        return [t, e];
      });
      return (e, i) => {
        let s = new WeakMap();
        let n = e => {
          if (null == e || "object" != typeof e) return e;
          return r.get(e) ?? (Array.isArray(e) ? e.map(n) : pl(e) ? Object.fromEntries(Object.entries(e).map(([e, t]) => [e, n(t)])) : e);
        };
        let o = e => {
          if (null == e || "object" != typeof e || r.has(e)) return e;
          if (e instanceof Promise) return e.then(o);
          if (Array.isArray(e)) return e.map(o);
          let c = a.find(([t]) => e instanceof t)?.[1];
          if (null == c) return e;
          let d = s.get(e);
          if (null != d) return d;
          let l = e => "string" != typeof e || !i.has(`${c}.${e}`);
          let u = new Map();
          let h = new Proxy(e, {
            get(e, t) {
              if (!l(t)) return;
              let r = Reflect.get(e, t, e);
              if ("constructor" === t) return r;
              if ("function" != typeof r) return o(r);
              let a = u.get(t);
              if (null != a) return a;
              let i = (...t) => o(Reflect.apply(r, e, t.map(e => n(e))));
              return u.set(t, i), i;
            },
            getOwnPropertyDescriptor(e, t) {
              if (!l(t)) return;
              let r = Reflect.getOwnPropertyDescriptor(e, t);
              return null != r && "value" in r ? {
                ...r,
                value: o(r.value)
              } : r;
            },
            has: (e, t) => l(t) && Reflect.has(e, t),
            ownKeys: e => Reflect.ownKeys(e).filter(l)
          });
          return s.set(e, h), r.set(h, e), h instanceof jh && t?.(h), h;
        };
        return o(e);
      };
    }(e, t);
  }
  createBrowser = ({
    browserInfo: e,
    onBrowserUsed: t,
    transport: r
  }) => {
    let a = function ({
      apiManifest: e,
      browserInfo: t,
      disabledMemberIds: r
    }) {
      let a = new Set(r);
      for (let [r, i] of Object.entries(e.interfaces)) for (let [e, s] of Object.entries(i)) {
        let i = `${r}.${e}`;
        (t.apiSupportOverrides?.[i] ?? true !== s.unsupportedByDefaultIn?.includes(t.type)) || a.add(i);
      }
      return a;
    }({
      apiManifest: this.apiManifest,
      browserInfo: e,
      disabledMemberIds: this.disabledMemberIds
    });
    return this.view(new fm({
      browserId: e.id,
      capabilities: e.capabilities,
      onBrowserUsed: t,
      transport: r
    }), a);
  };
  wrapAgent(e) {
    return this.view(e, this.disabledMemberIds);
  }
  createAgent({
    displaySideEffect: e,
    executeAgentCommand: t
  }) {
    return this.wrapAgent(new nl({
      createBrowser: this.createBrowser,
      transport: new xm({
        displaySideEffect: e,
        executeAgentCommand: t
      })
    }));
  }
};
async function Im(e = {}) {
  let t = globalThis.nodeRepl;
  if (null == t || "function" != typeof t.rpc) throw new Error("Browser use requires a trusted Node REPL browser service");
  let o = t.rpc;
  let c = "orbit" === t.env?.CUA_REPL_BROWSER_ENV ? "orbit" : e.environment;
  let u = e => o("browser", {
    method: "setup",
    params: e
  });
  let h = e => o("browser", {
    method: "execute",
    params: e
  });
  let p = e => o("browser", {
    method: "executeWithRecovery",
    params: e
  });
  let {
    apiManifest: b,
    disabledMemberIds: _,
    credentialRecoveryErrorVersion: y
  } = await u({
    environment: e.environment ?? "codex-app",
    undocumentedApiMembers: e.undocumentedApiMembers,
    excludedDocumentation: e.excludedDocumentation
  });
  return function ({
    apiManifest: e,
    decorateTab: t,
    disabledMemberIds: r,
    displayBridge: a,
    executeAgentCommand: i
  }) {
    return new jm({
      apiManifest: e,
      decorateTab: t,
      disabledMemberIds: r
    }).createAgent({
      displaySideEffect: m({
        displayBridge: a,
        displayTruncateMaxChars: 1e5
      }),
      executeAgentCommand: i
    });
  }({
    apiManifest: b,
    decorateTab: e.decorateTab,
    disabledMemberIds: new Set(_),
    displayBridge: {
      displayImage: e => t.emitImage(e),
      displayValue: e => console.log(e)
    },
    async executeAgentCommand(e) {
      try {
        if (1 !== y) return await h(e);
        let t = await p(e);
        if (true === t?.ok) return t.value;
        let r = l(false === t?.ok ? t.error : void 0);
        throw null == r ? new Error("Browser service returned an invalid recovery response") : new d(r);
      } catch (e) {
        if ("orbit" === c && "object" == typeof e && null !== e && "message" in e && "string" == typeof e.message) {
          let t = function (e) {
            let t = e.includes(r) ? e.lastIndexOf(i) : -1;
            let o = e.includes(a) ? e.lastIndexOf(s) : -1;
            let c = Math.max(t, o);
            if (c < 0 || e.lastIndexOf(n) > c) return e;
            let d = c === t ? i : s;
            let l = c === t ? n : `.${n}`;
            return e.slice(0, c) + l + e.slice(c + d.length);
          }(e.message);
          t !== e.message && (e.message = t);
        }
        throw e;
      }
    }
  });
}
export { Im as setupBrowserRuntime };
//# sourceMappingURL=browser-client.js.map
