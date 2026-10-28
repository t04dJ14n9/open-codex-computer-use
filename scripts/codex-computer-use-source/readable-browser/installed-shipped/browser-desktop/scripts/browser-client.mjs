// Derived readable view of exact installed @oai/browser-desktop/scripts/browser-client.mjs; minified names are preserved.
var Vc = Object.defineProperty;
var p = (r, e) => {
  for (var o in e) Vc(r, o, {
    get: e[o],
    enumerable: true
  });
};
var Yc = Object.freeze(["http:", "https:"]);
var dn = "Browser Use rejected this action due to browser security policy. Reason:";
var pn = "Browser Use could not complete this action because a browser security check was unavailable. Reason:";
var Uo = " The agent must not attempt to achieve the same outcome via workaround, indirect execution, raw CDP or browser commands, alternate browser surfaces, or policy circumvention. Proceed only with a materially safer alternative that does not require this blocked browser action; if none exists, stop and request user input.";
var Lo = ", but must not bypass browser security controls or use an indirect workaround.";
var jo = " This browser action encountered an error. Continue through a safer or more directly authorized path. If additional authorization is clearly necessary, ask the user before proceeding.";
var zo = {
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
function un(r) {
  return typeof r == "string" && Object.hasOwn(zo, r);
}
var Et = class extends Error {
  decisionSource;
  reason;
  retryable;
  constructor(e, o, n) {
    super(Xc(e, o), n);
    let s = zo[e];
    this.name = "BrowserUseSecurityError";
    this.decisionSource = s.decisionSource;
    this.reason = e;
    this.retryable = s.retryable;
  }
};
function Xc(r, e) {
  let o = zo[r];
  let n = `${o.message} ${e}`;
  return o.retryable ? `${pn} ${n} This failure may be temporary. The agent may retry after the issue is resolved${Lo}` : Kc(n);
}
function Kc(r) {
  return `${dn} ${r}${Uo}`;
}
function mn(r) {
  let e = r.includes(dn) ? r.lastIndexOf(Uo) : -1;
  let o = r.includes(pn) ? r.lastIndexOf(Lo) : -1;
  let n = Math.max(e, o);
  if (n < 0 || r.lastIndexOf(jo) > n) return r;
  let s = n === e ? Uo : Lo;
  let a = n === e ? jo : `.${jo}`;
  return r.slice(0, n) + a + r.slice(n + s.length);
}
var eo = class extends Error {
  details;
  constructor(e) {
    super(Zc(e));
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
function fn(r) {
  if (r == null || typeof r != "object") return;
  let e = r;
  if (e.schema_version !== 1 || typeof e.command != "string" || !/^[a-z_]{1,64}$/.test(e.command) || typeof e.phase != "string" || !["before_command", "command", "after_command", "error_recheck"].includes(e.phase)) return;
  let o = {
    credential_delivery_in_progress: ["retry_after_credential_delivery"],
    credential_observation_restricted: ["navigate_to_new_document"],
    retained_data_restricted: ["create_new_tab", "stop"],
    credential_state_unavailable: ["restart_browser_runtime"],
    protected_command_failed: ["request_manual_handoff", "stop"],
    browser_security_restricted: ["stop"],
    browser_security_unavailable: ["retry_after_resolution"]
  };
  if (typeof e.reason != "string" || typeof e.next_action != "string" || !Object.hasOwn(o, e.reason) || !o[e.reason].includes(e.next_action)) return;
  let n = e.security_reason;
  if (e.reason.startsWith("browser_security_")) {
    if (!un(n) || new Et(n, "").retryable !== (e.reason === "browser_security_unavailable")) return;
  } else if (n !== void 0) return;
  return {
    schema_version: 1,
    command: e.command,
    phase: e.phase,
    reason: e.reason,
    next_action: e.next_action,
    security_reason: n
  };
}
function Zc(r) {
  let e;
  switch (r.reason) {
    case "credential_delivery_in_progress":
      e = "Browser observation is unavailable while credential delivery is in progress.";
      break;
    case "credential_observation_restricted":
      e = "Browser observation is unavailable because credential protection restricts this observation.";
      break;
    case "retained_data_restricted":
      e = "Browser observation is unavailable because retained browser data remains restricted after native credential delivery.";
      break;
    case "credential_state_unavailable":
      e = "Browser observation is unavailable because native credential state cannot be safely resumed.";
      break;
    case "protected_command_failed":
      e = "Browser observation is unavailable because the browser command failed while credential protection was active. The underlying error was withheld because it may contain protected data; this does not establish a credential-policy denial.";
      break;
    case "browser_security_restricted":
    case "browser_security_unavailable":
      e = r.security_reason == null ? "A browser security check prevented this command from completing." : new Et(r.security_reason, "").message;
      break;
  }
  let o = {
    retry_after_credential_delivery: "Wait for credential delivery to finish, then retry the command.",
    navigate_to_new_document: "Navigate to a new document to continue. If observation remains blocked, use Tab.requestUserTakeover() to let the user take over.",
    create_new_tab: "Select a browser by ID and create a new tab with cua.createBrowserTab(), or use Browser.tabs.new() followed by Tab.goto(), to continue on a new document.",
    request_manual_handoff: "Use Tab.requestUserTakeover() to let the user take over.",
    restart_browser_runtime: "Start a new browser runtime to continue.",
    retry_after_resolution: "Retry after the reported check is available.",
    stop: "Stop this browser action and report the failure."
  }[r.next_action];
  return `${e} ${o} Recovery v1: command=${r.command}, phase=${r.phase}, reason=${r.reason}, next_action=${r.next_action}.`;
}
var ey = new TextEncoder();
var to = {
  distribution: "chrome-web-store",
  extensionIds: ["lfkehkpjohcoelkpembgemeipeppanef"],
  outputModes: [],
  releaseChannel: "beta",
  signingIdentity: null,
  storeUrl: "https://chromewebstore.google.com/detail/codex/lfkehkpjohcoelkpembgemeipeppanef"
};
var gn = {
  distribution: "chrome-web-store",
  extensionIds: ["hehggadaopoacecdllhhajmbjkdcmajg"],
  outputModes: [],
  releaseChannel: "stable",
  signingIdentity: null,
  storeUrl: "https://chromewebstore.google.com/detail/chatgpt/hehggadaopoacecdllhhajmbjkdcmajg"
};
var bn = {
  distribution: "microsoft-edge-add-ons",
  extensionIds: ["odlomjlbamekndcpllcnffbgeohgkmjh"],
  outputModes: [],
  releaseChannel: "stable",
  signingIdentity: null,
  storeUrl: "https://microsoftedge.microsoft.com/addons/detail/odlomjlbamekndcpllcnffbgeohgkmjh"
};
var oe = {
  chrome: {
    dev: [{
      distribution: "local-development",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "dev",
      signingIdentity: "development"
    }, {
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "dev",
      signingIdentity: "development"
    }, to],
    internal: [{
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file", "blobstore"],
      releaseChannel: "beta",
      signingIdentity: "beta"
    }, to],
    prod: [{
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "stable",
      signingIdentity: "stable"
    }, gn]
  },
  edge: {
    dev: [{
      distribution: "local-development",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "dev",
      signingIdentity: "development"
    }, {
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "dev",
      signingIdentity: "development"
    }, to],
    internal: [{
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file", "blobstore"],
      releaseChannel: "beta",
      signingIdentity: "beta"
    }, bn, to],
    prod: [{
      distribution: "managed-self-hosted",
      extensionIds: [],
      outputModes: ["file"],
      releaseChannel: "stable",
      signingIdentity: "stable"
    }, bn, gn]
  }
};
var ro = {
  dev: {
    distributions: oe.chrome.dev
  },
  internal: {
    distributions: oe.chrome.internal
  },
  prod: {
    distributions: oe.chrome.prod
  }
};
var wy = {
  chrome: {
    backendCompatibilityKey: "chrome",
    displayName: "Google Chrome",
    browserIconAssetPath: "assets/google-chrome.png",
    shortDisplayName: "Chrome",
    userAgentIdentifiers: ["Chrome/"],
    internalUrlSchemes: ["chrome"],
    extensionManagementUrl: "chrome://extensions",
    extensionChannels: ro,
    linux: {
      installations: [{
        commands: ["google-chrome", "google-chrome-stable"],
        userDataDirName: "google-chrome"
      }, {
        commands: ["chromium", "chromium-browser"],
        userDataDirName: "chromium"
      }, {
        commands: ["google-chrome-beta"],
        userDataDirName: "google-chrome-beta"
      }, {
        commands: ["google-chrome-unstable"],
        userDataDirName: "google-chrome-unstable"
      }, {
        commands: ["google-chrome-for-testing"],
        userDataDirName: "google-chrome-for-testing"
      }],
      nativeMessagingManifestDirectories: [".config/google-chrome/NativeMessagingHosts", ".config/chromium/NativeMessagingHosts", ".config/google-chrome-beta/NativeMessagingHosts", ".config/google-chrome-unstable/NativeMessagingHosts", ".config/google-chrome-for-testing/NativeMessagingHosts"],
      processNames: ["chrome"],
      userDataDirectorySegments: [".config", "google-chrome"]
    },
    macos: {
      applicationNames: ["Google Chrome.app"],
      bundleId: "com.google.Chrome",
      nativeMessagingManifestDirectories: ["Library/Application Support/Google/Chrome/NativeMessagingHosts", "Library/Application Support/Chromium/NativeMessagingHosts", "Library/Application Support/Google/ChromeForTesting/NativeMessagingHosts", "Library/Application Support/Google/Chrome for Testing/NativeMessagingHosts"],
      processNames: ["Google Chrome", "Google Chrome Helper"],
      userDataDirectorySegments: ["Library", "Application Support", "Google", "Chrome"]
    },
    windows: {
      commandNames: ["chrome.exe", "chrome"],
      httpsUserChoiceProgIdPrefixes: ["chromehtml"],
      installPathSegments: ["Google", "Chrome", "Application", "chrome.exe"],
      processNames: ["chrome.exe"],
      userDataDirectorySegments: ["Google", "Chrome", "User Data"]
    }
  },
  edge: {
    backendCompatibilityKey: "chrome",
    displayName: "Microsoft Edge",
    browserIconAssetPath: "assets/microsoft-edge.svg",
    shortDisplayName: "Edge",
    userAgentIdentifiers: ["Edg/"],
    internalUrlSchemes: ["edge"],
    extensionManagementUrl: "edge://extensions",
    extensionChannels: {
      dev: {
        distributions: oe.edge.dev
      },
      internal: {
        distributions: oe.edge.internal
      },
      prod: {
        distributions: oe.edge.prod
      }
    },
    linux: {
      installations: [{
        commands: ["microsoft-edge", "microsoft-edge-stable"],
        userDataDirName: "microsoft-edge"
      }],
      nativeMessagingManifestDirectories: [".config/microsoft-edge/NativeMessagingHosts"],
      processNames: ["msedge"],
      userDataDirectorySegments: [".config", "microsoft-edge"]
    },
    macos: {
      applicationNames: ["Microsoft Edge.app"],
      bundleId: "com.microsoft.edgemac",
      nativeMessagingManifestDirectories: ["Library/Application Support/Microsoft Edge/NativeMessagingHosts"],
      processNames: ["Microsoft Edge", "Microsoft Edge Helper"],
      userDataDirectorySegments: ["Library", "Application Support", "Microsoft Edge"]
    },
    windows: {
      commandNames: ["msedge.exe", "msedge"],
      httpsUserChoiceProgIdPrefixes: ["msedgehtm"],
      installPathSegments: ["Microsoft", "Edge", "Application", "msedge.exe"],
      processNames: ["msedge.exe"],
      userDataDirectorySegments: ["Microsoft", "Edge", "User Data"]
    }
  },
  brave: {
    backendCompatibilityKey: "chrome",
    displayName: "Brave Browser",
    browserIconAssetPath: "assets/brave.svg",
    shortDisplayName: "Brave",
    userAgentIdentifiers: ["Brave/"],
    internalUrlSchemes: ["brave", "chrome"],
    extensionManagementUrl: "brave://extensions",
    extensionChannels: ro,
    linux: {
      installations: [{
        commands: ["brave-browser", "brave-browser-stable", "brave"],
        userDataDirName: "BraveSoftware/Brave-Browser"
      }],
      nativeMessagingManifestDirectories: [".config/BraveSoftware/Brave-Browser/NativeMessagingHosts"],
      processNames: ["brave", "brave-browser"],
      userDataDirectorySegments: [".config", "BraveSoftware", "Brave-Browser"]
    },
    macos: {
      applicationNames: ["Brave Browser.app"],
      bundleId: "com.brave.Browser",
      nativeMessagingManifestDirectories: ["Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts"],
      processNames: ["Brave Browser", "Brave Browser Helper"],
      userDataDirectorySegments: ["Library", "Application Support", "BraveSoftware", "Brave-Browser"]
    },
    windows: {
      commandNames: ["brave.exe", "brave", "brave-browser"],
      httpsUserChoiceProgIdPrefixes: ["bravehtml"],
      installPathSegments: ["BraveSoftware", "Brave-Browser", "Application", "brave.exe"],
      processNames: ["brave.exe"],
      userDataDirectorySegments: ["BraveSoftware", "Brave-Browser", "User Data"]
    }
  },
  opera: {
    backendCompatibilityKey: "chrome",
    displayName: "Opera",
    browserIconAssetPath: "assets/opera.svg",
    shortDisplayName: "Opera",
    userAgentIdentifiers: ["OPR/", "Opera/"],
    internalUrlSchemes: ["opera", "chrome"],
    extensionManagementUrl: "opera://extensions",
    extensionChannels: ro,
    linux: {
      installations: [{
        commands: ["opera", "opera-stable"],
        userDataDirName: "opera"
      }],
      nativeMessagingManifestDirectories: [".config/opera/NativeMessagingHosts"],
      processNames: ["opera"],
      userDataDirectorySegments: [".config", "opera"]
    },
    macos: {
      applicationNames: ["Opera.app"],
      bundleId: "com.operasoftware.Opera",
      nativeMessagingManifestDirectories: ["Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts"],
      processNames: ["Opera", "Opera Helper"],
      userDataDirectorySegments: ["Library", "Application Support", "com.operasoftware.Opera"]
    },
    windows: {
      commandNames: ["opera.exe", "opera"],
      httpsUserChoiceProgIdPrefixes: ["operastable"],
      installPathSegments: ["Opera", "opera.exe"],
      processNames: ["opera.exe"],
      userDataDirectorySegments: ["Opera Software", "Opera Stable"]
    }
  },
  vivaldi: {
    backendCompatibilityKey: "chrome",
    displayName: "Vivaldi",
    browserIconAssetPath: "assets/vivaldi.svg",
    shortDisplayName: "Vivaldi",
    userAgentIdentifiers: ["Vivaldi/"],
    internalUrlSchemes: ["vivaldi", "chrome"],
    extensionManagementUrl: "vivaldi://extensions",
    extensionChannels: ro,
    linux: {
      installations: [{
        commands: ["vivaldi", "vivaldi-stable"],
        userDataDirName: "vivaldi"
      }],
      nativeMessagingManifestDirectories: [".config/vivaldi/NativeMessagingHosts"],
      processNames: ["vivaldi", "vivaldi-bin"],
      userDataDirectorySegments: [".config", "vivaldi"]
    },
    macos: {
      applicationNames: ["Vivaldi.app"],
      bundleId: "com.vivaldi.Vivaldi",
      nativeMessagingManifestDirectories: ["Library/Application Support/Vivaldi/NativeMessagingHosts"],
      processNames: ["Vivaldi", "Vivaldi Helper"],
      userDataDirectorySegments: ["Library", "Application Support", "Vivaldi"]
    },
    windows: {
      commandNames: ["vivaldi.exe", "vivaldi"],
      httpsUserChoiceProgIdPrefixes: ["vivaldihtm"],
      installPathSegments: ["Vivaldi", "Application", "vivaldi.exe"],
      processNames: ["vivaldi.exe"],
      userDataDirectorySegments: ["Vivaldi", "User Data"]
    }
  }
};
var sh = 64 * 1024;
var gh = {
  fetchTimeoutMs: 8e3,
  maxItems: 5e3,
  maxJsonBytes: 5 * 1024 * 1024,
  maxTextBytes: 5e5,
  observationTimeoutMs: 4e3
};
var el = r => {
  if (r === null) return null;
  if (typeof r == "string" || typeof r == "boolean") return r;
  if (typeof r == "number") return Number.isFinite(r) ? r : void 0;
  if (r instanceof String || r instanceof Boolean) return r.valueOf();
  if (r instanceof Number) {
    let e = r.valueOf();
    return Number.isFinite(e) ? e : void 0;
  }
};
var tl = r => typeof r == "number" && Number.isInteger(r) && r > 0;
var _n = (r, e) => {
  if (!tl(e)) return r;
  let o = e;
  if (r.length <= o) return r;
  let n = r.length - o;
  return `${r.slice(0, o)}[truncated ${n} chars]`;
};
var rl = (r, e) => {
  switch (r.type) {
    case "function":
      return r;
    case "error":
    case "object":
      return {
        ...r,
        value: _n(r.value, e)
      };
    case "value":
      return typeof r.value != "string" ? r : {
        ...r,
        value: _n(r.value, e)
      };
  }
};
var ol = async (r, e, o) => {
  let {
    displayImage: n,
    displayValue: s
  } = r;
  let a = null;
  try {
    if (e instanceof Uint8Array) {
      await n(e);
      return;
    } else if (e === void 0) a = {
      type: "value",
      value: void 0
    };else if (typeof e == "function") a = {
      type: "function",
      value: void 0
    };else {
      let c = el(e);
      c !== void 0 && (a = {
        type: "value",
        value: c
      });
    }
    if (a === null) {
      let c = JSON.stringify(e);
      c === void 0 && (c = String(e));
      a = {
        type: "object",
        value: c
      };
    }
  } catch (c) {
    a = {
      type: "error",
      value: String(c)
    };
  }
  a && (await s(rl(a, o)));
};
function wn({
  displayBridge: r,
  displayTruncateMaxChars: e
}) {
  return o => ol(r, o, e);
}
var an = {};
p(an, {
  AXAPI: () => rt,
  Agent: () => Xe,
  AlertDialog: () => Xr,
  AtlasCommand: () => i,
  BeforeUnloadDialog: () => Kr,
  BotDetectionTabCapability: () => ct,
  Browser: () => St,
  BrowserAuthTabCapability: () => mt,
  BrowserManagementCommands: () => Ro,
  BrowserUser: () => Ze,
  BrowserViewportCommands: () => ko,
  BrowserVisibilityCommands: () => Io,
  Browsers: () => Ye,
  CUAAPI: () => tt,
  CdpTabCapability: () => pt,
  Commands: () => R,
  ConfirmDialog: () => Zr,
  ContentAPI: () => ot,
  Documentation: () => Q,
  DomCUAAPI: () => et,
  FunctionAgentTransport: () => Ct,
  ManagementBrowserCapability: () => _t,
  PageAssetsTabCapability: () => ht,
  PlaywrightAPI: () => Qe,
  PlaywrightDownload: () => Vr,
  PlaywrightFileChooser: () => Yr,
  PlaywrightFrameLocator: () => Gr,
  PlaywrightLocator: () => Y,
  PromptDialog: () => Jr,
  Tab: () => re,
  TabBotDetectionCommands: () => uo,
  TabBrowserAuthCommands: () => go,
  TabCdpCommands: () => yo,
  TabClipboardAPI: () => nt,
  TabDevAPI: () => st,
  TabPageAssetsCommands: () => _o,
  TabWebMcpCapability: () => gt,
  Tabs: () => Ke,
  ViewportBrowserCapability: () => xt,
  VisibilityBrowserCapability: () => wt,
  botDetectionTabCapabilityDefinition: () => mo,
  browserAuthTabCapabilityDefinition: () => bo,
  browserCapabilityDefinitions: () => sn,
  cdpTabCapabilityDefinition: () => ho,
  generateRequestId: () => Gi,
  hasErrorMessage: () => Xi,
  isPlainObject: () => co,
  isRegExp: () => Je,
  managementBrowserCapabilityDefinition: () => Po,
  pageAssetsTabCapabilityDefinition: () => wo,
  tabCapabilityDefinitions: () => nn,
  toWebMcpToolDescriptor: () => So,
  viewportBrowserCapabilityDefinition: () => No,
  visibilityBrowserCapabilityDefinition: () => Bo,
  webMcpTabCapabilityDefinition: () => Co,
  webMcpTabCapabilityInfo: () => xo
});
var R = {};
p(R, {
  AtlasCommand: () => i,
  BrowserUserClaimTab: () => Gt,
  BrowserUserGetTabContext: () => He,
  BrowserUserHistory: () => Yt,
  BrowserUserOpenTabs: () => Vt,
  CloseTab: () => Dt,
  CreateTab: () => Nt,
  CuaClick: () => ar,
  CuaDoubleClick: () => cr,
  CuaDownloadMedia: () => ir,
  CuaDrag: () => dr,
  CuaKeypress: () => lr,
  CuaMove: () => pr,
  CuaScroll: () => ur,
  CuaType: () => mr,
  DomCuaClick: () => Ge,
  DomCuaDoubleClick: () => yr,
  DomCuaDownloadMedia: () => fr,
  DomCuaGetVisibleDom: () => hr,
  DomCuaKeypress: () => gr,
  DomCuaScroll: () => br,
  DomCuaType: () => _r,
  GetBrowser: () => It,
  GetBrowserDocumentation: () => Mt,
  GetBrowserForUrl: () => kt,
  GetDefaultBrowser: () => Bt,
  GetDocumentation: () => Ot,
  GetTab: () => we,
  ListBrowsers: () => vt,
  ListTabs: () => Ft,
  ManualHandoff: () => Ut,
  MarkTab: () => jt,
  NameSession: () => Lt,
  NavigateTab: () => Ht,
  NavigateTabBack: () => xe,
  NavigateTabForward: () => Se,
  NavigateTabReload: () => $t,
  PlaywrightDomSnapshot: () => Lr,
  PlaywrightDownloadPath: () => qr,
  PlaywrightElementInfo: () => zr,
  PlaywrightElementScreenshot: () => Fr,
  PlaywrightEvaluate: () => Ee,
  PlaywrightFileChooserSetFiles: () => $r,
  PlaywrightLocatorAllTextContents: () => Br,
  PlaywrightLocatorClick: () => wr,
  PlaywrightLocatorCount: () => Rr,
  PlaywrightLocatorDblclick: () => xr,
  PlaywrightLocatorDownloadMedia: () => Sr,
  PlaywrightLocatorFill: () => Ve,
  PlaywrightLocatorGetAttribute: () => kr,
  PlaywrightLocatorInnerText: () => Mr,
  PlaywrightLocatorIsEnabled: () => Ir,
  PlaywrightLocatorIsVisible: () => vr,
  PlaywrightLocatorPress: () => Cr,
  PlaywrightLocatorPressSequentially: () => Tr,
  PlaywrightLocatorReadAll: () => Nr,
  PlaywrightLocatorSelectOption: () => Pr,
  PlaywrightLocatorSetChecked: () => Ar,
  PlaywrightLocatorTextContent: () => Or,
  PlaywrightLocatorWaitFor: () => Er,
  PlaywrightWaitForDownload: () => Wr,
  PlaywrightWaitForFileChooser: () => Hr,
  PlaywrightWaitForLoadState: () => jr,
  PlaywrightWaitForTimeout: () => Ur,
  PlaywrightWaitForURL: () => Dr,
  RuntimeConfig: () => $o,
  SelectedTab: () => zt,
  TabAxAction: () => sr,
  TabAxGetState: () => nr,
  TabClipboardRead: () => tr,
  TabClipboardReadText: () => Qt,
  TabClipboardWrite: () => rr,
  TabClipboardWriteText: () => er,
  TabContentExport: () => Kt,
  TabContentExportGSuite: () => Zt,
  TabContentExportYouTubeTranscript: () => Jt,
  TabDevLogs: () => $e,
  TabGetJsDialog: () => Xt,
  TabHandleJsDialog: () => Ce,
  TabScreenshot: () => or,
  TabsContent: () => Wt,
  WebMcpInvokeTool: () => qt,
  WebMcpListTools: () => qe
});
var i = class {
  constructor(e, o, n) {
    this.type = e;
    this.schema = o;
    this.payload = n;
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
var vt = {};
p(vt, {
  PayloadSchema: () => Mn,
  ResultSchema: () => gd,
  commandType: () => kn,
  create: () => bd
});
var t = {};
p(t, {
  BRAND: () => vl,
  DIRTY: () => ne,
  EMPTY_PATH: () => il,
  INVALID: () => g,
  NEVER: () => md,
  OK: () => E,
  ParseStatus: () => T,
  Schema: () => x,
  ZodAny: () => Z,
  ZodArray: () => V,
  ZodBigInt: () => ae,
  ZodBoolean: () => ie,
  ZodBranded: () => Pt,
  ZodCatch: () => be,
  ZodDate: () => ce,
  ZodDefault: () => ge,
  ZodDiscriminatedUnion: () => so,
  ZodEffects: () => O,
  ZodEnum: () => ye,
  ZodError: () => A,
  ZodFirstPartyTypeKind: () => _,
  ZodFunction: () => io,
  ZodIntersection: () => ue,
  ZodIssueCode: () => u,
  ZodLazy: () => me,
  ZodLiteral: () => fe,
  ZodMap: () => Le,
  ZodNaN: () => Fe,
  ZodNativeEnum: () => he,
  ZodNever: () => N,
  ZodNull: () => de,
  ZodNullable: () => L,
  ZodNumber: () => se,
  ZodObject: () => v,
  ZodOptional: () => I,
  ZodParsedType: () => y,
  ZodPipeline: () => At,
  ZodPromise: () => J,
  ZodReadonly: () => _e,
  ZodRecord: () => ao,
  ZodSchema: () => x,
  ZodSet: () => ze,
  ZodString: () => K,
  ZodSymbol: () => je,
  ZodTransformer: () => O,
  ZodTuple: () => U,
  ZodType: () => x,
  ZodUndefined: () => le,
  ZodUnion: () => pe,
  ZodUnknown: () => G,
  ZodVoid: () => Ue,
  addIssueToContext: () => f,
  any: () => Ul,
  array: () => Wl,
  bigint: () => Ml,
  boolean: () => Bn,
  coerce: () => ud,
  custom: () => An,
  date: () => kl,
  datetimeRegex: () => Rn,
  defaultErrorMap: () => H,
  discriminatedUnion: () => Gl,
  effect: () => nd,
  enum: () => td,
  function: () => Jl,
  getErrorMap: () => ke,
  getParsedType: () => j,
  instanceof: () => Bl,
  intersection: () => Vl,
  isAborted: () => oo,
  isAsync: () => Ne,
  isDirty: () => no,
  isValid: () => X,
  late: () => Il,
  lazy: () => Ql,
  literal: () => ed,
  makeIssue: () => Rt,
  map: () => Kl,
  nan: () => Ol,
  nativeEnum: () => rd,
  never: () => zl,
  null: () => jl,
  nullable: () => ad,
  number: () => In,
  object: () => ql,
  objectUtil: () => Fo,
  oboolean: () => pd,
  onumber: () => dd,
  optional: () => sd,
  ostring: () => ld,
  pipeline: () => cd,
  preprocess: () => id,
  promise: () => od,
  quotelessJson: () => nl,
  record: () => Xl,
  set: () => Zl,
  setErrorMap: () => al,
  strictObject: () => Hl,
  string: () => vn,
  symbol: () => Nl,
  transformer: () => nd,
  tuple: () => Yl,
  undefined: () => Dl,
  union: () => $l,
  unknown: () => Ll,
  util: () => S,
  void: () => Fl
});
var S;
(function (r) {
  r.assertEqual = s => {};
  function e(s) {}
  r.assertIs = e;
  function o(s) {
    throw new Error();
  }
  r.assertNever = o;
  r.arrayToEnum = s => {
    let a = {};
    for (let c of s) a[c] = c;
    return a;
  };
  r.getValidEnumValues = s => {
    let a = r.objectKeys(s).filter(l => typeof s[s[l]] != "number");
    let c = {};
    for (let l of a) c[l] = s[l];
    return r.objectValues(c);
  };
  r.objectValues = s => r.objectKeys(s).map(function (a) {
    return s[a];
  });
  r.objectKeys = typeof Object.keys == "function" ? s => Object.keys(s) : s => {
    let a = [];
    for (let c in s) Object.prototype.hasOwnProperty.call(s, c) && a.push(c);
    return a;
  };
  r.find = (s, a) => {
    for (let c of s) if (a(c)) return c;
  };
  r.isInteger = typeof Number.isInteger == "function" ? s => Number.isInteger(s) : s => typeof s == "number" && Number.isFinite(s) && Math.floor(s) === s;
  function n(s, a = " | ") {
    return s.map(c => typeof c == "string" ? `'${c}'` : c).join(a);
  }
  r.joinValues = n;
  r.jsonStringifyReplacer = (s, a) => typeof a == "bigint" ? a.toString() : a;
})(S || (S = {}));
var Fo;
(function (r) {
  r.mergeShapes = (e, o) => ({
    ...e,
    ...o
  });
})(Fo || (Fo = {}));
var y = S.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]);
var j = r => {
  switch (typeof r) {
    case "undefined":
      return y.undefined;
    case "string":
      return y.string;
    case "number":
      return Number.isNaN(r) ? y.nan : y.number;
    case "boolean":
      return y.boolean;
    case "function":
      return y.function;
    case "bigint":
      return y.bigint;
    case "symbol":
      return y.symbol;
    case "object":
      return Array.isArray(r) ? y.array : r === null ? y.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? y.promise : typeof Map < "u" && r instanceof Map ? y.map : typeof Set < "u" && r instanceof Set ? y.set : typeof Date < "u" && r instanceof Date ? y.date : y.object;
    default:
      return y.unknown;
  }
};
var u = S.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]);
var nl = r => JSON.stringify(r, null, 2).replace(/"([^"]+)":/g, "$1:");
var A = class r extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super();
    this.issues = [];
    this.addIssue = n => {
      this.issues = [...this.issues, n];
    };
    this.addIssues = (n = []) => {
      this.issues = [...this.issues, ...n];
    };
    let o = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, o) : this.__proto__ = o;
    this.name = "ZodError";
    this.issues = e;
  }
  format(e) {
    let o = e || function (a) {
      return a.message;
    };
    let n = {
      _errors: []
    };
    let s = a => {
      for (let c of a.issues) if (c.code === "invalid_union") c.unionErrors.map(s);else if (c.code === "invalid_return_type") s(c.returnTypeError);else if (c.code === "invalid_arguments") s(c.argumentsError);else if (c.path.length === 0) n._errors.push(o(c));else {
        let l = n;
        let m = 0;
        for (; m < c.path.length;) {
          let d = c.path[m];
          m === c.path.length - 1 ? (l[d] = l[d] || {
            _errors: []
          }, l[d]._errors.push(o(c))) : l[d] = l[d] || {
            _errors: []
          };
          l = l[d];
          m++;
        }
      }
    };
    return s(this), n;
  }
  static assert(e) {
    if (!(e instanceof r)) throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, S.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = o => o.message) {
    let o = {};
    let n = [];
    for (let s of this.issues) if (s.path.length > 0) {
      let a = s.path[0];
      o[a] = o[a] || [];
      o[a].push(e(s));
    } else n.push(e(s));
    return {
      formErrors: n,
      fieldErrors: o
    };
  }
  get formErrors() {
    return this.flatten();
  }
};
A.create = r => new A(r);
var sl = (r, e) => {
  let o;
  switch (r.code) {
    case u.invalid_type:
      r.received === y.undefined ? o = "Required" : o = `Expected ${r.expected}, received ${r.received}`;
      break;
    case u.invalid_literal:
      o = `Invalid literal value, expected ${JSON.stringify(r.expected, S.jsonStringifyReplacer)}`;
      break;
    case u.unrecognized_keys:
      o = `Unrecognized key(s) in object: ${S.joinValues(r.keys, ", ")}`;
      break;
    case u.invalid_union:
      o = "Invalid input";
      break;
    case u.invalid_union_discriminator:
      o = `Invalid discriminator value. Expected ${S.joinValues(r.options)}`;
      break;
    case u.invalid_enum_value:
      o = `Invalid enum value. Expected ${S.joinValues(r.options)}, received '${r.received}'`;
      break;
    case u.invalid_arguments:
      o = "Invalid function arguments";
      break;
    case u.invalid_return_type:
      o = "Invalid function return type";
      break;
    case u.invalid_date:
      o = "Invalid date";
      break;
    case u.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (o = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (o = `${o} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? o = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? o = `Invalid input: must end with "${r.validation.endsWith}"` : S.assertNever(r.validation) : r.validation !== "regex" ? o = `Invalid ${r.validation}` : o = "Invalid";
      break;
    case u.too_small:
      r.type === "array" ? o = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? o = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? o = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? o = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? o = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : o = "Invalid input";
      break;
    case u.too_big:
      r.type === "array" ? o = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? o = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? o = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? o = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? o = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : o = "Invalid input";
      break;
    case u.custom:
      o = "Invalid input";
      break;
    case u.invalid_intersection_types:
      o = "Intersection results could not be merged";
      break;
    case u.not_multiple_of:
      o = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case u.not_finite:
      o = "Number must be finite";
      break;
    default:
      o = e.defaultError;
      S.assertNever(r);
  }
  return {
    message: o
  };
};
var H = sl;
var xn = H;
function al(r) {
  xn = r;
}
function ke() {
  return xn;
}
var Rt = r => {
  let {
    data: e,
    path: o,
    errorMaps: n,
    issueData: s
  } = r;
  let a = [...o, ...(s.path || [])];
  let c = {
    ...s,
    path: a
  };
  if (s.message !== void 0) return {
    ...s,
    path: a,
    message: s.message
  };
  let l = "";
  let m = n.filter(d => !!d).slice().reverse();
  for (let d of m) l = d(c, {
    data: e,
    defaultError: l
  }).message;
  return {
    ...s,
    path: a,
    message: l
  };
};
var il = [];
function f(r, e) {
  let o = ke();
  let n = Rt({
    issueData: e,
    data: r.data,
    path: r.path,
    errorMaps: [r.common.contextualErrorMap, r.schemaErrorMap, o, o === H ? void 0 : H].filter(s => !!s)
  });
  r.common.issues.push(n);
}
var T = class r {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, o) {
    let n = [];
    for (let s of o) {
      if (s.status === "aborted") return g;
      s.status === "dirty" && e.dirty();
      n.push(s.value);
    }
    return {
      status: e.value,
      value: n
    };
  }
  static async mergeObjectAsync(e, o) {
    let n = [];
    for (let s of o) {
      let a = await s.key;
      let c = await s.value;
      n.push({
        key: a,
        value: c
      });
    }
    return r.mergeObjectSync(e, n);
  }
  static mergeObjectSync(e, o) {
    let n = {};
    for (let s of o) {
      let {
        key: a,
        value: c
      } = s;
      if (a.status === "aborted" || c.status === "aborted") return g;
      a.status === "dirty" && e.dirty();
      c.status === "dirty" && e.dirty();
      a.value !== "__proto__" && (typeof c.value < "u" || s.alwaysSet) && (n[a.value] = c.value);
    }
    return {
      status: e.value,
      value: n
    };
  }
};
var g = Object.freeze({
  status: "aborted"
});
var ne = r => ({
  status: "dirty",
  value: r
});
var E = r => ({
  status: "valid",
  value: r
});
var oo = r => r.status === "aborted";
var no = r => r.status === "dirty";
var X = r => r.status === "valid";
var Ne = r => typeof Promise < "u" && r instanceof Promise;
var h;
(function (r) {
  r.errToObj = e => typeof e == "string" ? {
    message: e
  } : e || {};
  r.toString = e => typeof e == "string" ? e : e?.message;
})(h || (h = {}));
var B = class {
  constructor(e, o, n, s) {
    this._cachedPath = [];
    this.parent = e;
    this.data = o;
    this._path = n;
    this._key = s;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
};
var Sn = (r, e) => {
  if (X(e)) return {
    success: true,
    data: e.value
  };
  if (!r.common.issues.length) throw new Error("Validation failed but no issues detected.");
  return {
    success: false,
    get error() {
      if (this._error) return this._error;
      let o = new A(r.common.issues);
      return this._error = o, this._error;
    }
  };
};
function w(r) {
  if (!r) return {};
  let {
    errorMap: e,
    invalid_type_error: o,
    required_error: n,
    description: s
  } = r;
  if (e && (o || n)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? {
    errorMap: e,
    description: s
  } : {
    errorMap: (c, l) => {
      let {
        message: m
      } = r;
      return c.code === "invalid_enum_value" ? {
        message: m ?? l.defaultError
      } : typeof l.data > "u" ? {
        message: m ?? n ?? l.defaultError
      } : c.code !== "invalid_type" ? {
        message: l.defaultError
      } : {
        message: m ?? o ?? l.defaultError
      };
    },
    description: s
  };
}
var x = class {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return j(e.data);
  }
  _getOrReturnCtx(e, o) {
    return o || {
      common: e.parent.common,
      data: e.data,
      parsedType: j(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new T(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: j(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    let o = this._parse(e);
    if (Ne(o)) throw new Error("Synchronous parse encountered promise.");
    return o;
  }
  _parseAsync(e) {
    let o = this._parse(e);
    return Promise.resolve(o);
  }
  parse(e, o) {
    let n = this.safeParse(e, o);
    if (n.success) return n.data;
    throw n.error;
  }
  safeParse(e, o) {
    let n = {
      common: {
        issues: [],
        async: o?.async ?? false,
        contextualErrorMap: o?.errorMap
      },
      path: o?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    };
    let s = this._parseSync({
      data: e,
      path: n.path,
      parent: n
    });
    return Sn(n, s);
  }
  "~validate"(e) {
    let o = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    };
    if (!this["~standard"].async) try {
      let n = this._parseSync({
        data: e,
        path: [],
        parent: o
      });
      return X(n) ? {
        value: n.value
      } : {
        issues: o.common.issues
      };
    } catch (n) {
      n?.message?.toLowerCase()?.includes("encountered") && (this["~standard"].async = true);
      o.common = {
        issues: [],
        async: true
      };
    }
    return this._parseAsync({
      data: e,
      path: [],
      parent: o
    }).then(n => X(n) ? {
      value: n.value
    } : {
      issues: o.common.issues
    });
  }
  async parseAsync(e, o) {
    let n = await this.safeParseAsync(e, o);
    if (n.success) return n.data;
    throw n.error;
  }
  async safeParseAsync(e, o) {
    let n = {
      common: {
        issues: [],
        contextualErrorMap: o?.errorMap,
        async: true
      },
      path: o?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: j(e)
    };
    let s = this._parse({
      data: e,
      path: n.path,
      parent: n
    });
    let a = await (Ne(s) ? s : Promise.resolve(s));
    return Sn(n, a);
  }
  refine(e, o) {
    let n = s => typeof o == "string" || typeof o > "u" ? {
      message: o
    } : typeof o == "function" ? o(s) : o;
    return this._refinement((s, a) => {
      let c = e(s);
      let l = () => a.addIssue({
        code: u.custom,
        ...n(s)
      });
      return typeof Promise < "u" && c instanceof Promise ? c.then(m => m ? true : (l(), false)) : c ? true : (l(), false);
    });
  }
  refinement(e, o) {
    return this._refinement((n, s) => e(n) ? true : (s.addIssue(typeof o == "function" ? o(n, s) : o), false));
  }
  _refinement(e) {
    return new O({
      schema: this,
      typeName: _.ZodEffects,
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
      validate: o => this["~validate"](o)
    };
  }
  optional() {
    return I.create(this, this._def);
  }
  nullable() {
    return L.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return V.create(this);
  }
  promise() {
    return J.create(this, this._def);
  }
  or(e) {
    return pe.create([this, e], this._def);
  }
  and(e) {
    return ue.create(this, e, this._def);
  }
  transform(e) {
    return new O({
      ...w(this._def),
      schema: this,
      typeName: _.ZodEffects,
      effect: {
        type: "transform",
        transform: e
      }
    });
  }
  default(e) {
    let o = typeof e == "function" ? e : () => e;
    return new ge({
      ...w(this._def),
      innerType: this,
      defaultValue: o,
      typeName: _.ZodDefault
    });
  }
  brand() {
    return new Pt({
      typeName: _.ZodBranded,
      type: this,
      ...w(this._def)
    });
  }
  catch(e) {
    let o = typeof e == "function" ? e : () => e;
    return new be({
      ...w(this._def),
      innerType: this,
      catchValue: o,
      typeName: _.ZodCatch
    });
  }
  describe(e) {
    let o = this.constructor;
    return new o({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return At.create(this, e);
  }
  readonly() {
    return _e.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cl = /^c[^\s-]{8,}$/i;
var ll = /^[0-9a-z]+$/;
var dl = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var pl = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var ul = /^[a-z0-9_-]{21}$/i;
var ml = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var fl = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var yl = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var hl = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
var Wo;
var gl = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var bl = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var _l = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var wl = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var xl = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var Sl = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var Tn = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))";
var Cl = new RegExp(`^${Tn}$`);
function En(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  let o = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${o}`;
}
function Tl(r) {
  return new RegExp(`^${En(r)}$`);
}
function Rn(r) {
  let e = `${Tn}T${En(r)}`;
  let o = [];
  return o.push(r.local ? "Z?" : "Z"), r.offset && o.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${o.join("|")})`, new RegExp(`^${e}$`);
}
function El(r, e) {
  return !!((e === "v4" || !e) && gl.test(r) || (e === "v6" || !e) && _l.test(r));
}
function Rl(r, e) {
  if (!ml.test(r)) return false;
  try {
    let [o] = r.split(".");
    if (!o) return false;
    let n = o.replace(/-/g, "+").replace(/_/g, "/").padEnd(o.length + (4 - o.length % 4) % 4, "=");
    let s = JSON.parse(atob(n));
    return !(typeof s != "object" || s === null || "typ" in s && s?.typ !== "JWT" || !s.alg || e && s.alg !== e);
  } catch {
    return false;
  }
}
function Pl(r, e) {
  return !!((e === "v4" || !e) && bl.test(r) || (e === "v6" || !e) && wl.test(r));
}
var K = class r extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== y.string) {
      let a = this._getOrReturnCtx(e);
      return f(a, {
        code: u.invalid_type,
        expected: y.string,
        received: a.parsedType
      }), g;
    }
    let n = new T();
    let s;
    for (let a of this._def.checks) if (a.kind === "min") e.data.length < a.value && (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.too_small,
      minimum: a.value,
      type: "string",
      inclusive: true,
      exact: false,
      message: a.message
    }), n.dirty());else if (a.kind === "max") e.data.length > a.value && (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.too_big,
      maximum: a.value,
      type: "string",
      inclusive: true,
      exact: false,
      message: a.message
    }), n.dirty());else if (a.kind === "length") {
      let c = e.data.length > a.value;
      let l = e.data.length < a.value;
      (c || l) && (s = this._getOrReturnCtx(e, s), c ? f(s, {
        code: u.too_big,
        maximum: a.value,
        type: "string",
        inclusive: true,
        exact: true,
        message: a.message
      }) : l && f(s, {
        code: u.too_small,
        minimum: a.value,
        type: "string",
        inclusive: true,
        exact: true,
        message: a.message
      }), n.dirty());
    } else if (a.kind === "email") yl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "email",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "emoji") Wo || (Wo = new RegExp(hl, "u")), Wo.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "emoji",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "uuid") pl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "uuid",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "nanoid") ul.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "nanoid",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "cuid") cl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "cuid",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "cuid2") ll.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "cuid2",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "ulid") dl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "ulid",
      code: u.invalid_string,
      message: a.message
    }), n.dirty());else if (a.kind === "url") try {
      new URL(e.data);
    } catch {
      s = this._getOrReturnCtx(e, s);
      f(s, {
        validation: "url",
        code: u.invalid_string,
        message: a.message
      });
      n.dirty();
    } else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "regex",
      code: u.invalid_string,
      message: a.message
    }), n.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: {
        includes: a.value,
        position: a.position
      },
      message: a.message
    }), n.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: {
        startsWith: a.value
      },
      message: a.message
    }), n.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: {
        endsWith: a.value
      },
      message: a.message
    }), n.dirty()) : a.kind === "datetime" ? Rn(a).test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: "datetime",
      message: a.message
    }), n.dirty()) : a.kind === "date" ? Cl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: "date",
      message: a.message
    }), n.dirty()) : a.kind === "time" ? Tl(a).test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.invalid_string,
      validation: "time",
      message: a.message
    }), n.dirty()) : a.kind === "duration" ? fl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "duration",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : a.kind === "ip" ? El(e.data, a.version) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "ip",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : a.kind === "jwt" ? Rl(e.data, a.alg) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "jwt",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : a.kind === "cidr" ? Pl(e.data, a.version) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "cidr",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : a.kind === "base64" ? xl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "base64",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : a.kind === "base64url" ? Sl.test(e.data) || (s = this._getOrReturnCtx(e, s), f(s, {
      validation: "base64url",
      code: u.invalid_string,
      message: a.message
    }), n.dirty()) : S.assertNever(a);
    return {
      status: n.value,
      value: e.data
    };
  }
  _regex(e, o, n) {
    return this.refinement(s => e.test(s), {
      validation: o,
      code: u.invalid_string,
      ...h.errToObj(n)
    });
  }
  _addCheck(e) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({
      kind: "email",
      ...h.errToObj(e)
    });
  }
  url(e) {
    return this._addCheck({
      kind: "url",
      ...h.errToObj(e)
    });
  }
  emoji(e) {
    return this._addCheck({
      kind: "emoji",
      ...h.errToObj(e)
    });
  }
  uuid(e) {
    return this._addCheck({
      kind: "uuid",
      ...h.errToObj(e)
    });
  }
  nanoid(e) {
    return this._addCheck({
      kind: "nanoid",
      ...h.errToObj(e)
    });
  }
  cuid(e) {
    return this._addCheck({
      kind: "cuid",
      ...h.errToObj(e)
    });
  }
  cuid2(e) {
    return this._addCheck({
      kind: "cuid2",
      ...h.errToObj(e)
    });
  }
  ulid(e) {
    return this._addCheck({
      kind: "ulid",
      ...h.errToObj(e)
    });
  }
  base64(e) {
    return this._addCheck({
      kind: "base64",
      ...h.errToObj(e)
    });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...h.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({
      kind: "jwt",
      ...h.errToObj(e)
    });
  }
  ip(e) {
    return this._addCheck({
      kind: "ip",
      ...h.errToObj(e)
    });
  }
  cidr(e) {
    return this._addCheck({
      kind: "cidr",
      ...h.errToObj(e)
    });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
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
      ...h.errToObj(e?.message)
    });
  }
  date(e) {
    return this._addCheck({
      kind: "date",
      message: e
    });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof e?.precision > "u" ? null : e?.precision,
      ...h.errToObj(e?.message)
    });
  }
  duration(e) {
    return this._addCheck({
      kind: "duration",
      ...h.errToObj(e)
    });
  }
  regex(e, o) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...h.errToObj(o)
    });
  }
  includes(e, o) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: o?.position,
      ...h.errToObj(o?.message)
    });
  }
  startsWith(e, o) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...h.errToObj(o)
    });
  }
  endsWith(e, o) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...h.errToObj(o)
    });
  }
  min(e, o) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...h.errToObj(o)
    });
  }
  max(e, o) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...h.errToObj(o)
    });
  }
  length(e, o) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...h.errToObj(o)
    });
  }
  nonempty(e) {
    return this.min(1, h.errToObj(e));
  }
  trim() {
    return new r({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "trim"
      }]
    });
  }
  toLowerCase() {
    return new r({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "toLowerCase"
      }]
    });
  }
  toUpperCase() {
    return new r({
      ...this._def,
      checks: [...this._def.checks, {
        kind: "toUpperCase"
      }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find(e => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find(e => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find(e => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find(e => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find(e => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find(e => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find(e => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find(e => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find(e => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find(e => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find(e => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find(e => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find(e => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find(e => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find(e => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find(e => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (let o of this._def.checks) o.kind === "min" && (e === null || o.value > e) && (e = o.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (let o of this._def.checks) o.kind === "max" && (e === null || o.value < e) && (e = o.value);
    return e;
  }
};
K.create = r => new K({
  checks: [],
  typeName: _.ZodString,
  coerce: r?.coerce ?? false,
  ...w(r)
});
function Al(r, e) {
  let o = (r.toString().split(".")[1] || "").length;
  let n = (e.toString().split(".")[1] || "").length;
  let s = o > n ? o : n;
  let a = Number.parseInt(r.toFixed(s).replace(".", ""));
  let c = Number.parseInt(e.toFixed(s).replace(".", ""));
  return a % c / 10 ** s;
}
var se = class r extends x {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== y.number) {
      let a = this._getOrReturnCtx(e);
      return f(a, {
        code: u.invalid_type,
        expected: y.number,
        received: a.parsedType
      }), g;
    }
    let n;
    let s = new T();
    for (let a of this._def.checks) a.kind === "int" ? S.isInteger(e.data) || (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.invalid_type,
      expected: "integer",
      received: "float",
      message: a.message
    }), s.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.too_small,
      minimum: a.value,
      type: "number",
      inclusive: a.inclusive,
      exact: false,
      message: a.message
    }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.too_big,
      maximum: a.value,
      type: "number",
      inclusive: a.inclusive,
      exact: false,
      message: a.message
    }), s.dirty()) : a.kind === "multipleOf" ? Al(e.data, a.value) !== 0 && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.not_multiple_of,
      multipleOf: a.value,
      message: a.message
    }), s.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.not_finite,
      message: a.message
    }), s.dirty()) : S.assertNever(a);
    return {
      status: s.value,
      value: e.data
    };
  }
  gte(e, o) {
    return this.setLimit("min", e, true, h.toString(o));
  }
  gt(e, o) {
    return this.setLimit("min", e, false, h.toString(o));
  }
  lte(e, o) {
    return this.setLimit("max", e, true, h.toString(o));
  }
  lt(e, o) {
    return this.setLimit("max", e, false, h.toString(o));
  }
  setLimit(e, o, n, s) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, {
        kind: e,
        value: o,
        inclusive: n,
        message: h.toString(s)
      }]
    });
  }
  _addCheck(e) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: h.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: h.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: h.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: h.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: h.toString(e)
    });
  }
  multipleOf(e, o) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: h.toString(o)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: h.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: h.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: h.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (let o of this._def.checks) o.kind === "min" && (e === null || o.value > e) && (e = o.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let o of this._def.checks) o.kind === "max" && (e === null || o.value < e) && (e = o.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find(e => e.kind === "int" || e.kind === "multipleOf" && S.isInteger(e.value));
  }
  get isFinite() {
    let e = null;
    let o = null;
    for (let n of this._def.checks) {
      if (n.kind === "finite" || n.kind === "int" || n.kind === "multipleOf") return true;
      n.kind === "min" ? (o === null || n.value > o) && (o = n.value) : n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    }
    return Number.isFinite(o) && Number.isFinite(e);
  }
};
se.create = r => new se({
  checks: [],
  typeName: _.ZodNumber,
  coerce: r?.coerce || false,
  ...w(r)
});
var ae = class r extends x {
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
    if (this._getType(e) !== y.bigint) return this._getInvalidInput(e);
    let n;
    let s = new T();
    for (let a of this._def.checks) a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.too_small,
      type: "bigint",
      minimum: a.value,
      inclusive: a.inclusive,
      message: a.message
    }), s.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.too_big,
      type: "bigint",
      maximum: a.value,
      inclusive: a.inclusive,
      message: a.message
    }), s.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (n = this._getOrReturnCtx(e, n), f(n, {
      code: u.not_multiple_of,
      multipleOf: a.value,
      message: a.message
    }), s.dirty()) : S.assertNever(a);
    return {
      status: s.value,
      value: e.data
    };
  }
  _getInvalidInput(e) {
    let o = this._getOrReturnCtx(e);
    return f(o, {
      code: u.invalid_type,
      expected: y.bigint,
      received: o.parsedType
    }), g;
  }
  gte(e, o) {
    return this.setLimit("min", e, true, h.toString(o));
  }
  gt(e, o) {
    return this.setLimit("min", e, false, h.toString(o));
  }
  lte(e, o) {
    return this.setLimit("max", e, true, h.toString(o));
  }
  lt(e, o) {
    return this.setLimit("max", e, false, h.toString(o));
  }
  setLimit(e, o, n, s) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, {
        kind: e,
        value: o,
        inclusive: n,
        message: h.toString(s)
      }]
    });
  }
  _addCheck(e) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: h.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: h.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: h.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: h.toString(e)
    });
  }
  multipleOf(e, o) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: h.toString(o)
    });
  }
  get minValue() {
    let e = null;
    for (let o of this._def.checks) o.kind === "min" && (e === null || o.value > e) && (e = o.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let o of this._def.checks) o.kind === "max" && (e === null || o.value < e) && (e = o.value);
    return e;
  }
};
ae.create = r => new ae({
  checks: [],
  typeName: _.ZodBigInt,
  coerce: r?.coerce ?? false,
  ...w(r)
});
var ie = class extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== y.boolean) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.boolean,
        received: n.parsedType
      }), g;
    }
    return E(e.data);
  }
};
ie.create = r => new ie({
  typeName: _.ZodBoolean,
  coerce: r?.coerce || false,
  ...w(r)
});
var ce = class r extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== y.date) {
      let a = this._getOrReturnCtx(e);
      return f(a, {
        code: u.invalid_type,
        expected: y.date,
        received: a.parsedType
      }), g;
    }
    if (Number.isNaN(e.data.getTime())) {
      let a = this._getOrReturnCtx(e);
      return f(a, {
        code: u.invalid_date
      }), g;
    }
    let n = new T();
    let s;
    for (let a of this._def.checks) a.kind === "min" ? e.data.getTime() < a.value && (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.too_small,
      message: a.message,
      inclusive: true,
      exact: false,
      minimum: a.value,
      type: "date"
    }), n.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (s = this._getOrReturnCtx(e, s), f(s, {
      code: u.too_big,
      message: a.message,
      inclusive: true,
      exact: false,
      maximum: a.value,
      type: "date"
    }), n.dirty()) : S.assertNever(a);
    return {
      status: n.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new r({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, o) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: h.toString(o)
    });
  }
  max(e, o) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: h.toString(o)
    });
  }
  get minDate() {
    let e = null;
    for (let o of this._def.checks) o.kind === "min" && (e === null || o.value > e) && (e = o.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (let o of this._def.checks) o.kind === "max" && (e === null || o.value < e) && (e = o.value);
    return e != null ? new Date(e) : null;
  }
};
ce.create = r => new ce({
  checks: [],
  coerce: r?.coerce || false,
  typeName: _.ZodDate,
  ...w(r)
});
var je = class extends x {
  _parse(e) {
    if (this._getType(e) !== y.symbol) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.symbol,
        received: n.parsedType
      }), g;
    }
    return E(e.data);
  }
};
je.create = r => new je({
  typeName: _.ZodSymbol,
  ...w(r)
});
var le = class extends x {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.undefined,
        received: n.parsedType
      }), g;
    }
    return E(e.data);
  }
};
le.create = r => new le({
  typeName: _.ZodUndefined,
  ...w(r)
});
var de = class extends x {
  _parse(e) {
    if (this._getType(e) !== y.null) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.null,
        received: n.parsedType
      }), g;
    }
    return E(e.data);
  }
};
de.create = r => new de({
  typeName: _.ZodNull,
  ...w(r)
});
var Z = class extends x {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(e) {
    return E(e.data);
  }
};
Z.create = r => new Z({
  typeName: _.ZodAny,
  ...w(r)
});
var G = class extends x {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(e) {
    return E(e.data);
  }
};
G.create = r => new G({
  typeName: _.ZodUnknown,
  ...w(r)
});
var N = class extends x {
  _parse(e) {
    let o = this._getOrReturnCtx(e);
    return f(o, {
      code: u.invalid_type,
      expected: y.never,
      received: o.parsedType
    }), g;
  }
};
N.create = r => new N({
  typeName: _.ZodNever,
  ...w(r)
});
var Ue = class extends x {
  _parse(e) {
    if (this._getType(e) !== y.undefined) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.void,
        received: n.parsedType
      }), g;
    }
    return E(e.data);
  }
};
Ue.create = r => new Ue({
  typeName: _.ZodVoid,
  ...w(r)
});
var V = class r extends x {
  _parse(e) {
    let {
      ctx: o,
      status: n
    } = this._processInputParams(e);
    let s = this._def;
    if (o.parsedType !== y.array) return f(o, {
      code: u.invalid_type,
      expected: y.array,
      received: o.parsedType
    }), g;
    if (s.exactLength !== null) {
      let c = o.data.length > s.exactLength.value;
      let l = o.data.length < s.exactLength.value;
      (c || l) && (f(o, {
        code: c ? u.too_big : u.too_small,
        minimum: l ? s.exactLength.value : void 0,
        maximum: c ? s.exactLength.value : void 0,
        type: "array",
        inclusive: true,
        exact: true,
        message: s.exactLength.message
      }), n.dirty());
    }
    if (s.minLength !== null && o.data.length < s.minLength.value && (f(o, {
      code: u.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: true,
      exact: false,
      message: s.minLength.message
    }), n.dirty()), s.maxLength !== null && o.data.length > s.maxLength.value && (f(o, {
      code: u.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: true,
      exact: false,
      message: s.maxLength.message
    }), n.dirty()), o.common.async) return Promise.all([...o.data].map((c, l) => s.type._parseAsync(new B(o, c, o.path, l)))).then(c => T.mergeArray(n, c));
    let a = [...o.data].map((c, l) => s.type._parseSync(new B(o, c, o.path, l)));
    return T.mergeArray(n, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, o) {
    return new r({
      ...this._def,
      minLength: {
        value: e,
        message: h.toString(o)
      }
    });
  }
  max(e, o) {
    return new r({
      ...this._def,
      maxLength: {
        value: e,
        message: h.toString(o)
      }
    });
  }
  length(e, o) {
    return new r({
      ...this._def,
      exactLength: {
        value: e,
        message: h.toString(o)
      }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
V.create = (r, e) => new V({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: _.ZodArray,
  ...w(e)
});
function De(r) {
  if (r instanceof v) {
    let e = {};
    for (let o in r.shape) {
      let n = r.shape[o];
      e[o] = I.create(De(n));
    }
    return new v({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof V ? new V({
    ...r._def,
    type: De(r.element)
  }) : r instanceof I ? I.create(De(r.unwrap())) : r instanceof L ? L.create(De(r.unwrap())) : r instanceof U ? U.create(r.items.map(e => De(e))) : r;
}
var v = class r extends x {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null) return this._cached;
    let e = this._def.shape();
    let o = S.objectKeys(e);
    return this._cached = {
      shape: e,
      keys: o
    }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== y.object) {
      let d = this._getOrReturnCtx(e);
      return f(d, {
        code: u.invalid_type,
        expected: y.object,
        received: d.parsedType
      }), g;
    }
    let {
      status: n,
      ctx: s
    } = this._processInputParams(e);
    let {
      shape: a,
      keys: c
    } = this._getCached();
    let l = [];
    if (!(this._def.catchall instanceof N && this._def.unknownKeys === "strip")) for (let d in s.data) c.includes(d) || l.push(d);
    let m = [];
    for (let d of c) {
      let b = a[d];
      let C = s.data[d];
      m.push({
        key: {
          status: "valid",
          value: d
        },
        value: b._parse(new B(s, C, s.path, d)),
        alwaysSet: d in s.data
      });
    }
    if (this._def.catchall instanceof N) {
      let d = this._def.unknownKeys;
      if (d === "passthrough") for (let b of l) m.push({
        key: {
          status: "valid",
          value: b
        },
        value: {
          status: "valid",
          value: s.data[b]
        }
      });else if (d === "strict") l.length > 0 && (f(s, {
        code: u.unrecognized_keys,
        keys: l
      }), n.dirty());else if (d !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      let d = this._def.catchall;
      for (let b of l) {
        let C = s.data[b];
        m.push({
          key: {
            status: "valid",
            value: b
          },
          value: d._parse(new B(s, C, s.path, b)),
          alwaysSet: b in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      let d = [];
      for (let b of m) {
        let C = await b.key;
        let q = await b.value;
        d.push({
          key: C,
          value: q,
          alwaysSet: b.alwaysSet
        });
      }
      return d;
    }).then(d => T.mergeObjectSync(n, d)) : T.mergeObjectSync(n, m);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return h.errToObj, new r({
      ...this._def,
      unknownKeys: "strict",
      ...(e !== void 0 ? {
        errorMap: (o, n) => {
          let s = this._def.errorMap?.(o, n).message ?? n.defaultError;
          return o.code === "unrecognized_keys" ? {
            message: h.errToObj(e).message ?? s
          } : {
            message: s
          };
        }
      } : {})
    });
  }
  strip() {
    return new r({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new r({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(e) {
    return new r({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  merge(e) {
    return new r({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: _.ZodObject
    });
  }
  setKey(e, o) {
    return this.augment({
      [e]: o
    });
  }
  catchall(e) {
    return new r({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    let o = {};
    for (let n of S.objectKeys(e)) e[n] && this.shape[n] && (o[n] = this.shape[n]);
    return new r({
      ...this._def,
      shape: () => o
    });
  }
  omit(e) {
    let o = {};
    for (let n of S.objectKeys(this.shape)) e[n] || (o[n] = this.shape[n]);
    return new r({
      ...this._def,
      shape: () => o
    });
  }
  deepPartial() {
    return De(this);
  }
  partial(e) {
    let o = {};
    for (let n of S.objectKeys(this.shape)) {
      let s = this.shape[n];
      e && !e[n] ? o[n] = s : o[n] = s.optional();
    }
    return new r({
      ...this._def,
      shape: () => o
    });
  }
  required(e) {
    let o = {};
    for (let n of S.objectKeys(this.shape)) if (e && !e[n]) o[n] = this.shape[n];else {
      let a = this.shape[n];
      for (; a instanceof I;) a = a._def.innerType;
      o[n] = a;
    }
    return new r({
      ...this._def,
      shape: () => o
    });
  }
  keyof() {
    return Pn(S.objectKeys(this.shape));
  }
};
v.create = (r, e) => new v({
  shape: () => r,
  unknownKeys: "strip",
  catchall: N.create(),
  typeName: _.ZodObject,
  ...w(e)
});
v.strictCreate = (r, e) => new v({
  shape: () => r,
  unknownKeys: "strict",
  catchall: N.create(),
  typeName: _.ZodObject,
  ...w(e)
});
v.lazycreate = (r, e) => new v({
  shape: r,
  unknownKeys: "strip",
  catchall: N.create(),
  typeName: _.ZodObject,
  ...w(e)
});
var pe = class extends x {
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    let n = this._def.options;
    function s(a) {
      for (let l of a) if (l.result.status === "valid") return l.result;
      for (let l of a) if (l.result.status === "dirty") return o.common.issues.push(...l.ctx.common.issues), l.result;
      let c = a.map(l => new A(l.ctx.common.issues));
      return f(o, {
        code: u.invalid_union,
        unionErrors: c
      }), g;
    }
    if (o.common.async) return Promise.all(n.map(async a => {
      let c = {
        ...o,
        common: {
          ...o.common,
          issues: []
        },
        parent: null
      };
      return {
        result: await a._parseAsync({
          data: o.data,
          path: o.path,
          parent: c
        }),
        ctx: c
      };
    })).then(s);
    {
      let a;
      let c = [];
      for (let m of n) {
        let d = {
          ...o,
          common: {
            ...o.common,
            issues: []
          },
          parent: null
        };
        let b = m._parseSync({
          data: o.data,
          path: o.path,
          parent: d
        });
        if (b.status === "valid") return b;
        b.status === "dirty" && !a && (a = {
          result: b,
          ctx: d
        });
        d.common.issues.length && c.push(d.common.issues);
      }
      if (a) return o.common.issues.push(...a.ctx.common.issues), a.result;
      let l = c.map(m => new A(m));
      return f(o, {
        code: u.invalid_union,
        unionErrors: l
      }), g;
    }
  }
  get options() {
    return this._def.options;
  }
};
pe.create = (r, e) => new pe({
  options: r,
  typeName: _.ZodUnion,
  ...w(e)
});
var $ = r => r instanceof me ? $(r.schema) : r instanceof O ? $(r.innerType()) : r instanceof fe ? [r.value] : r instanceof ye ? r.options : r instanceof he ? S.objectValues(r.enum) : r instanceof ge ? $(r._def.innerType) : r instanceof le ? [void 0] : r instanceof de ? [null] : r instanceof I ? [void 0, ...$(r.unwrap())] : r instanceof L ? [null, ...$(r.unwrap())] : r instanceof Pt || r instanceof _e ? $(r.unwrap()) : r instanceof be ? $(r._def.innerType) : [];
var so = class r extends x {
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    if (o.parsedType !== y.object) return f(o, {
      code: u.invalid_type,
      expected: y.object,
      received: o.parsedType
    }), g;
    let n = this.discriminator;
    let s = o.data[n];
    let a = this.optionsMap.get(s);
    return a ? o.common.async ? a._parseAsync({
      data: o.data,
      path: o.path,
      parent: o
    }) : a._parseSync({
      data: o.data,
      path: o.path,
      parent: o
    }) : (f(o, {
      code: u.invalid_union_discriminator,
      options: Array.from(this.optionsMap.keys()),
      path: [n]
    }), g);
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
  static create(e, o, n) {
    let s = new Map();
    for (let a of o) {
      let c = $(a.shape[e]);
      if (!c.length) throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);
      for (let l of c) {
        if (s.has(l)) throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(l)}`);
        s.set(l, a);
      }
    }
    return new r({
      typeName: _.ZodDiscriminatedUnion,
      discriminator: e,
      options: o,
      optionsMap: s,
      ...w(n)
    });
  }
};
function qo(r, e) {
  let o = j(r);
  let n = j(e);
  if (r === e) return {
    valid: true,
    data: r
  };
  if (o === y.object && n === y.object) {
    let s = S.objectKeys(e);
    let a = S.objectKeys(r).filter(l => s.indexOf(l) !== -1);
    let c = {
      ...r,
      ...e
    };
    for (let l of a) {
      let m = qo(r[l], e[l]);
      if (!m.valid) return {
        valid: false
      };
      c[l] = m.data;
    }
    return {
      valid: true,
      data: c
    };
  } else if (o === y.array && n === y.array) {
    if (r.length !== e.length) return {
      valid: false
    };
    let s = [];
    for (let a = 0; a < r.length; a++) {
      let c = r[a];
      let l = e[a];
      let m = qo(c, l);
      if (!m.valid) return {
        valid: false
      };
      s.push(m.data);
    }
    return {
      valid: true,
      data: s
    };
  } else return o === y.date && n === y.date && +r == +e ? {
    valid: true,
    data: r
  } : {
    valid: false
  };
}
var ue = class extends x {
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    let s = (a, c) => {
      if (oo(a) || oo(c)) return g;
      let l = qo(a.value, c.value);
      return l.valid ? ((no(a) || no(c)) && o.dirty(), {
        status: o.value,
        value: l.data
      }) : (f(n, {
        code: u.invalid_intersection_types
      }), g);
    };
    return n.common.async ? Promise.all([this._def.left._parseAsync({
      data: n.data,
      path: n.path,
      parent: n
    }), this._def.right._parseAsync({
      data: n.data,
      path: n.path,
      parent: n
    })]).then(([a, c]) => s(a, c)) : s(this._def.left._parseSync({
      data: n.data,
      path: n.path,
      parent: n
    }), this._def.right._parseSync({
      data: n.data,
      path: n.path,
      parent: n
    }));
  }
};
ue.create = (r, e, o) => new ue({
  left: r,
  right: e,
  typeName: _.ZodIntersection,
  ...w(o)
});
var U = class r extends x {
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    if (n.parsedType !== y.array) return f(n, {
      code: u.invalid_type,
      expected: y.array,
      received: n.parsedType
    }), g;
    if (n.data.length < this._def.items.length) return f(n, {
      code: u.too_small,
      minimum: this._def.items.length,
      inclusive: true,
      exact: false,
      type: "array"
    }), g;
    !this._def.rest && n.data.length > this._def.items.length && (f(n, {
      code: u.too_big,
      maximum: this._def.items.length,
      inclusive: true,
      exact: false,
      type: "array"
    }), o.dirty());
    let a = [...n.data].map((c, l) => {
      let m = this._def.items[l] || this._def.rest;
      return m ? m._parse(new B(n, c, n.path, l)) : null;
    }).filter(c => !!c);
    return n.common.async ? Promise.all(a).then(c => T.mergeArray(o, c)) : T.mergeArray(o, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new r({
      ...this._def,
      rest: e
    });
  }
};
U.create = (r, e) => {
  if (!Array.isArray(r)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new U({
    items: r,
    typeName: _.ZodTuple,
    rest: null,
    ...w(e)
  });
};
var ao = class r extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    if (n.parsedType !== y.object) return f(n, {
      code: u.invalid_type,
      expected: y.object,
      received: n.parsedType
    }), g;
    let s = [];
    let a = this._def.keyType;
    let c = this._def.valueType;
    for (let l in n.data) s.push({
      key: a._parse(new B(n, l, n.path, l)),
      value: c._parse(new B(n, n.data[l], n.path, l)),
      alwaysSet: l in n.data
    });
    return n.common.async ? T.mergeObjectAsync(o, s) : T.mergeObjectSync(o, s);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, o, n) {
    return o instanceof x ? new r({
      keyType: e,
      valueType: o,
      typeName: _.ZodRecord,
      ...w(n)
    }) : new r({
      keyType: K.create(),
      valueType: e,
      typeName: _.ZodRecord,
      ...w(o)
    });
  }
};
var Le = class extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    if (n.parsedType !== y.map) return f(n, {
      code: u.invalid_type,
      expected: y.map,
      received: n.parsedType
    }), g;
    let s = this._def.keyType;
    let a = this._def.valueType;
    let c = [...n.data.entries()].map(([l, m], d) => ({
      key: s._parse(new B(n, l, n.path, [d, "key"])),
      value: a._parse(new B(n, m, n.path, [d, "value"]))
    }));
    if (n.common.async) {
      let l = new Map();
      return Promise.resolve().then(async () => {
        for (let m of c) {
          let d = await m.key;
          let b = await m.value;
          if (d.status === "aborted" || b.status === "aborted") return g;
          (d.status === "dirty" || b.status === "dirty") && o.dirty();
          l.set(d.value, b.value);
        }
        return {
          status: o.value,
          value: l
        };
      });
    } else {
      let l = new Map();
      for (let m of c) {
        let d = m.key;
        let b = m.value;
        if (d.status === "aborted" || b.status === "aborted") return g;
        (d.status === "dirty" || b.status === "dirty") && o.dirty();
        l.set(d.value, b.value);
      }
      return {
        status: o.value,
        value: l
      };
    }
  }
};
Le.create = (r, e, o) => new Le({
  valueType: e,
  keyType: r,
  typeName: _.ZodMap,
  ...w(o)
});
var ze = class r extends x {
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    if (n.parsedType !== y.set) return f(n, {
      code: u.invalid_type,
      expected: y.set,
      received: n.parsedType
    }), g;
    let s = this._def;
    s.minSize !== null && n.data.size < s.minSize.value && (f(n, {
      code: u.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: true,
      exact: false,
      message: s.minSize.message
    }), o.dirty());
    s.maxSize !== null && n.data.size > s.maxSize.value && (f(n, {
      code: u.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: true,
      exact: false,
      message: s.maxSize.message
    }), o.dirty());
    let a = this._def.valueType;
    function c(m) {
      let d = new Set();
      for (let b of m) {
        if (b.status === "aborted") return g;
        b.status === "dirty" && o.dirty();
        d.add(b.value);
      }
      return {
        status: o.value,
        value: d
      };
    }
    let l = [...n.data.values()].map((m, d) => a._parse(new B(n, m, n.path, d)));
    return n.common.async ? Promise.all(l).then(m => c(m)) : c(l);
  }
  min(e, o) {
    return new r({
      ...this._def,
      minSize: {
        value: e,
        message: h.toString(o)
      }
    });
  }
  max(e, o) {
    return new r({
      ...this._def,
      maxSize: {
        value: e,
        message: h.toString(o)
      }
    });
  }
  size(e, o) {
    return this.min(e, o).max(e, o);
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
ze.create = (r, e) => new ze({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: _.ZodSet,
  ...w(e)
});
var io = class r extends x {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    if (o.parsedType !== y.function) return f(o, {
      code: u.invalid_type,
      expected: y.function,
      received: o.parsedType
    }), g;
    function n(l, m) {
      return Rt({
        data: l,
        path: o.path,
        errorMaps: [o.common.contextualErrorMap, o.schemaErrorMap, ke(), H].filter(d => !!d),
        issueData: {
          code: u.invalid_arguments,
          argumentsError: m
        }
      });
    }
    function s(l, m) {
      return Rt({
        data: l,
        path: o.path,
        errorMaps: [o.common.contextualErrorMap, o.schemaErrorMap, ke(), H].filter(d => !!d),
        issueData: {
          code: u.invalid_return_type,
          returnTypeError: m
        }
      });
    }
    let a = {
      errorMap: o.common.contextualErrorMap
    };
    let c = o.data;
    if (this._def.returns instanceof J) {
      let l = this;
      return E(async function (...m) {
        let d = new A([]);
        let b = await l._def.args.parseAsync(m, a).catch(Me => {
          throw d.addIssue(n(m, Me)), d;
        });
        let C = await Reflect.apply(c, this, b);
        return await l._def.returns._def.type.parseAsync(C, a).catch(Me => {
          throw d.addIssue(s(C, Me)), d;
        });
      });
    } else {
      let l = this;
      return E(function (...m) {
        let d = l._def.args.safeParse(m, a);
        if (!d.success) throw new A([n(m, d.error)]);
        let b = Reflect.apply(c, this, d.data);
        let C = l._def.returns.safeParse(b, a);
        if (!C.success) throw new A([s(b, C.error)]);
        return C.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e) {
    return new r({
      ...this._def,
      args: U.create(e).rest(G.create())
    });
  }
  returns(e) {
    return new r({
      ...this._def,
      returns: e
    });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(e, o, n) {
    return new r({
      args: e || U.create([]).rest(G.create()),
      returns: o || G.create(),
      typeName: _.ZodFunction,
      ...w(n)
    });
  }
};
var me = class extends x {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    return this._def.getter()._parse({
      data: o.data,
      path: o.path,
      parent: o
    });
  }
};
me.create = (r, e) => new me({
  getter: r,
  typeName: _.ZodLazy,
  ...w(e)
});
var fe = class extends x {
  _parse(e) {
    if (e.data !== this._def.value) {
      let o = this._getOrReturnCtx(e);
      return f(o, {
        received: o.data,
        code: u.invalid_literal,
        expected: this._def.value
      }), g;
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
fe.create = (r, e) => new fe({
  value: r,
  typeName: _.ZodLiteral,
  ...w(e)
});
function Pn(r, e) {
  return new ye({
    values: r,
    typeName: _.ZodEnum,
    ...w(e)
  });
}
var ye = class r extends x {
  _parse(e) {
    if (typeof e.data != "string") {
      let o = this._getOrReturnCtx(e);
      let n = this._def.values;
      return f(o, {
        expected: S.joinValues(n),
        received: o.parsedType,
        code: u.invalid_type
      }), g;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      let o = this._getOrReturnCtx(e);
      let n = this._def.values;
      return f(o, {
        received: o.data,
        code: u.invalid_enum_value,
        options: n
      }), g;
    }
    return E(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    let e = {};
    for (let o of this._def.values) e[o] = o;
    return e;
  }
  get Values() {
    let e = {};
    for (let o of this._def.values) e[o] = o;
    return e;
  }
  get Enum() {
    let e = {};
    for (let o of this._def.values) e[o] = o;
    return e;
  }
  extract(e, o = this._def) {
    return r.create(e, {
      ...this._def,
      ...o
    });
  }
  exclude(e, o = this._def) {
    return r.create(this.options.filter(n => !e.includes(n)), {
      ...this._def,
      ...o
    });
  }
};
ye.create = Pn;
var he = class extends x {
  _parse(e) {
    let o = S.getValidEnumValues(this._def.values);
    let n = this._getOrReturnCtx(e);
    if (n.parsedType !== y.string && n.parsedType !== y.number) {
      let s = S.objectValues(o);
      return f(n, {
        expected: S.joinValues(s),
        received: n.parsedType,
        code: u.invalid_type
      }), g;
    }
    if (this._cache || (this._cache = new Set(S.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      let s = S.objectValues(o);
      return f(n, {
        received: n.data,
        code: u.invalid_enum_value,
        options: s
      }), g;
    }
    return E(e.data);
  }
  get enum() {
    return this._def.values;
  }
};
he.create = (r, e) => new he({
  values: r,
  typeName: _.ZodNativeEnum,
  ...w(e)
});
var J = class extends x {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    if (o.parsedType !== y.promise && o.common.async === false) return f(o, {
      code: u.invalid_type,
      expected: y.promise,
      received: o.parsedType
    }), g;
    let n = o.parsedType === y.promise ? o.data : Promise.resolve(o.data);
    return E(n.then(s => this._def.type.parseAsync(s, {
      path: o.path,
      errorMap: o.common.contextualErrorMap
    })));
  }
};
J.create = (r, e) => new J({
  type: r,
  typeName: _.ZodPromise,
  ...w(e)
});
var O = class extends x {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === _.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    let s = this._def.effect || null;
    let a = {
      addIssue: c => {
        f(n, c);
        c.fatal ? o.abort() : o.dirty();
      },
      get path() {
        return n.path;
      }
    };
    if (a.addIssue = a.addIssue.bind(a), s.type === "preprocess") {
      let c = s.transform(n.data, a);
      if (n.common.async) return Promise.resolve(c).then(async l => {
        if (o.value === "aborted") return g;
        let m = await this._def.schema._parseAsync({
          data: l,
          path: n.path,
          parent: n
        });
        return m.status === "aborted" ? g : m.status === "dirty" ? ne(m.value) : o.value === "dirty" ? ne(m.value) : m;
      });
      {
        if (o.value === "aborted") return g;
        let l = this._def.schema._parseSync({
          data: c,
          path: n.path,
          parent: n
        });
        return l.status === "aborted" ? g : l.status === "dirty" ? ne(l.value) : o.value === "dirty" ? ne(l.value) : l;
      }
    }
    if (s.type === "refinement") {
      let c = l => {
        let m = s.refinement(l, a);
        if (n.common.async) return Promise.resolve(m);
        if (m instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return l;
      };
      if (n.common.async === false) {
        let l = this._def.schema._parseSync({
          data: n.data,
          path: n.path,
          parent: n
        });
        return l.status === "aborted" ? g : (l.status === "dirty" && o.dirty(), c(l.value), {
          status: o.value,
          value: l.value
        });
      } else return this._def.schema._parseAsync({
        data: n.data,
        path: n.path,
        parent: n
      }).then(l => l.status === "aborted" ? g : (l.status === "dirty" && o.dirty(), c(l.value).then(() => ({
        status: o.value,
        value: l.value
      }))));
    }
    if (s.type === "transform") if (n.common.async === false) {
      let c = this._def.schema._parseSync({
        data: n.data,
        path: n.path,
        parent: n
      });
      if (!X(c)) return g;
      let l = s.transform(c.value, a);
      if (l instanceof Promise) throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
      return {
        status: o.value,
        value: l
      };
    } else return this._def.schema._parseAsync({
      data: n.data,
      path: n.path,
      parent: n
    }).then(c => X(c) ? Promise.resolve(s.transform(c.value, a)).then(l => ({
      status: o.value,
      value: l
    })) : g);
    S.assertNever(s);
  }
};
O.create = (r, e, o) => new O({
  schema: r,
  typeName: _.ZodEffects,
  effect: e,
  ...w(o)
});
O.createWithPreprocess = (r, e, o) => new O({
  schema: e,
  effect: {
    type: "preprocess",
    transform: r
  },
  typeName: _.ZodEffects,
  ...w(o)
});
var I = class extends x {
  _parse(e) {
    return this._getType(e) === y.undefined ? E(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
I.create = (r, e) => new I({
  innerType: r,
  typeName: _.ZodOptional,
  ...w(e)
});
var L = class extends x {
  _parse(e) {
    return this._getType(e) === y.null ? E(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
L.create = (r, e) => new L({
  innerType: r,
  typeName: _.ZodNullable,
  ...w(e)
});
var ge = class extends x {
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    let n = o.data;
    return o.parsedType === y.undefined && (n = this._def.defaultValue()), this._def.innerType._parse({
      data: n,
      path: o.path,
      parent: o
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ge.create = (r, e) => new ge({
  innerType: r,
  typeName: _.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...w(e)
});
var be = class extends x {
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    let n = {
      ...o,
      common: {
        ...o.common,
        issues: []
      }
    };
    let s = this._def.innerType._parse({
      data: n.data,
      path: n.path,
      parent: {
        ...n
      }
    });
    return Ne(s) ? s.then(a => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new A(n.common.issues);
        },
        input: n.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new A(n.common.issues);
        },
        input: n.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
};
be.create = (r, e) => new be({
  innerType: r,
  typeName: _.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...w(e)
});
var Fe = class extends x {
  _parse(e) {
    if (this._getType(e) !== y.nan) {
      let n = this._getOrReturnCtx(e);
      return f(n, {
        code: u.invalid_type,
        expected: y.nan,
        received: n.parsedType
      }), g;
    }
    return {
      status: "valid",
      value: e.data
    };
  }
};
Fe.create = r => new Fe({
  typeName: _.ZodNaN,
  ...w(r)
});
var vl = Symbol("zod_brand");
var Pt = class extends x {
  _parse(e) {
    let {
      ctx: o
    } = this._processInputParams(e);
    let n = o.data;
    return this._def.type._parse({
      data: n,
      path: o.path,
      parent: o
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var At = class r extends x {
  _parse(e) {
    let {
      status: o,
      ctx: n
    } = this._processInputParams(e);
    if (n.common.async) return (async () => {
      let a = await this._def.in._parseAsync({
        data: n.data,
        path: n.path,
        parent: n
      });
      return a.status === "aborted" ? g : a.status === "dirty" ? (o.dirty(), ne(a.value)) : this._def.out._parseAsync({
        data: a.value,
        path: n.path,
        parent: n
      });
    })();
    {
      let s = this._def.in._parseSync({
        data: n.data,
        path: n.path,
        parent: n
      });
      return s.status === "aborted" ? g : s.status === "dirty" ? (o.dirty(), {
        status: "dirty",
        value: s.value
      }) : this._def.out._parseSync({
        data: s.value,
        path: n.path,
        parent: n
      });
    }
  }
  static create(e, o) {
    return new r({
      in: e,
      out: o,
      typeName: _.ZodPipeline
    });
  }
};
var _e = class extends x {
  _parse(e) {
    let o = this._def.innerType._parse(e);
    let n = s => (X(s) && (s.value = Object.freeze(s.value)), s);
    return Ne(o) ? o.then(s => n(s)) : n(o);
  }
  unwrap() {
    return this._def.innerType;
  }
};
_e.create = (r, e) => new _e({
  innerType: r,
  typeName: _.ZodReadonly,
  ...w(e)
});
function Cn(r, e) {
  let o = typeof r == "function" ? r(e) : typeof r == "string" ? {
    message: r
  } : r;
  return typeof o == "string" ? {
    message: o
  } : o;
}
function An(r, e = {}, o) {
  return r ? Z.create().superRefine((n, s) => {
    let a = r(n);
    if (a instanceof Promise) return a.then(c => {
      if (!c) {
        let l = Cn(e, n);
        let m = l.fatal ?? o ?? true;
        s.addIssue({
          code: "custom",
          ...l,
          fatal: m
        });
      }
    });
    if (!a) {
      let c = Cn(e, n);
      let l = c.fatal ?? o ?? true;
      s.addIssue({
        code: "custom",
        ...c,
        fatal: l
      });
    }
  }) : Z.create();
}
var Il = {
  object: v.lazycreate
};
var _;
(function (r) {
  r.ZodString = "ZodString";
  r.ZodNumber = "ZodNumber";
  r.ZodNaN = "ZodNaN";
  r.ZodBigInt = "ZodBigInt";
  r.ZodBoolean = "ZodBoolean";
  r.ZodDate = "ZodDate";
  r.ZodSymbol = "ZodSymbol";
  r.ZodUndefined = "ZodUndefined";
  r.ZodNull = "ZodNull";
  r.ZodAny = "ZodAny";
  r.ZodUnknown = "ZodUnknown";
  r.ZodNever = "ZodNever";
  r.ZodVoid = "ZodVoid";
  r.ZodArray = "ZodArray";
  r.ZodObject = "ZodObject";
  r.ZodUnion = "ZodUnion";
  r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion";
  r.ZodIntersection = "ZodIntersection";
  r.ZodTuple = "ZodTuple";
  r.ZodRecord = "ZodRecord";
  r.ZodMap = "ZodMap";
  r.ZodSet = "ZodSet";
  r.ZodFunction = "ZodFunction";
  r.ZodLazy = "ZodLazy";
  r.ZodLiteral = "ZodLiteral";
  r.ZodEnum = "ZodEnum";
  r.ZodEffects = "ZodEffects";
  r.ZodNativeEnum = "ZodNativeEnum";
  r.ZodOptional = "ZodOptional";
  r.ZodNullable = "ZodNullable";
  r.ZodDefault = "ZodDefault";
  r.ZodCatch = "ZodCatch";
  r.ZodPromise = "ZodPromise";
  r.ZodBranded = "ZodBranded";
  r.ZodPipeline = "ZodPipeline";
  r.ZodReadonly = "ZodReadonly";
})(_ || (_ = {}));
var Bl = (r, e = {
  message: `Input not instance of ${r.name}`
}) => An(o => o instanceof r, e);
var vn = K.create;
var In = se.create;
var Ol = Fe.create;
var Ml = ae.create;
var Bn = ie.create;
var kl = ce.create;
var Nl = je.create;
var Dl = le.create;
var jl = de.create;
var Ul = Z.create;
var Ll = G.create;
var zl = N.create;
var Fl = Ue.create;
var Wl = V.create;
var ql = v.create;
var Hl = v.strictCreate;
var $l = pe.create;
var Gl = so.create;
var Vl = ue.create;
var Yl = U.create;
var Xl = ao.create;
var Kl = Le.create;
var Zl = ze.create;
var Jl = io.create;
var Ql = me.create;
var ed = fe.create;
var td = ye.create;
var rd = he.create;
var od = J.create;
var nd = O.create;
var sd = I.create;
var ad = L.create;
var id = O.createWithPreprocess;
var cd = At.create;
var ld = () => vn().optional();
var dd = () => In().optional();
var pd = () => Bn().optional();
var ud = {
  string: r => K.create({
    ...r,
    coerce: true
  }),
  number: r => se.create({
    ...r,
    coerce: true
  }),
  boolean: r => ie.create({
    ...r,
    coerce: true
  }),
  bigint: r => ae.create({
    ...r,
    coerce: true
  }),
  date: r => ce.create({
    ...r,
    coerce: true
  })
};
var md = g;
var On = t.object({
  id: t.string(),
  description: t.string()
});
var fd = t.object({
  browser: t.array(On).optional(),
  tab: t.array(On).optional()
});
var yd = t.enum(["iab", "extension", "cdp", "mcpapps"]);
var hd = t.string().trim().min(1);
var Ho = t.object({
  family: hd.optional(),
  id: t.string(),
  name: t.string(),
  type: yd,
  profileName: t.string().optional(),
  metadata: t.object({
    extensionInstanceId: t.string().optional(),
    codexSessionId: t.string().optional()
  }).optional()
});
var We = Ho.extend({
  apiSupportOverrides: t.record(t.boolean()).optional(),
  capabilities: fd
});
var Mn = t.object({});
var gd = t.array(Ho);
var kn = "list_browsers";
function bd(r = {}) {
  return new i(kn, Mn, r);
}
var It = {};
p(It, {
  PayloadSchema: () => Nn,
  ResultSchema: () => _d,
  commandType: () => Dn,
  create: () => wd
});
var Nn = t.object({
  id: t.string()
});
var _d = We;
var Dn = "get_browser";
function wd(r) {
  return new i(Dn, Nn, r);
}
var Bt = {};
p(Bt, {
  PayloadSchema: () => jn,
  ResultSchema: () => xd,
  commandType: () => Un,
  create: () => Sd
});
var jn = t.object({});
var xd = We;
var Un = "get_default_browser";
function Sd(r = {}) {
  return new i(Un, jn, r);
}
var Ot = {};
p(Ot, {
  PayloadSchema: () => Ln,
  ResultSchema: () => Cd,
  commandType: () => zn,
  create: () => Td
});
var Ln = t.object({
  name: t.string()
});
var Cd = t.string();
var zn = "get_documentation";
function Td(r) {
  return new i(zn, Ln, r);
}
var Mt = {};
p(Mt, {
  PayloadSchema: () => Fn,
  ResultSchema: () => Ed,
  commandType: () => Wn,
  create: () => Rd
});
var Fn = t.object({
  browser_id: t.string()
});
var Ed = t.string();
var Wn = "get_browser_documentation";
function Rd(r) {
  return new i(Wn, Fn, r);
}
var kt = {};
p(kt, {
  PayloadSchema: () => qn,
  ResultSchema: () => Pd,
  commandType: () => Hn,
  create: () => Ad
});
var qn = t.object({
  url: t.string().url()
});
var Pd = We;
var Hn = "get_browser_for_url";
function Ad(r) {
  return new i(Hn, qn, r);
}
var Nt = {};
p(Nt, {
  PayloadSchema: () => $n,
  ResultSchema: () => vd,
  commandType: () => Gn,
  create: () => Id
});
var $n = t.object({
  browser_id: t.string()
});
var vd = t.object({
  id: t.string()
});
var Gn = "create_tab";
function Id(r) {
  return new i(Gn, $n, r);
}
var we = {};
p(we, {
  PayloadSchema: () => Vn,
  ResultSchema: () => Bd,
  commandType: () => Yn,
  create: () => Od
});
var Vn = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Bd = t.object({
  id: t.string(),
  title: t.string().optional(),
  url: t.string().optional()
});
var Yn = "get_tab";
function Od(r) {
  return new i(Yn, Vn, r);
}
var Dt = {};
p(Dt, {
  PayloadSchema: () => Xn,
  ResultSchema: () => Md,
  commandType: () => Kn,
  create: () => kd
});
var Xn = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Md = t.object({});
var Kn = "close_tab";
function kd(r) {
  return new i(Kn, Xn, r);
}
var jt = {};
p(jt, {
  MarkTabStatusSchema: () => Zn,
  PayloadSchema: () => Jn,
  ResultSchema: () => Nd,
  commandType: () => Qn,
  create: () => Dd
});
var Zn = t.enum(["handoff", "deliverable"]);
var Jn = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  status: Zn
});
var Nd = t.object({});
var Qn = "mark_tab";
function Dd(r) {
  return new i(Qn, Jn, r);
}
var Ut = {};
p(Ut, {
  PayloadSchema: () => rs,
  ReasonSchema: () => ts,
  ResultSchema: () => jd,
  commandType: () => es,
  create: () => Ud
});
var es = "tab_manual_handoff_request";
var ts = t.enum(["authentication", "captcha", "user_requested", "other"]);
var rs = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  reason: ts.optional()
});
var jd = t.object({});
function Ud(r) {
  return new i(es, rs, r);
}
var $o = {};
p($o, {
  PayloadSchema: () => os,
  ResultSchema: () => Ld,
  commandType: () => ns,
  create: () => zd
});
var os = t.object({
  browser_id: t.string()
});
var Ld = t.object({
  display_truncate_max_chars: t.number().int().positive().optional()
});
var ns = "runtime_config";
function zd(r) {
  return new i(ns, os, r);
}
var Lt = {};
p(Lt, {
  PayloadSchema: () => ss,
  ResultSchema: () => Fd,
  commandType: () => as,
  create: () => Wd
});
var ss = t.object({
  browser_id: t.string(),
  name: t.string()
});
var Fd = t.object({});
var as = "name_session";
function Wd(r) {
  return new i(as, ss, r);
}
var zt = {};
p(zt, {
  PayloadSchema: () => is,
  ResultSchema: () => qd,
  commandType: () => cs,
  create: () => Hd
});
var is = t.object({
  browser_id: t.string()
});
var qd = t.object({
  id: t.string().optional()
});
var cs = "selected_tab";
function Hd(r) {
  return new i(cs, is, r);
}
var Ft = {};
p(Ft, {
  PayloadSchema: () => ls,
  ResultSchema: () => $d,
  commandType: () => ds,
  create: () => Gd
});
var ls = t.object({
  browser_id: t.string()
});
var $d = t.object({
  tabs: t.array(t.object({
    id: t.string(),
    providerTabId: t.string().optional(),
    url: t.string().optional(),
    title: t.string().optional()
  }))
});
var ds = "list_tabs";
function Gd(r) {
  return new i(ds, ls, r);
}
var Wt = {};
p(Wt, {
  ContentTypeSchema: () => ps,
  PayloadSchema: () => us,
  ResultSchema: () => Vd,
  commandType: () => ms,
  create: () => Yd
});
var ps = t.enum(["html", "text", "domSnapshot"]);
var us = t.object({
  browser_id: t.string(),
  urls: t.array(t.string()),
  content_type: ps,
  timeout_ms: t.number().int().positive().optional()
});
var Vd = t.object({
  results: t.array(t.object({
    url: t.string(),
    title: t.string().nullable(),
    content: t.string().nullable()
  }))
});
var ms = "tabs_content";
function Yd(r) {
  return new i(ms, us, r);
}
var qe = {};
p(qe, {
  PayloadSchema: () => ys,
  ResultSchema: () => Kd,
  commandType: () => hs,
  create: () => Zd
});
var Xd = t.object({
  readOnlyHint: t.boolean().optional(),
  untrustedContentHint: t.boolean().optional(),
  consequentialHint: t.boolean().optional()
});
var fs = t.object({
  name: t.string(),
  call_name: t.string(),
  registration_id: t.string(),
  title: t.string().optional(),
  description: t.string().optional(),
  input_schema: t.unknown(),
  annotations: Xd.optional(),
  origin: t.string().optional(),
  pageUrl: t.string().optional()
});
var ys = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Kd = t.object({
  tools: t.array(fs)
});
var hs = "webmcp_list_tools";
function Zd(r) {
  return new i(hs, ys, r);
}
var qt = {};
p(qt, {
  PayloadSchema: () => gs,
  ResultSchema: () => Jd,
  commandType: () => bs,
  create: () => Qd
});
var gs = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  tool_name: t.string(),
  tool_description: t.string().optional(),
  tool_origin: t.string().optional(),
  tool_title: t.string().optional(),
  registration_id: t.string(),
  input: t.unknown(),
  timeout_ms: t.number().int().positive().optional()
});
var Jd = t.object({
  result: t.unknown()
});
var bs = "webmcp_invoke_tool";
function Qd(r) {
  return new i(bs, gs, r);
}
var Ht = {};
p(Ht, {
  PayloadSchema: () => _s,
  ResultSchema: () => ep,
  commandType: () => ws,
  create: () => tp
});
var _s = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  url: t.string()
});
var ep = t.object({});
var ws = "navigate_tab_url";
function tp(r) {
  return new i(ws, _s, r);
}
var xe = {};
p(xe, {
  PayloadSchema: () => xs,
  ResultSchema: () => rp,
  commandType: () => Ss,
  create: () => op
});
var xs = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var rp = t.object({});
var Ss = "navigate_tab_back";
function op(r) {
  return new i(Ss, xs, r);
}
var Se = {};
p(Se, {
  PayloadSchema: () => Cs,
  ResultSchema: () => np,
  commandType: () => Ts,
  create: () => sp
});
var Cs = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var np = t.object({});
var Ts = "navigate_tab_forward";
function sp(r) {
  return new i(Ts, Cs, r);
}
var $t = {};
p($t, {
  PayloadSchema: () => Es,
  ResultSchema: () => ap,
  commandType: () => Rs,
  create: () => ip
});
var Es = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var ap = t.object({});
var Rs = "navigate_tab_reload";
function ip(r) {
  return new i(Rs, Es, r);
}
var Gt = {};
p(Gt, {
  PayloadSchema: () => Ps,
  ResultSchema: () => cp,
  commandType: () => As,
  create: () => lp
});
var Ps = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var cp = t.object({
  id: t.string(),
  title: t.string().optional(),
  url: t.string().optional()
});
var As = "browser_user_claim_tab";
function lp(r) {
  return new i(As, Ps, r);
}
var He = {};
p(He, {
  PayloadSchema: () => vs,
  ResultSchema: () => dp,
  commandType: () => Is,
  create: () => pp
});
var vs = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var dp = t.discriminatedUnion("kind", [t.object({
  kind: t.literal("library_file"),
  libraryFileId: t.string().min(1),
  fileId: t.string().min(1),
  fileName: t.string(),
  mimeType: t.string(),
  title: t.string(),
  url: t.string()
}), t.object({
  kind: t.literal("text"),
  text: t.string(),
  title: t.string(),
  truncated: t.boolean(),
  url: t.string()
}), t.object({
  dataBase64: t.string(),
  fileName: t.string(),
  kind: t.literal("document"),
  mimeType: t.string(),
  title: t.string(),
  url: t.string()
})]);
var Is = "browser_user_get_tab_context";
function pp(r) {
  return new i(Is, vs, r);
}
var Vt = {};
p(Vt, {
  PayloadSchema: () => Bs,
  ResultSchema: () => up,
  commandType: () => Os,
  create: () => mp
});
var Bs = t.object({
  browser_id: t.string()
});
var up = t.object({
  tabs: t.array(t.object({
    id: t.string(),
    providerTabId: t.string().optional(),
    title: t.string().optional(),
    url: t.string().optional(),
    lastOpened: t.string().optional(),
    tabGroup: t.string().optional()
  }))
});
var Os = "browser_user_open_tabs";
function mp(r) {
  return new i(Os, Bs, r);
}
var Yt = {};
p(Yt, {
  PayloadSchema: () => Ms,
  ResultSchema: () => fp,
  commandType: () => ks,
  create: () => yp
});
var Ms = t.object({
  browser_id: t.string(),
  queries: t.array(t.string()).min(1).optional(),
  limit: t.number().int().positive().optional(),
  from: t.string().optional(),
  to: t.string().optional()
});
var fp = t.object({
  items: t.array(t.object({
    url: t.string(),
    title: t.string().optional(),
    dateVisited: t.string()
  }))
});
var ks = "browser_user_history";
function yp(r) {
  return new i(ks, Ms, r);
}
var $e = {};
p($e, {
  LogLevelSchema: () => Go,
  PayloadSchema: () => Ns,
  ResultSchema: () => hp,
  commandType: () => Ds,
  create: () => gp
});
var Go = t.enum(["debug", "info", "log", "warn", "error"]);
var Ns = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  filter: t.string().optional(),
  levels: t.array(Go).optional(),
  limit: t.number().int().positive().optional()
});
var hp = t.object({
  logs: t.array(t.object({
    level: Go,
    message: t.string(),
    timestamp: t.string(),
    url: t.string().optional()
  }))
});
var Ds = "tab_dev_logs";
function gp(r) {
  return new i(Ds, Ns, r);
}
var Xt = {};
p(Xt, {
  JsDialogTypeSchema: () => js,
  PayloadSchema: () => Ls,
  ResultDialogSchema: () => Us,
  ResultSchema: () => bp,
  commandType: () => zs,
  create: () => _p
});
var js = t.enum(["alert", "beforeunload", "confirm", "prompt"]);
var Us = t.object({
  id: t.string(),
  type: js
});
var Ls = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var bp = t.object({
  dialog: Us.nullable()
});
var zs = "tab_get_js_dialog";
function _p(r) {
  return new i(zs, Ls, r);
}
var Ce = {};
p(Ce, {
  PayloadSchema: () => Fs,
  ResultSchema: () => wp,
  commandType: () => Ws,
  create: () => xp
});
var Fs = t.object({
  action: t.enum(["accept", "dismiss"]),
  browser_id: t.string(),
  dialog_id: t.string(),
  prompt_text: t.string().optional(),
  tab_id: t.string()
});
var wp = t.object({});
var Ws = "tab_handle_js_dialog";
function xp(r) {
  return new i(Ws, Fs, r);
}
var Kt = {};
p(Kt, {
  PayloadSchema: () => qs,
  ResultSchema: () => Sp,
  commandType: () => Hs,
  create: () => Cp
});
var qs = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Sp = t.object({
  path: t.string()
});
var Hs = "tab_content_export";
function Cp(r) {
  return new i(Hs, qs, r);
}
var Zt = {};
p(Zt, {
  GSuiteExportTypeSchema: () => $s,
  PayloadSchema: () => Gs,
  ResultSchema: () => Tp,
  commandType: () => Vs,
  create: () => Ep
});
var $s = t.enum(["pdf", "md", "xlsx", "csv", "docx", "pptx"]);
var Gs = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  format: $s
});
var Tp = t.object({
  path: t.string()
});
var Vs = "tab_content_export_gsuite";
function Ep(r) {
  return new i(Vs, Gs, r);
}
var Jt = {};
p(Jt, {
  PayloadSchema: () => Ys,
  ResultSchema: () => Rp,
  commandType: () => Xs,
  create: () => Pp
});
var Ys = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Rp = t.object({
  path: t.string()
});
var Xs = "tab_content_export_youtube_transcript";
function Pp(r) {
  return new i(Xs, Ys, r);
}
var Qt = {};
p(Qt, {
  PayloadSchema: () => Ks,
  ResultSchema: () => Ap,
  commandType: () => Zs,
  create: () => vp
});
var Ks = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var Ap = t.object({
  text: t.string()
});
var Zs = "tab_clipboard_read_text";
function vp(r) {
  return new i(Zs, Ks, r);
}
var er = {};
p(er, {
  PayloadSchema: () => Js,
  ResultSchema: () => Ip,
  commandType: () => Qs,
  create: () => Bp
});
var Js = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  text: t.string()
});
var Ip = t.object({});
var Qs = "tab_clipboard_write_text";
function Bp(r) {
  return new i(Qs, Js, r);
}
var tr = {};
p(tr, {
  PayloadSchema: () => ea,
  ResultSchema: () => kp,
  commandType: () => ta,
  create: () => Np
});
var Op = t.object({
  mime_type: t.string(),
  text: t.string().optional(),
  base64: t.string().optional()
}).superRefine((r, e) => {
  let o = r.text !== void 0;
  let n = r.base64 !== void 0;
  o === n && e.addIssue({
    code: t.ZodIssueCode.custom,
    message: "Clipboard entries must set exactly one of text or base64"
  });
});
var Mp = t.object({
  entries: t.array(Op),
  presentation_style: t.enum(["unspecified", "inline", "attachment"]).optional()
});
var ea = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var kp = t.object({
  items: t.array(Mp)
});
var ta = "tab_clipboard_read";
function Np(r) {
  return new i(ta, ea, r);
}
var rr = {};
p(rr, {
  PayloadSchema: () => ra,
  ResultSchema: () => Up,
  commandType: () => oa,
  create: () => Lp
});
var Dp = t.object({
  mime_type: t.string(),
  text: t.string().optional(),
  base64: t.string().optional()
}).superRefine((r, e) => {
  let o = r.text !== void 0;
  let n = r.base64 !== void 0;
  o === n && e.addIssue({
    code: t.ZodIssueCode.custom,
    message: "Clipboard entries must set exactly one of text or base64"
  });
});
var jp = t.object({
  entries: t.array(Dp),
  presentation_style: t.enum(["unspecified", "inline", "attachment"]).optional()
});
var ra = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  items: t.array(jp)
});
var Up = t.object({});
var oa = "tab_clipboard_write";
function Lp(r) {
  return new i(oa, ra, r);
}
var or = {};
p(or, {
  PayloadSchema: () => na,
  ResultSchema: () => zp,
  commandType: () => sa,
  create: () => Fp
});
var na = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  fullPage: t.boolean().optional(),
  cropX: t.number().optional(),
  cropY: t.number().optional(),
  cropWidth: t.number().optional(),
  cropHeight: t.number().optional()
});
var zp = t.object({
  data: t.string()
});
var sa = "tab_screenshot";
function Fp(r) {
  return new i(sa, na, r);
}
var nr = {};
p(nr, {
  PayloadSchema: () => aa,
  ResultSchema: () => Wp,
  commandType: () => ia,
  create: () => qp
});
var aa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  content: t.enum(["axState", "screenshot", "axStateAndScreenshot"]),
  disable_diffing: t.boolean().optional()
});
var Wp = t.object({
  state: t.string().optional(),
  data: t.string().optional(),
  screenshot_unavailable: t.string().optional()
});
var ia = "tab_ax_get_state";
function qp(r) {
  return new i(ia, aa, r);
}
var sr = {};
p(sr, {
  ActionSchema: () => la,
  PayloadSchema: () => da,
  ResultSchema: () => Hp,
  commandType: () => pa,
  create: () => $p
});
var Vo = t.tuple([t.number(), t.number()]);
var Te = t.number().int().nonnegative();
var ca = t.union([Te, Vo]);
var la = t.discriminatedUnion("kind", [t.object({
  kind: t.literal("paste"),
  element_index: Te.nullable(),
  text: t.string(),
  format: t.enum(["text", "md", "html"]).optional()
}), t.object({
  kind: t.literal("click"),
  target: ca,
  mouse_button: t.enum(["left", "right", "middle", "l", "r", "m"]).optional(),
  click_count: t.number().int().positive().optional(),
  key: t.string().optional(),
  duration: t.number().finite().min(0).max(30).optional()
}), t.object({
  kind: t.literal("drag"),
  from: Vo,
  to: Vo
}), t.object({
  kind: t.literal("perform_secondary_action"),
  element_index: Te,
  action: t.string()
}), t.object({
  kind: t.literal("press_key"),
  element_index: Te.nullable(),
  key: t.string(),
  duration: t.number().finite().min(0).max(30).optional()
}), t.object({
  kind: t.literal("scroll"),
  target: ca,
  direction: t.enum(["up", "down", "left", "right", "u", "d", "l", "r"]),
  pages: t.number().optional()
}), t.object({
  kind: t.literal("select_text"),
  element_index: Te,
  text: t.string(),
  prefix: t.string().optional(),
  suffix: t.string().optional(),
  selection_type: t.enum(["text", "cursor_before", "cursor_after"]).optional()
}), t.object({
  kind: t.literal("set_value"),
  element_index: Te,
  value: t.string()
}), t.object({
  kind: t.literal("type_text"),
  element_index: Te.nullable(),
  text: t.string()
})]);
var da = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  action: la
});
var Hp = t.object({});
var pa = "tab_ax_action";
function $p(r) {
  return new i(pa, da, r);
}
var Ee = {};
p(Ee, {
  PayloadSchema: () => ua,
  ResultSchema: () => Gp,
  commandType: () => ma,
  create: () => Vp
});
var ua = t.object({
  browser_id: t.string(),
  selector: t.string().optional(),
  selector_mode: t.literal("all").optional(),
  tab_id: t.string(),
  script: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Gp = t.object({
  value: t.unknown().optional()
});
var ma = "playwright_evaluate";
function Vp(r) {
  return new i(ma, ua, r);
}
var ar = {};
p(ar, {
  PayloadSchema: () => fa,
  ResultSchema: () => Yp,
  commandType: () => ya,
  create: () => Xp
});
var fa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  button: t.number().optional(),
  keys: t.array(t.string()).optional()
});
var Yp = t.object({});
var ya = "cua_click";
function Xp(r) {
  return new i(ya, fa, r);
}
var ir = {};
p(ir, {
  PayloadSchema: () => ha,
  ResultSchema: () => Kp,
  commandType: () => ga,
  create: () => Zp
});
var ha = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  timeout_ms: t.number().int().positive().optional()
});
var Kp = t.object({});
var ga = "cua_download_media";
function Zp(r) {
  return new i(ga, ha, r);
}
var cr = {};
p(cr, {
  PayloadSchema: () => ba,
  ResultSchema: () => Jp,
  commandType: () => _a,
  create: () => Qp
});
var ba = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  keys: t.array(t.string()).optional()
});
var Jp = t.object({});
var _a = "cua_double_click";
function Qp(r) {
  return new i(_a, ba, r);
}
var lr = {};
p(lr, {
  PayloadSchema: () => wa,
  ResultSchema: () => eu,
  commandType: () => xa,
  create: () => tu
});
var wa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  keys: t.array(t.string())
});
var eu = t.object({});
var xa = "cua_keypress";
function tu(r) {
  return new i(xa, wa, r);
}
var dr = {};
p(dr, {
  PayloadSchema: () => Sa,
  ResultSchema: () => ru,
  commandType: () => Ca,
  create: () => ou
});
var Sa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  path: t.array(t.object({
    x: t.number(),
    y: t.number()
  })),
  keys: t.array(t.string()).optional()
});
var ru = t.object({});
var Ca = "cua_drag";
function ou(r) {
  return new i(Ca, Sa, r);
}
var pr = {};
p(pr, {
  PayloadSchema: () => Ta,
  ResultSchema: () => nu,
  commandType: () => Ea,
  create: () => su
});
var Ta = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  keys: t.array(t.string()).optional()
});
var nu = t.object({});
var Ea = "cua_move";
function su(r) {
  return new i(Ea, Ta, r);
}
var ur = {};
p(ur, {
  PayloadSchema: () => Ra,
  ResultSchema: () => au,
  commandType: () => Pa,
  create: () => iu
});
var Ra = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  scroll_x: t.number(),
  scroll_y: t.number(),
  keys: t.array(t.string()).optional()
});
var au = t.object({});
var Pa = "cua_scroll";
function iu(r) {
  return new i(Pa, Ra, r);
}
var mr = {};
p(mr, {
  PayloadSchema: () => Aa,
  ResultSchema: () => cu,
  commandType: () => va,
  create: () => lu
});
var Aa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  text: t.string()
});
var cu = t.object({});
var va = "cua_type";
function lu(r) {
  return new i(va, Aa, r);
}
var Ge = {};
p(Ge, {
  DomNodeIdSchema: () => z,
  PayloadSchema: () => Ia,
  ResultSchema: () => du,
  commandType: () => Ba,
  create: () => pu
});
var z = t.string({
  required_error: "node_id is required",
  invalid_type_error: "node_id must be a string"
}).min(1, "node_id must not be empty");
var Ia = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  node_id: z
});
var du = t.object({});
var Ba = "dom_cua_click";
function pu(r) {
  return new i(Ba, Ia, r);
}
var fr = {};
p(fr, {
  PayloadSchema: () => Oa,
  ResultSchema: () => uu,
  commandType: () => Ma,
  create: () => mu
});
var Oa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  node_id: z,
  timeout_ms: t.number().int().positive().optional()
});
var uu = t.object({});
var Ma = "dom_cua_download_media";
function mu(r) {
  return new i(Ma, Oa, r);
}
var yr = {};
p(yr, {
  PayloadSchema: () => ka,
  ResultSchema: () => fu,
  commandType: () => Na,
  create: () => yu
});
var ka = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  node_id: z
});
var fu = t.object({});
var Na = "dom_cua_double_click";
function yu(r) {
  return new i(Na, ka, r);
}
var hr = {};
p(hr, {
  PayloadSchema: () => Da,
  ResultSchema: () => hu,
  commandType: () => ja,
  create: () => gu
});
var Da = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var hu = t.unknown();
var ja = "dom_cua_get_visible_dom";
function gu(r) {
  return new i(ja, Da, r);
}
var gr = {};
p(gr, {
  PayloadSchema: () => Ua,
  ResultSchema: () => bu,
  commandType: () => La,
  create: () => _u
});
var Ua = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  keys: t.array(t.string())
});
var bu = t.object({});
var La = "dom_cua_keypress";
function _u(r) {
  return new i(La, Ua, r);
}
var br = {};
p(br, {
  PayloadSchema: () => za,
  ResultSchema: () => wu,
  commandType: () => Fa,
  create: () => xu
});
var za = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  scroll_x: t.number(),
  scroll_y: t.number(),
  node_id: z.optional()
});
var wu = t.object({});
var Fa = "dom_cua_scroll";
function xu(r) {
  return new i(Fa, za, r);
}
var _r = {};
p(_r, {
  PayloadSchema: () => Wa,
  ResultSchema: () => Su,
  commandType: () => qa,
  create: () => Cu
});
var Wa = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  text: t.string()
});
var Su = t.object({});
var qa = "dom_cua_type";
function Cu(r) {
  return new i(qa, Wa, r);
}
var wr = {};
p(wr, {
  PayloadSchema: () => Ha,
  ResultSchema: () => Tu,
  commandType: () => $a,
  create: () => Eu
});
var Ha = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  modifiers: t.array(t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional(),
  button: t.enum(["left", "right", "middle"]).optional(),
  force: t.boolean().optional(),
  timeout_ms: t.number().int().positive().optional()
});
var Tu = t.object({});
var $a = "playwright_locator_click";
function Eu(r) {
  return new i($a, Ha, r);
}
var xr = {};
p(xr, {
  PayloadSchema: () => Ga,
  ResultSchema: () => Ru,
  commandType: () => Va,
  create: () => Pu
});
var Ga = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  modifiers: t.array(t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional(),
  button: t.enum(["left", "right", "middle"]).optional(),
  force: t.boolean().optional(),
  timeout_ms: t.number().int().positive().optional()
});
var Ru = t.object({});
var Va = "playwright_locator_dblclick";
function Pu(r) {
  return new i(Va, Ga, r);
}
var Sr = {};
p(Sr, {
  PayloadSchema: () => Ya,
  ResultSchema: () => Au,
  commandType: () => Xa,
  create: () => vu
});
var Ya = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Au = t.object({
  path: t.string()
});
var Xa = "playwright_locator_download_media";
function vu(r) {
  return new i(Xa, Ya, r);
}
var Ve = {};
p(Ve, {
  PayloadSchema: () => Ka,
  ResultSchema: () => Iu,
  commandType: () => Za,
  create: () => Bu
});
var Ka = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  value: t.string(),
  replace: t.boolean(),
  timeout_ms: t.number().int().positive().optional()
});
var Iu = t.object({});
var Za = "playwright_locator_fill";
function Bu(r) {
  return new i(Za, Ka, r);
}
var Cr = {};
p(Cr, {
  PayloadSchema: () => Ja,
  ResultSchema: () => Ou,
  commandType: () => Qa,
  create: () => Mu
});
var Ja = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  value: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Ou = t.object({});
var Qa = "playwright_locator_press";
function Mu(r) {
  return new i(Qa, Ja, r);
}
var Tr = {};
p(Tr, {
  PayloadSchema: () => ei,
  ResultSchema: () => ku,
  commandType: () => ti,
  create: () => Nu
});
var ei = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  value: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var ku = t.object({});
var ti = "playwright_locator_press_sequentially";
function Nu(r) {
  return new i(ti, ei, r);
}
var Er = {};
p(Er, {
  PayloadSchema: () => ri,
  ResultSchema: () => Du,
  commandType: () => oi,
  create: () => ju
});
var ri = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  state: t.enum(["attached", "detached", "visible", "hidden"]),
  timeout_ms: t.number().int().positive().optional()
});
var Du = t.object({});
var oi = "playwright_locator_wait_for";
function ju(r) {
  return new i(oi, ri, r);
}
var Rr = {};
p(Rr, {
  PayloadSchema: () => ni,
  ResultSchema: () => Uu,
  commandType: () => si,
  create: () => Lu
});
var ni = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string()
});
var Uu = t.object({
  count: t.number().int()
});
var si = "playwright_locator_count";
function Lu(r) {
  return new i(si, ni, r);
}
var Pr = {};
p(Pr, {
  PayloadSchema: () => ii,
  ResultSchema: () => zu,
  SelectOptionSchema: () => ai,
  commandType: () => ci,
  create: () => Fu
});
var ai = t.object({
  value: t.string().optional(),
  label: t.string().optional(),
  index: t.number().int().nonnegative().optional()
}).superRefine((r, e) => {
  r.value === void 0 && r.label === void 0 && r.index === void 0 && e.addIssue({
    code: t.ZodIssueCode.custom,
    message: "Select option requires value, label, or index"
  });
});
var ii = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  selections: t.array(ai).min(1),
  timeout_ms: t.number().int().positive().optional()
});
var zu = t.object({});
var ci = "playwright_locator_select_option";
function Fu(r) {
  return new i(ci, ii, r);
}
var Ar = {};
p(Ar, {
  PayloadSchema: () => li,
  ResultSchema: () => Wu,
  commandType: () => di,
  create: () => qu
});
var li = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  checked: t.boolean(),
  force: t.boolean().optional(),
  timeout_ms: t.number().int().positive().optional()
});
var Wu = t.object({});
var di = "playwright_locator_set_checked";
function qu(r) {
  return new i(di, li, r);
}
var vr = {};
p(vr, {
  PayloadSchema: () => pi,
  ResultSchema: () => Hu,
  commandType: () => ui,
  create: () => $u
});
var pi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string()
});
var Hu = t.object({
  value: t.boolean()
});
var ui = "playwright_locator_is_visible";
function $u(r) {
  return new i(ui, pi, r);
}
var Ir = {};
p(Ir, {
  PayloadSchema: () => mi,
  ResultSchema: () => Gu,
  commandType: () => fi,
  create: () => Vu
});
var mi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string()
});
var Gu = t.object({
  value: t.boolean()
});
var fi = "playwright_locator_is_enabled";
function Vu(r) {
  return new i(fi, mi, r);
}
var Br = {};
p(Br, {
  PayloadSchema: () => yi,
  ResultSchema: () => Yu,
  commandType: () => hi,
  create: () => Xu
});
var yi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Yu = t.object({
  values: t.array(t.string())
});
var hi = "playwright_locator_all_text_contents";
function Xu(r) {
  return new i(hi, yi, r);
}
var Or = {};
p(Or, {
  PayloadSchema: () => gi,
  ResultSchema: () => Ku,
  commandType: () => bi,
  create: () => Zu
});
var gi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Ku = t.object({
  value: t.string().nullable()
});
var bi = "playwright_locator_text_content";
function Zu(r) {
  return new i(bi, gi, r);
}
var Mr = {};
p(Mr, {
  PayloadSchema: () => _i,
  ResultSchema: () => Ju,
  commandType: () => wi,
  create: () => Qu
});
var _i = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Ju = t.object({
  value: t.string()
});
var wi = "playwright_locator_inner_text";
function Qu(r) {
  return new i(wi, _i, r);
}
var kr = {};
p(kr, {
  PayloadSchema: () => xi,
  ResultSchema: () => em,
  commandType: () => Si,
  create: () => tm
});
var xi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  name: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var em = t.object({
  value: t.string().nullable()
});
var Si = "playwright_locator_get_attribute";
function tm(r) {
  return new i(Si, xi, r);
}
var Nr = {};
p(Nr, {
  PayloadSchema: () => Ci,
  ResultSchema: () => om,
  commandType: () => Ti,
  create: () => nm
});
var Ci = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  selector: t.string(),
  relative_selector: t.string().optional(),
  timeout_ms: t.number().int().positive().optional()
});
var rm = t.object({
  attributes: t.record(t.string()),
  inner_text: t.string(),
  text_content: t.string().nullable()
});
var om = t.object({
  values: t.array(rm.nullable())
});
var Ti = "playwright_locator_read_all";
function nm(r) {
  return new i(Ti, Ci, r);
}
var Dr = {};
p(Dr, {
  PayloadSchema: () => Ei,
  ResultSchema: () => am,
  commandType: () => Ri,
  create: () => im
});
var sm = t.enum(["load", "domcontentloaded", "networkidle", "commit"]);
var Ei = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  url: t.string(),
  wait_until: sm.optional(),
  timeout_ms: t.number().int().positive().optional()
});
var am = t.object({
  url: t.string().optional()
});
var Ri = "playwright_wait_for_url";
function im(r) {
  return new i(Ri, Ei, r);
}
var jr = {};
p(jr, {
  LoadStateSchema: () => Pi,
  PayloadSchema: () => Ai,
  ResultSchema: () => cm,
  commandType: () => vi,
  create: () => lm
});
var Pi = t.enum(["load", "domcontentloaded", "networkidle"]);
var Ai = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  state: Pi.optional(),
  timeout_ms: t.number().int().positive().optional()
});
var cm = t.object({});
var vi = "playwright_wait_for_load_state";
function lm(r) {
  return new i(vi, Ai, r);
}
var Ur = {};
p(Ur, {
  PayloadSchema: () => Ii,
  ResultSchema: () => dm,
  commandType: () => Bi,
  create: () => pm
});
var Ii = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  timeout_ms: t.number().int().nonnegative()
});
var dm = t.object({});
var Bi = "playwright_wait_for_timeout";
function pm(r) {
  return new i(Bi, Ii, r);
}
var Lr = {};
p(Lr, {
  PayloadSchema: () => Oi,
  ResultSchema: () => um,
  commandType: () => Mi,
  create: () => mm
});
var Oi = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var um = t.object({
  dom_snapshot: t.string()
});
var Mi = "playwright_dom_snapshot";
function mm(r) {
  return new i(Mi, Oi, r);
}
var zr = {};
p(zr, {
  PayloadSchema: () => ki,
  ResultSchema: () => gm,
  commandType: () => Ni,
  create: () => bm
});
var fm = t.object({
  x: t.number(),
  y: t.number(),
  width: t.number(),
  height: t.number()
});
var ym = t.object({
  primary: t.string().nullable().optional(),
  candidates: t.array(t.string()),
  frameSelectors: t.array(t.string()).optional()
});
var hm = t.object({
  nodeId: t.number().int().positive().nullable().optional(),
  tagName: t.string(),
  role: t.string().nullable().optional(),
  visibleText: t.string().nullable().optional(),
  ariaName: t.string().nullable().optional(),
  testId: t.string().nullable().optional(),
  boundingBox: fm.nullable().optional(),
  preview: t.string(),
  selector: ym
});
var ki = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  include_non_interactable: t.boolean().optional()
});
var gm = t.array(hm);
var Ni = "playwright_element_info";
function bm(r) {
  return new i(Ni, ki, r);
}
var Fr = {};
p(Fr, {
  PayloadSchema: () => Di,
  ResultSchema: () => _m,
  commandType: () => ji,
  create: () => wm
});
var Di = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  x: t.number(),
  y: t.number(),
  include_non_interactable: t.boolean().optional()
});
var _m = t.object({
  data: t.string()
});
var ji = "playwright_element_screenshot";
function wm(r) {
  return new i(ji, Di, r);
}
var Wr = {};
p(Wr, {
  PayloadSchema: () => Ui,
  ResultSchema: () => xm,
  commandType: () => Li,
  create: () => Sm
});
var Ui = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var xm = t.object({
  download_id: t.string()
});
var Li = "playwright_wait_for_download";
function Sm(r) {
  return new i(Li, Ui, r);
}
var qr = {};
p(qr, {
  PayloadSchema: () => zi,
  ResultSchema: () => Cm,
  commandType: () => Fi,
  create: () => Tm
});
var zi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  download_id: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Cm = t.object({
  path: t.string().nullable()
});
var Fi = "playwright_download_path";
function Tm(r) {
  return new i(Fi, zi, r);
}
var Hr = {};
p(Hr, {
  PayloadSchema: () => Wi,
  ResultSchema: () => Em,
  commandType: () => qi,
  create: () => Rm
});
var Wi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  timeout_ms: t.number().int().positive().optional()
});
var Em = t.object({
  file_chooser_id: t.string(),
  is_multiple: t.boolean()
});
var qi = "playwright_wait_for_file_chooser";
function Rm(r) {
  return new i(qi, Wi, r);
}
var $r = {};
p($r, {
  PayloadSchema: () => Hi,
  ResultSchema: () => Pm,
  commandType: () => $i,
  create: () => Am
});
var Hi = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  file_chooser_id: t.string(),
  files: t.array(t.string()),
  timeout_ms: t.number().int().positive().optional()
});
var Pm = t.object({});
var $i = "playwright_file_chooser_set_files";
function Am(r) {
  return new i($i, Hi, r);
}
var Ye = class {
  #e;
  #r;
  #t;
  constructor({
    createBrowser: e,
    onBrowserUsed: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async list() {
    return await this.#t.send({
      command: vt.create()
    });
  }
  async get(e) {
    if (!e) throw new Error("browsers.get requires a browser id");
    let o = await this.#t.send({
      command: It.create({
        id: e
      })
    });
    return this.#o(o);
  }
  async getDefault() {
    let e = await this.#t.send({
      command: Bt.create()
    });
    return this.#o(e);
  }
  async getForUrl(e) {
    let o = await this.#t.send({
      command: kt.create({
        url: e
      })
    });
    return this.#o(o);
  }
  #o(e) {
    return this.#r?.(e), this.#e({
      browserInfo: e,
      onBrowserUsed: () => this.#r?.(e),
      transport: this.#t
    });
  }
};
var Q = class {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async get(e) {
    return await this.#e.send({
      command: Ot.create({
        name: e
      })
    });
  }
};
var Xe = class {
  constructor({
    createBrowser: e,
    onBrowserUsed: o,
    transport: n
  }) {
    if (!n) throw new Error("Agent requires a transport instance");
    this.documentation = new Q(n);
    this.browsers = new Ye({
      createBrowser: e,
      onBrowserUsed: o,
      transport: n
    });
  }
};
var Ke = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    createTab: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async new() {
    let e = await this.#t.send({
      command: Nt.create({
        browser_id: this.#e
      })
    });
    return this.#r(e);
  }
  async selected() {
    let e = await this.#t.send({
      command: zt.create({
        browser_id: this.#e
      })
    });
    if (e.id) return this.#r(e);
  }
  async list() {
    return (await this.#t.send({
      command: Ft.create({
        browser_id: this.#e
      })
    })).tabs;
  }
  async content(e) {
    let o = Wt.create({
      browser_id: this.#e,
      urls: e.urls,
      content_type: e.contentType,
      ...(e.timeoutMs === void 0 ? {} : {
        timeout_ms: e.timeoutMs
      })
    });
    return o.parse(), e.urls.length === 0 ? [] : (await this.#t.send({
      command: o
    })).results;
  }
  async get(e) {
    if (!e) throw new Error("tabs.get requires a tab id");
    let o = await this.#t.send({
      command: we.create({
        browser_id: this.#e,
        tab_id: e
      })
    });
    return this.#r(o);
  }
};
var Gi = () => `req-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
var ee = r => {
  let e = atob(r);
  let o = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n += 1) o[n] = e.charCodeAt(n);
  return o;
};
var Ze = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    createTab: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async openTabs() {
    return (await this.#t.send({
      command: Vt.create({
        browser_id: this.#e
      })
    })).tabs;
  }
  async getTabContext(e) {
    let o = await this.#t.send({
      command: He.create({
        browser_id: this.#e,
        tab_id: Vi(e, "getTabContext")
      })
    });
    let n = He.ResultSchema.parse(o);
    return n.kind !== "document" ? n : {
      data: ee(n.dataBase64),
      fileName: n.fileName,
      kind: n.kind,
      mimeType: n.mimeType,
      title: n.title,
      url: n.url
    };
  }
  async claimTab(e) {
    let o = Vi(e, "claimTab");
    let n = await this.#t.send({
      command: Gt.create({
        browser_id: this.#e,
        tab_id: o
      })
    });
    return this.#r(n);
  }
};
var Vi = (r, e) => {
  if (typeof r == "string") {
    if (r.length === 0) throw new Error(`browser.user.${e} received an empty tab id`);
    return r;
  }
  if (r && typeof r == "object" && typeof r.id == "string") return r.id;
  throw new Error(`browser.user.${e} expects a tab returned by browser.user.openTabs() or a tab id`);
};
var Yi = Object.getOwnPropertyDescriptor(RegExp.prototype, "source")?.get;
function Je(r) {
  if (r == null || typeof r != "object" || !Yi) return false;
  try {
    return Reflect.apply(Yi, r, []), true;
  } catch {
    return false;
  }
}
function co(r) {
  if (r == null || typeof r != "object") return false;
  let e = Object.getPrototypeOf(r);
  return e === null || Object.getPrototypeOf(e) === null;
}
function Xi(r, e) {
  if (r == null || typeof r != "object") return false;
  try {
    return "message" in r && r.message === e;
  } catch {
    return false;
  }
}
function lo(r, e) {
  let o = r instanceof Error ? r.message : String(r);
  let n = new Error(`${o}
${e}`);
  return r instanceof Error && r.stack && (n.stack = `${n.name}: ${n.message}
${r.stack}`), n;
}
function vm(r, e) {
  let o = r instanceof Error ? r.message : String(r);
  return /strict mode violation/i.test(o) ? "multiple_matches" : /intercept|receives pointer events/i.test(o) ? "intercepted" : e.matchCount === 0 ? "no_matches" : e.visibleCount === 0 ? "no_visible_match" : "action_failed";
}
function Im(r, e) {
  let o = Qi(e);
  if (typeof r == "string") {
    if (r.length === 0) throw new Error("playwright.evaluate requires a pageFunction");
    return `const arg = ${o};
return (${r});`;
  }
  if (typeof r == "function") return [`const arg = ${o};`, `const __playwrightEvaluate = (${r.toString()});`, "return await __playwrightEvaluate(arg);"].join(`
`);
  throw new Error("playwright.evaluate requires a string or function");
}
function Ki(r, e, o) {
  let n = Qi(e);
  let s = o === "all" ? "locator.evaluateAll" : "locator.evaluate";
  if (typeof r == "string") {
    if (r.length === 0) throw new Error(`${s} requires a pageFunction`);
    return `const arg = ${n};
return (${r});`;
  }
  if (typeof r == "function") return [`const arg = ${n};`, `const __playwrightEvaluate = (${r.toString()});`, `return await __playwrightEvaluate(${o === "all" ? "elements" : "element"}, arg);`].join(`
`);
  throw new Error(`${s} requires a string or function`);
}
function Qi(r) {
  if (r === void 0) return "undefined";
  try {
    let e = JSON.stringify(r);
    if (e !== void 0) return e;
  } catch (e) {
    throw lo(e, "playwright.evaluate arg must be JSON-serializable");
  }
  throw new Error("playwright.evaluate arg must be JSON-serializable");
}
function Zi(r, e) {
  let {
    x: o,
    y: n
  } = e;
  if (!Number.isFinite(o) || !Number.isFinite(n)) throw new Error(`${r} requires numeric x and y coordinates`);
  return {
    x: o,
    y: n
  };
}
function Bm(r) {
  let e = Array.isArray(r) ? r : [r];
  if (!e.length) throw new Error("locator.selectOption requires at least one value");
  return e.map(o => {
    if (typeof o == "string") return {
      value: o
    };
    if (!o || typeof o != "object") throw new Error("locator.selectOption requires a string or { value?, label?, index? }");
    let n = {};
    if (o.value !== void 0) {
      if (typeof o.value != "string") throw new Error("locator.selectOption value must be a string");
      n.value = o.value;
    }
    if (o.label !== void 0) {
      if (typeof o.label != "string") throw new Error("locator.selectOption label must be a string");
      n.label = o.label;
    }
    if (o.index !== void 0) {
      if (!Number.isInteger(o.index) || o.index < 0) throw new Error("locator.selectOption index must be a non-negative integer");
      n.index = o.index;
    }
    if (n.value === void 0 && n.label === void 0 && n.index === void 0) throw new Error("locator.selectOption requires value, label, or index for each selection");
    return n;
  });
}
var Ji = Symbol("browserAuthSelectorDetails");
var Y = class r {
  #e;
  #r;
  #t;
  #o;
  #n;
  #s;
  #a;
  constructor({
    browserId: e,
    tabId: o,
    selector: n,
    transport: s,
    collectionReadCache: a,
    collectionReadIndex: c,
    collectionRelativeSelector: l
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
    this.#o = s;
    this.#n = a;
    this.#s = c;
    this.#a = l;
  }
  static browserAuthSelector(e) {
    return e[Ji]();
  }
  [Ji]() {
    return {
      browserId: this.#e,
      selector: this.#t,
      tabId: this.#r
    };
  }
  async click(e = {}) {
    try {
      await this.#o.send({
        command: wr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          modifiers: e.modifiers,
          button: e.button,
          force: e.force,
          timeout_ms: e.timeoutMs
        }),
        timeoutMs: e.timeoutMs
      });
      this.#n?.clear();
    } catch (o) {
      throw await this.actionError(o, "click", `waiting on click for selector ${this.#t}`);
    }
  }
  async dblclick(e = {}) {
    try {
      await this.#o.send({
        command: xr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          modifiers: e.modifiers,
          button: e.button,
          force: e.force,
          timeout_ms: e.timeoutMs
        }),
        timeoutMs: e.timeoutMs
      });
      this.#n?.clear();
    } catch (o) {
      throw await this.actionError(o, "dblclick", `waiting on dblclick for selector ${this.#t}`);
    }
  }
  async selectOption(e, {
    timeoutMs: o
  } = {}) {
    let n = Bm(e);
    try {
      await this.#o.send({
        command: Pr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          selections: n,
          timeout_ms: o
        }),
        timeoutMs: o
      });
      this.#n?.clear();
    } catch (s) {
      throw await this.actionError(s, "selectOption", `locator.selectOption failed for selector ${this.#t}`);
    }
  }
  async fill(e, {
    timeoutMs: o
  } = {}) {
    if (e == null) throw new Error("locator.fill requires a value");
    try {
      await this.#o.send({
        command: Ve.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          value: e,
          replace: true,
          timeout_ms: o
        }),
        timeoutMs: o
      });
      this.#n?.clear();
    } catch (n) {
      throw await this.actionError(n, "fill", `locator.fill failed for selector ${this.#t}`);
    }
  }
  async type(e, {
    timeoutMs: o
  } = {}) {
    if (e == null) throw new Error("locator.type requires a value");
    try {
      await this.#o.send({
        command: Ve.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          value: e,
          replace: false,
          timeout_ms: o
        }),
        timeoutMs: o
      });
      this.#n?.clear();
    } catch (n) {
      throw await this.actionError(n, "type", `locator.type failed for selector ${this.#t}`);
    }
  }
  async pressSequentially(e, o = {}) {
    if (e == null) throw new Error("locator.pressSequentially requires a value");
    try {
      await this.#o.send({
        command: Tr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          value: e,
          ...(o.timeoutMs == null ? {} : {
            timeout_ms: o.timeoutMs
          })
        }),
        timeoutMs: o.timeoutMs
      });
      this.#n?.clear();
    } catch (n) {
      throw await this.actionError(n, "pressSequentially", `locator.pressSequentially failed for selector ${this.#t}`);
    }
  }
  async press(e, {
    timeoutMs: o
  } = {}) {
    if (e == null) throw new Error("locator.press requires a value");
    try {
      await this.#o.send({
        command: Cr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          value: e,
          timeout_ms: o
        }),
        timeoutMs: o
      });
      this.#n?.clear();
    } catch (n) {
      throw await this.actionError(n, "press", `locator.press failed for selector ${this.#t}`);
    }
  }
  async setChecked(e, o = {}) {
    if (typeof e != "boolean") throw new Error("locator.setChecked requires a boolean");
    try {
      await this.#o.send({
        command: Ar.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          checked: e,
          force: o.force,
          timeout_ms: o.timeoutMs
        }),
        timeoutMs: o.timeoutMs
      });
      this.#n?.clear();
    } catch (n) {
      throw await this.actionError(n, "setChecked", `locator.setChecked(${e}) failed for selector ${this.#t}`);
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
    timeoutMs: o
  }) {
    if (!e) throw new Error("locator.waitFor requires a state");
    try {
      await this.#o.send({
        command: Er.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          state: e,
          timeout_ms: o
        }),
        timeoutMs: o
      });
    } catch (n) {
      throw await this.actionError(n, "waitFor", `locator.waitFor(${e}) timed out for selector ${this.#t}`);
    }
  }
  async count() {
    return (await this.#o.send({
      command: Rr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t
      })
    })).count;
  }
  async all() {
    let e = await this.count();
    let o = new Yo({
      browserId: this.#e,
      tabId: this.#r,
      selector: this.#t,
      transport: this.#o
    });
    return Array.from({
      length: e
    }, (n, s) => new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> nth=${s}`,
      transport: this.#o,
      collectionReadCache: o,
      collectionReadIndex: s
    }));
  }
  async textContent({
    timeoutMs: e
  } = {}) {
    let o = await this.cachedRead(e);
    return o ? o.text_content : (await this.#o.send({
      command: Or.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t,
        timeout_ms: e
      }),
      timeoutMs: e
    })).value;
  }
  async innerText({
    timeoutMs: e
  } = {}) {
    let o = await this.cachedRead(e);
    return o ? o.inner_text : (await this.#o.send({
      command: Mr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t,
        timeout_ms: e
      }),
      timeoutMs: e
    })).value;
  }
  async getAttribute(e, {
    timeoutMs: o
  } = {}) {
    if (!e) throw new Error("locator.getAttribute requires a name");
    let n = await this.cachedRead(o);
    return n ? Object.prototype.hasOwnProperty.call(n.attributes, e) ? n.attributes[e] ?? null : null : (await this.#o.send({
      command: kr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t,
        name: e,
        timeout_ms: o
      }),
      timeoutMs: o
    })).value;
  }
  async isVisible() {
    return (await this.#o.send({
      command: vr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t
      })
    })).value;
  }
  async isEnabled() {
    return (await this.#o.send({
      command: Ir.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t
      })
    })).value;
  }
  async allTextContents({
    timeoutMs: e
  } = {}) {
    return (await this.#o.send({
      command: Br.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t,
        timeout_ms: e
      }),
      timeoutMs: e
    })).values;
  }
  async evaluate(e, o, n) {
    return (await this.#o.send({
      command: Ee.create({
        browser_id: this.#e,
        script: Ki(e, o),
        selector: this.#t,
        tab_id: this.#r,
        timeout_ms: n?.timeoutMs
      }),
      timeoutMs: n?.timeoutMs
    })).value;
  }
  async evaluateAll(e, o, n) {
    return (await this.#o.send({
      command: Ee.create({
        browser_id: this.#e,
        script: Ki(e, o, "all"),
        selector: this.#t,
        selector_mode: "all",
        tab_id: this.#r,
        timeout_ms: n?.timeoutMs
      }),
      timeoutMs: n?.timeoutMs
    })).value;
  }
  async actionError(e, o, n) {
    try {
      let s = await this.evaluateAll(a => ({
        matchCount: a.length,
        visibleCount: a.reduce((c, l) => c + +(l.getClientRects().length > 0), 0),
        matches: a.slice(0, 5).map(c => ({
          tag: c.tagName.toLowerCase(),
          role: c.getAttribute("role"),
          type: c.getAttribute("type"),
          ariaLabel: c.getAttribute("aria-label"),
          text: c.textContent?.trim().slice(0, 120) ?? "",
          visible: c.getClientRects().length > 0,
          disabled: "disabled" in c && !!c.disabled
        }))
      }), void 0, {
        timeoutMs: 1e3
      });
      return lo(e, `${n}
Locator diagnostics: ${JSON.stringify({
        kind: vm(e, s),
        action: o,
        locator: this.#t,
        ...s,
        truncated: s.matchCount > s.matches.length
      })}`);
    } catch {
      return lo(e, n);
    }
  }
  async downloadMedia({
    timeoutMs: e = 12e4
  } = {}) {
    try {
      let o = await this.#o.send({
        command: Sr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          selector: this.#t,
          timeout_ms: e
        }),
        timeoutMs: e
      });
      return this.#n?.clear(), o.path;
    } catch (o) {
      throw await this.actionError(o, "downloadMedia", `locator.downloadMedia failed for selector ${this.#t}`);
    }
  }
  locator(e, o = {}) {
    if (!e) throw new Error("locator.locator requires a selector");
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${e}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, e) : void 0
    }).filter(o);
  }
  first() {
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> nth=0`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, "nth=0") : void 0
    });
  }
  last() {
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> nth=-1`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, "nth=-1") : void 0
    });
  }
  nth(e) {
    if (typeof e != "number") throw new Error("locator.nth requires a numeric index");
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> nth=${e}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, `nth=${e}`) : void 0
    });
  }
  and(e) {
    if (!(e instanceof r)) throw new Error("locator.and requires a PlaywrightLocator");
    if (e.#e !== this.#e || e.#r !== this.#r) throw new Error("Locators must belong to the same tab");
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> internal:and=${JSON.stringify(e.#t)}`,
      transport: this.#o
    });
  }
  or(e) {
    if (!(e instanceof r)) throw new Error("locator.or requires a PlaywrightLocator");
    if (e.#e !== this.#e || e.#r !== this.#r) throw new Error("Locators must belong to the same tab");
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> internal:or=${JSON.stringify(e.#t)}`,
      transport: this.#o
    });
  }
  filter(e = {}) {
    let o = [this.#t];
    if (e.hasText !== void 0 && o.push(`internal:has-text=${po(e.hasText, false)}`), e.hasNotText !== void 0 && o.push(`internal:has-not-text=${po(e.hasNotText, false)}`), e.has !== void 0 && (this.assertCompatibleLocator(e.has, "locator.filter has"), o.push(`internal:has=${JSON.stringify(e.has.#t)}`)), e.hasNot !== void 0 && (this.assertCompatibleLocator(e.hasNot, "locator.filter hasNot"), o.push(`internal:has-not=${JSON.stringify(e.hasNot.#t)}`)), e.visible !== void 0) {
      if (typeof e.visible != "boolean") throw new Error("locator.filter visible must be a boolean");
      o.push(`visible=${e.visible}`);
    }
    let n = o.slice(1).join(" >> ");
    let s = this.#n && this.#s !== void 0 && (!n || this.#a !== void 0);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: o.join(" >> "),
      transport: this.#o,
      collectionReadCache: s ? this.#n : void 0,
      collectionReadIndex: s ? this.#s : void 0,
      collectionRelativeSelector: s ? F(this.#a, n) : void 0
    });
  }
  getByRole(e, o = {}) {
    let n = Ko(e, o);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${n}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, n) : void 0
    });
  }
  getByText(e, o = {}) {
    let n = Zo(e, o);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${n}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, n) : void 0
    });
  }
  getByLabel(e, o = {}) {
    let n = Jo(e, o);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${n}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, n) : void 0
    });
  }
  getByPlaceholder(e, o = {}) {
    let n = Qo(e, o);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${n}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, n) : void 0
    });
  }
  getByTestId(e) {
    let o = en(e);
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      selector: `${this.#t} >> ${o}`,
      transport: this.#o,
      collectionReadCache: this.#n,
      collectionReadIndex: this.#s,
      collectionRelativeSelector: this.#n && this.#s !== void 0 ? F(this.#a, o) : void 0
    });
  }
  async cachedRead(e) {
    return !this.#n || this.#s === void 0 ? null : await this.#n.read({
      index: this.#s,
      relativeSelector: this.#a,
      timeoutMs: e
    });
  }
  assertCompatibleLocator(e, o) {
    if (!(e instanceof r)) throw new Error(`${o} requires a PlaywrightLocator`);
    if (e.#e !== this.#e || e.#r !== this.#r) throw new Error("Locators must belong to the same tab");
  }
};
var Yo = class {
  #e;
  #r;
  #t;
  #o;
  #n = new Map();
  constructor({
    browserId: e,
    tabId: o,
    selector: n,
    transport: s
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
    this.#o = s;
  }
  clear() {
    this.#n.clear();
  }
  async read({
    index: e,
    relativeSelector: o,
    timeoutMs: n
  }) {
    let s = o ?? "";
    let a = this.#n.get(s);
    return a || (a = this.#s(o, n).catch(c => {
      throw this.#n.delete(s), c;
    }), this.#n.set(s, a)), (await a)[e] ?? null;
  }
  async #s(e, o) {
    return (await this.#o.send({
      command: Nr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        selector: this.#t,
        relative_selector: e,
        timeout_ms: o
      }),
      timeoutMs: o
    })).values;
  }
};
function F(r, e) {
  return r ? e ? `${r} >> ${e}` : r : e || void 0;
}
function ec(r) {
  let e = r;
  return r.unicode || e.unicodeSets ? String(r) : String(r).replace(/(^|[^\\])(\\\\)*(["'`])/g, "$1$2\\\\$3").replace(/>>/g, "\\>\\>");
}
function po(r, e) {
  return typeof r != "string" ? ec(r) : `${JSON.stringify(r)}${e ? "s" : "i"}`;
}
function Xo(r, e) {
  return typeof r != "string" ? ec(r) : `"${r.replace(/\\/g, "\\\\").replace(/["]/g, '\\"')}"${e ? "s" : "i"}`;
}
function Ko(r, e) {
  if (!r) throw new Error("getByRole requires a role");
  let o = [];
  return e.name !== void 0 && o.push(`[name=${Xo(e.name, !!e.exact)}]`), `internal:role=${r}${o.join("")}`;
}
function Zo(r, e) {
  if (typeof r != "string" && !Je(r)) throw new Error("getByText requires a string or RegExp");
  return `internal:text=${po(r, !!e.exact)}`;
}
function Jo(r, e) {
  if (typeof r != "string" && !Je(r)) throw new Error("getByLabel requires a string or RegExp");
  return `internal:label=${po(r, !!e.exact)}`;
}
function Qo(r, e) {
  if (typeof r != "string" && !Je(r)) throw new Error("getByPlaceholder requires a string or RegExp");
  return `internal:attr=[placeholder=${Xo(r, !!e.exact)}]`;
}
function en(r) {
  if (!r) throw new Error("getByTestId requires a testId");
  return `internal:testid=[data-testid=${Xo(r, true)}]`;
}
var Gr = class r {
  #e;
  #r;
  #t;
  #o;
  constructor({
    browserId: e,
    tabId: o,
    frameSelector: n,
    transport: s
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
    this.#o = s;
  }
  locator(e) {
    if (!e) throw new Error("frameLocator.locator requires a selector");
    let o = `${this.#t} >> internal:control=enter-frame >> ${e}`;
    return new Y({
      browserId: this.#e,
      tabId: this.#r,
      selector: o,
      transport: this.#o
    });
  }
  frameLocator(e) {
    if (!e) throw new Error("frameLocator.frameLocator requires a selector");
    return new r({
      browserId: this.#e,
      tabId: this.#r,
      frameSelector: `${this.#t} >> internal:control=enter-frame >> ${e}`,
      transport: this.#o
    });
  }
  getByRole(e, o = {}) {
    return this.locator(Ko(e, o));
  }
  getByText(e, o = {}) {
    return this.locator(Zo(e, o));
  }
  getByLabel(e, o = {}) {
    return this.locator(Jo(e, o));
  }
  getByPlaceholder(e, o = {}) {
    return this.locator(Qo(e, o));
  }
  getByTestId(e) {
    return this.locator(en(e));
  }
};
var Vr = class {
  #e;
  #r;
  #t;
  #o;
  constructor({
    browserId: e,
    tabId: o,
    downloadId: n,
    transport: s
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
    this.#o = s;
  }
  async path({
    timeoutMs: e
  } = {}) {
    return (await this.#o.send({
      command: qr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        download_id: this.#t,
        timeout_ms: e
      }),
      timeoutMs: e
    })).path ?? null;
  }
};
var Yr = class {
  #e;
  #r;
  #t;
  #o;
  #n;
  constructor({
    browserId: e,
    tabId: o,
    fileChooserId: n,
    isMultiple: s,
    transport: a
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
    this.#o = s;
    this.#n = a;
  }
  isMultiple() {
    return this.#o;
  }
  async setFiles(e, {
    timeoutMs: o
  } = {}) {
    if (e == null) throw new Error("fileChooser.setFiles requires files");
    let n = Array.isArray(e) ? e : [e];
    if (!n.length) throw new Error("fileChooser.setFiles requires at least one file");
    try {
      await this.#n.send({
        command: $r.create({
          browser_id: this.#e,
          tab_id: this.#r,
          file_chooser_id: this.#t,
          files: n,
          timeout_ms: o
        }),
        timeoutMs: o
      });
    } catch (s) {
      throw lo(s, "fileChooser.setFiles failed");
    }
  }
};
var Qe = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async goBack() {
    await this.#t.send({
      command: xe.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    });
  }
  async goForward() {
    await this.#t.send({
      command: Se.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    });
  }
  async evaluate(e, o, n) {
    return (await this.#t.send({
      command: Ee.create({
        browser_id: this.#e,
        script: Im(e, o),
        tab_id: this.#r,
        timeout_ms: n?.timeoutMs
      }),
      timeoutMs: n?.timeoutMs
    })).value;
  }
  locator(e) {
    if (!e) throw new Error("playwright.locator requires a selector");
    return new Y({
      browserId: this.#e,
      tabId: this.#r,
      selector: e,
      transport: this.#t
    });
  }
  getByRole(e, o = {}) {
    return this.locator(Ko(e, o));
  }
  getByText(e, o = {}) {
    return this.locator(Zo(e, o));
  }
  getByLabel(e, o = {}) {
    return this.locator(Jo(e, o));
  }
  getByPlaceholder(e, o = {}) {
    return this.locator(Qo(e, o));
  }
  getByTestId(e) {
    return this.locator(en(e));
  }
  frameLocator(e) {
    if (!e) throw new Error("playwright.frameLocator requires a selector");
    return new Gr({
      browserId: this.#e,
      tabId: this.#r,
      frameSelector: e,
      transport: this.#t
    });
  }
  async waitForURL(e, o = {}) {
    if (!e) throw new Error("playwright.waitForURL requires a url");
    await this.#t.send({
      command: Dr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        url: e,
        wait_until: o.waitUntil,
        timeout_ms: o.timeoutMs
      }),
      timeoutMs: o.timeoutMs
    });
  }
  async waitForLoadState(e = {}) {
    await this.#t.send({
      command: jr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        state: e.state,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
  async waitForTimeout(e) {
    if (!Number.isInteger(e) || e < 0) throw new Error("playwright.waitForTimeout requires a non-negative integer");
    await this.#t.send({
      command: Ur.create({
        browser_id: this.#e,
        tab_id: this.#r,
        timeout_ms: e
      }),
      timeoutMs: e + 2e3
    });
  }
  waitForEvent(e, o = {}) {
    let n = this.#o(e, o);
    return n.catch(() => {}), n;
  }
  async #o(e, o) {
    if (e === "download") {
      let n = o.timeoutMs ?? 12e4;
      let s = await this.#t.send({
        command: Wr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          timeout_ms: n
        }),
        timeoutMs: n
      });
      return new Vr({
        browserId: this.#e,
        tabId: this.#r,
        downloadId: s.download_id,
        transport: this.#t
      });
    }
    if (e === "filechooser") {
      let n = await this.#t.send({
        command: Hr.create({
          browser_id: this.#e,
          tab_id: this.#r,
          timeout_ms: o.timeoutMs
        }),
        timeoutMs: o.timeoutMs
      });
      return new Yr({
        browserId: this.#e,
        tabId: this.#r,
        fileChooserId: n.file_chooser_id,
        isMultiple: n.is_multiple,
        transport: this.#t
      });
    }
    throw new Error("playwright.waitForEvent only supports 'download' and 'filechooser'");
  }
  async expectNavigation(e, o = {}) {
    let n = o.url ? this.waitForURL(o.url, {
      timeoutMs: o.timeoutMs,
      waitUntil: o.waitUntil
    }) : this.waitForLoadState({
      timeoutMs: o.timeoutMs,
      state: o.waitUntil
    });
    let s = Promise.resolve().then(e);
    let [a] = await Promise.all([s, n]);
    return a;
  }
  async elementInfo(e) {
    let o = Zi("playwright.elementInfo", e);
    return await this.#t.send({
      command: zr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: o.x,
        y: o.y,
        include_non_interactable: e.includeNonInteractable
      })
    });
  }
  async elementScreenshot(e) {
    let o = Zi("playwright.elementScreenshot", e);
    let n = await this.#t.send({
      command: Fr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: o.x,
        y: o.y,
        include_non_interactable: e.includeNonInteractable
      })
    });
    return ee(n.data);
  }
  async domSnapshot() {
    return (await this.#t.send({
      command: Lr.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    })).dom_snapshot;
  }
};
var et = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async get_visible_dom() {
    return this.#t.send({
      command: hr.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    });
  }
  async click(e) {
    let o = tn(e?.node_id, "dom_cua.click");
    await this.#t.send({
      command: Ge.create({
        browser_id: this.#e,
        tab_id: this.#r,
        node_id: o
      })
    });
  }
  async double_click(e) {
    let o = tn(e?.node_id, "dom_cua.double_click");
    await this.#t.send({
      command: yr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        node_id: o
      })
    });
  }
  async scroll({
    node_id: e,
    x: o,
    y: n
  }) {
    if (typeof o != "number" || typeof n != "number") throw new Error("dom_cua.scroll requires x and y numbers");
    let s = e === void 0 ? void 0 : tc(e, "dom_cua.scroll");
    await this.#t.send({
      command: br.create({
        browser_id: this.#e,
        tab_id: this.#r,
        node_id: s,
        scroll_x: o,
        scroll_y: n
      })
    });
  }
  async type({
    text: e
  }) {
    if (typeof e != "string") throw new Error("dom_cua.type requires text");
    await this.#t.send({
      command: _r.create({
        browser_id: this.#e,
        tab_id: this.#r,
        text: e
      })
    });
  }
  async keypress(e) {
    if (!Array.isArray(e?.keys) || e.keys.length === 0) throw new Error("dom_cua.keypress requires a non-empty keys array");
    await this.#t.send({
      command: gr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        keys: e.keys
      })
    });
  }
  async downloadMedia(e) {
    let o = tn(e?.node_id, "dom_cua.downloadMedia");
    await this.#t.send({
      command: fr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        node_id: o,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
};
function tn(r, e) {
  if (r === void 0) throw new Error(`${e} requires a node_id`);
  return tc(r, e);
}
function tc(r, e) {
  let o = Ge.DomNodeIdSchema.safeParse(r);
  if (!o.success) throw new Error(`${e} ${o.error.issues[0]?.message ?? "has an invalid node_id"}`);
  return o.data;
}
var tt = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async click(e) {
    if (typeof e?.x != "number" || typeof e?.y != "number") throw new Error("cua.click requires x and y");
    await this.#t.send({
      command: ar.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: e.x,
        y: e.y,
        button: e.button,
        keys: e.keypress
      })
    });
  }
  async scroll(e) {
    if (typeof e?.x != "number" || typeof e?.y != "number" || typeof e?.scrollX != "number" || typeof e?.scrollY != "number") throw new Error("cua.scroll requires x, y, scrollX, and scrollY");
    await this.#t.send({
      command: ur.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: e.x,
        y: e.y,
        scroll_x: e.scrollX,
        scroll_y: e.scrollY,
        keys: e.keypress
      })
    });
  }
  async double_click(e) {
    if (typeof e?.x != "number" || typeof e?.y != "number") throw new Error("cua.double_click requires x and y");
    await this.#t.send({
      command: cr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: e.x,
        y: e.y,
        keys: e.keypress
      })
    });
  }
  async type(e) {
    if (typeof e?.text != "string") throw new Error("cua.type requires text");
    await this.#t.send({
      command: mr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        text: e.text
      })
    });
  }
  async keypress(e) {
    if (!Array.isArray(e?.keys) || e.keys.length === 0) throw new Error("cua.keypress requires a non-empty keys array");
    await this.#t.send({
      command: lr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        keys: e.keys
      })
    });
  }
  async drag(e) {
    if (!Array.isArray(e?.path) || e.path.length === 0 || e.path.some(o => typeof o?.x != "number" || typeof o?.y != "number")) throw new Error("cua.drag requires a non-empty path of {x, y} points");
    await this.#t.send({
      command: dr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        path: e.path,
        keys: e.keys
      })
    });
  }
  async move(e) {
    if (typeof e?.x != "number" || typeof e?.y != "number") throw new Error("cua.move requires x and y");
    await this.#t.send({
      command: pr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: e.x,
        y: e.y,
        keys: e.keys
      })
    });
  }
  async downloadMedia(e) {
    if (typeof e?.x != "number" || typeof e?.y != "number") throw new Error("cua.downloadMedia requires x and y");
    await this.#t.send({
      command: ir.create({
        browser_id: this.#e,
        tab_id: this.#r,
        x: e.x,
        y: e.y,
        timeout_ms: e.timeoutMs
      }),
      timeoutMs: e.timeoutMs
    });
  }
};
var rt = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async get(e = "state", o) {
    let n = await this.#o(e, o);
    switch (n.mode) {
      case "state":
        return n.state;
      case "screenshot":
        return n.screenshot;
      case "both":
        return n.screenshot === void 0 ? {
          state: n.state
        } : {
          state: n.state,
          screenshot: n.screenshot
        };
    }
  }
  async write(e = "state", o) {
    let n = await this.#o(e, o);
    n.mode !== "screenshot" && (await this.#t.display(n.state));
    n.mode !== "state" && n.screenshot !== void 0 && (await this.#t.display(n.screenshot));
  }
  async click(e, o) {
    await this.#n({
      kind: "click",
      target: e,
      ...(o?.mouseButton === void 0 ? {} : {
        mouse_button: o.mouseButton
      }),
      ...(o?.clickCount === void 0 ? {} : {
        click_count: o.clickCount
      }),
      ...(o?.key === void 0 ? {} : {
        key: o.key
      }),
      ...(o?.duration === void 0 ? {} : {
        duration: o.duration
      })
    });
  }
  async drag(e, o) {
    await this.#n({
      kind: "drag",
      from: e,
      to: o
    });
  }
  async paste(e, o, n) {
    await this.#n({
      kind: "paste",
      element_index: e,
      text: o,
      format: n?.format
    });
  }
  async performSecondaryAction(e, o) {
    await this.#n({
      kind: "perform_secondary_action",
      element_index: e,
      action: o
    });
  }
  async pressKey(e, o, n) {
    await this.#n({
      kind: "press_key",
      element_index: e,
      key: o,
      ...(n?.duration === void 0 ? {} : {
        duration: n.duration
      })
    });
  }
  async scroll(e, o, n) {
    await this.#n({
      kind: "scroll",
      target: e,
      direction: o,
      ...(n === void 0 ? {} : {
        pages: n
      })
    });
  }
  async selectText(e, o, n) {
    await this.#n({
      kind: "select_text",
      element_index: e,
      text: o,
      ...(n?.prefix === void 0 ? {} : {
        prefix: n.prefix
      }),
      ...(n?.suffix === void 0 ? {} : {
        suffix: n.suffix
      }),
      ...(n?.selectionType === void 0 ? {} : {
        selection_type: n.selectionType
      })
    });
  }
  async setValue(e, o) {
    await this.#n({
      kind: "set_value",
      element_index: e,
      value: o
    });
  }
  async typeText(e, o) {
    await this.#n({
      kind: "type_text",
      element_index: e,
      text: o
    });
  }
  async #o(e, o) {
    let n = await this.#t.send({
      command: nr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        content: e === "state" ? "axState" : e === "screenshot" ? "screenshot" : "axStateAndScreenshot",
        ...(o?.disableDiffing === void 0 ? {} : {
          disable_diffing: o.disableDiffing
        })
      })
    });
    if (e === "state") {
      if (typeof n.state != "string") throw new Error("ax capture returned no accessibility state");
      return {
        mode: e,
        state: n.state
      };
    }
    if (typeof n.data != "string") {
      if (e === "both" && typeof n.screenshot_unavailable == "string" && typeof n.state == "string") return {
        mode: e,
        state: n.state
      };
      throw new Error("ax capture returned no screenshot data");
    }
    let s = ee(n.data);
    if (e === "screenshot") return {
      mode: e,
      screenshot: s
    };
    if (typeof n.state != "string") throw new Error("ax capture returned no accessibility state");
    return {
      mode: e,
      state: n.state,
      screenshot: s
    };
  }
  async #n(e) {
    await this.#t.send({
      command: sr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        action: e
      })
    });
  }
};
var ot = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async export() {
    return (await this.#t.send({
      command: Kt.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    })).path;
  }
  async exportGsuite(e) {
    return (await this.#t.send({
      command: Zt.create({
        browser_id: this.#e,
        tab_id: this.#r,
        format: e
      })
    })).path;
  }
  async exportYouTubeTranscript() {
    return (await this.#t.send({
      command: Jt.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    })).path;
  }
};
var nt = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async readText() {
    return (await this.#t.send({
      command: Qt.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    })).text;
  }
  async writeText(e) {
    if (e == null) throw new Error("tab.clipboard.writeText requires text");
    await this.#t.send({
      command: er.create({
        browser_id: this.#e,
        tab_id: this.#r,
        text: e
      })
    });
  }
  async read() {
    return (await this.#t.send({
      command: tr.create({
        browser_id: this.#e,
        tab_id: this.#r
      })
    })).items.map(o => ({
      entries: o.entries.map(n => ({
        mimeType: n.mime_type,
        text: n.text,
        base64: n.base64
      })),
      presentationStyle: o.presentation_style
    }));
  }
  async write(e) {
    if (!Array.isArray(e) || e.length === 0) throw new Error("tab.clipboard.write requires at least one clipboard item");
    await this.#t.send({
      command: rr.create({
        browser_id: this.#e,
        tab_id: this.#r,
        items: e.map(o => ({
          presentation_style: o.presentationStyle,
          entries: o.entries.map(n => ({
            mime_type: n.mimeType,
            text: n.text,
            base64: n.base64
          }))
        }))
      })
    });
  }
};
var st = class {
  #e;
  #r;
  #t;
  constructor({
    browserId: e,
    tabId: o,
    transport: n
  }) {
    this.#e = e;
    this.#r = o;
    this.#t = n;
  }
  async logs(e = {}) {
    let o = Om(e.filter);
    let n = Mm(e.levels);
    let s = km(e.limit);
    let a = {
      browser_id: this.#e,
      tab_id: this.#r,
      ...(o !== void 0 ? {
        filter: o
      } : {}),
      ...(n !== void 0 ? {
        levels: n
      } : {}),
      ...(s !== void 0 ? {
        limit: s
      } : {})
    };
    return (await this.#t.send({
      command: $e.create(a)
    })).logs;
  }
};
var Om = r => {
  if (r != null) {
    if (typeof r != "string") throw new Error("tab.dev.logs received an invalid filter");
    return r;
  }
};
var Mm = r => {
  if (r != null) {
    if (!Array.isArray(r) || r.length === 0) throw new Error("tab.dev.logs received invalid levels");
    return r.map(e => {
      if (e === "warning") return "warn";
      if ($e.LogLevelSchema.options.includes(e)) return e;
      throw new Error(`tab.dev.logs received invalid level "${String(e)}"`);
    });
  }
};
var km = r => {
  if (r != null) {
    if (!Number.isInteger(r) || r <= 0) throw new Error("tab.dev.logs received an invalid limit");
    return r;
  }
};
var te = class {
  constructor(e, o, n, s) {
    this.transport = e;
    this.browserId = o;
    this.documentationApi = n;
    this.info = s;
  }
  get id() {
    return this.info.id;
  }
  async documentation() {
    return await this.documentationApi.get(`capabilities/browser/${this.id}`);
  }
};
var M = class {
  constructor(e, o, n, s, a) {
    this.transport = e;
    this.browserId = o;
    this.tabId = n;
    this.documentationApi = s;
    this.info = a;
  }
  get id() {
    return this.info.id;
  }
  async documentation() {
    return await this.documentationApi.get(`capabilities/tab/${this.id}`);
  }
};
function it({
  capability: r,
  info: e,
  internalOnly: o
}) {
  return {
    capability: r,
    create: n => new r({
      ...n,
      info: e
    }),
    id: e.id,
    info: e,
    ...(o == null ? {} : {
      internalOnly: o
    })
  };
}
function W({
  capability: r,
  info: e,
  internalOnly: o
}) {
  return {
    capability: r,
    create: n => new r({
      ...n,
      info: e
    }),
    id: e.id,
    info: e,
    ...(o == null ? {} : {
      internalOnly: o
    })
  };
}
var at = class {
  #e;
  constructor(e) {
    this.#e = e;
  }
  async get(e) {
    let o = this.#e[e];
    if (!o) throw new Error(`Capability is not available: ${e}`);
    return o;
  }
  async list() {
    return Object.values(this.#e).map(e => e.info);
  }
};
var uo = {};
p(uo, {
  Report: () => Re
});
var Re = {};
p(Re, {
  PayloadSchema: () => nc,
  ResultSchema: () => Dm,
  commandType: () => oc,
  create: () => jm
});
var Nm = t.enum(["captcha_failed", "access_denied", "challenge_loop", "sign_in_blocked", "add_to_cart_blocked", "purchase_blocked", "unexpected_bot_error"]);
var rc = t.object({
  reason: Nm
});
var oc = "tab_bot_detection_report";
var nc = rc.extend({
  browser_id: t.string(),
  tab_id: t.string()
});
var Dm = t.object({
  status: t.literal("reported"),
  hostname: t.string().nullable()
});
function jm(r) {
  return new i(oc, nc, r);
}
var sc = {
  id: "botDetection",
  description: "Use when the current tab is blocked by bot detection, a failed CAPTCHA, a hard access denial, or a repeated challenge/login loop."
};
var ct = class extends M {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    tabId: s,
    transport: a
  }) {
    super(a, e, s, o, n);
  }
  async report(e) {
    let o = Re.PayloadSchema.parse({
      ...e,
      browser_id: this.browserId,
      tab_id: this.tabId
    });
    let n = await this.transport.send({
      command: Re.create(o)
    });
    return Re.ResultSchema.parse(n);
  }
};
var mo = W({
  capability: ct,
  info: sc
});
var yo = {};
p(yo, {
  Call: () => lt,
  Events: () => dt
});
var lt = {};
p(lt, {
  PayloadSchema: () => cc,
  ResultSchema: () => Lm,
  commandType: () => ic,
  create: () => zm
});
var fo = t.object({
  session_id: t.string().min(1).optional(),
  target_id: t.string().min(1).optional()
}).refine(r => r.session_id == null != (r.target_id == null), "CDP target must provide exactly one of session_id or target_id.");
var Um = t.object({
  extensionId: t.string().optional(),
  sessionId: t.string().optional(),
  tabId: t.number().int().optional(),
  targetId: t.string().optional()
});
var ac = t.object({
  sequence: t.number().int().positive(),
  source: Um,
  method: t.string().min(1),
  params: t.record(t.string(), t.unknown()).optional()
});
var ic = "tab_cdp_call";
var cc = t.object({
  browser_id: t.string(),
  tab_id: t.string(),
  method: t.string().min(1),
  params: t.record(t.string(), t.unknown()).optional(),
  target: fo.optional(),
  timeout_ms: t.number().int().positive().optional()
});
var Lm = t.unknown();
function zm(r) {
  return new i(ic, cc, r);
}
var dt = {};
p(dt, {
  PayloadSchema: () => dc,
  ResultSchema: () => Fm,
  commandType: () => lc,
  create: () => Wm
});
var lc = "tab_cdp_events";
var dc = t.object({
  after_sequence: t.number().int().nonnegative().optional(),
  browser_id: t.string(),
  limit: t.number().int().positive().max(1e3).optional(),
  methods: t.array(t.string().min(1)).min(1).optional(),
  tab_id: t.string(),
  target: fo.optional(),
  timeout_ms: t.number().int().nonnegative().optional()
});
var Fm = t.object({
  cursor: t.number().int().nonnegative(),
  events: t.array(ac),
  hasMore: t.boolean(),
  truncated: t.boolean()
});
function Wm(r) {
  return new i(lc, dc, r);
}
var pc = {
  id: "cdp",
  description: "Send raw Chrome DevTools Protocol commands and read debugger events through a supported tab for developer use cases."
};
var qm = 2e3;
var pt = class extends M {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    tabId: s,
    transport: a
  }) {
    super(a, e, s, o, n);
  }
  async send(e, o, n) {
    let s = await this.transport.send({
      command: lt.create({
        browser_id: this.browserId,
        method: e,
        params: o,
        tab_id: this.tabId,
        target: uc(n?.target),
        timeout_ms: n?.timeoutMs
      }),
      timeoutMs: n?.timeoutMs
    });
    return lt.ResultSchema.parse(s);
  }
  async readEvents(e) {
    let o = await this.transport.send({
      command: dt.create({
        after_sequence: e?.afterSequence,
        browser_id: this.browserId,
        limit: e?.limit,
        methods: e?.methods,
        tab_id: this.tabId,
        target: uc(e?.target),
        timeout_ms: e?.timeoutMs
      }),
      timeoutMs: Hm(e?.timeoutMs)
    });
    return dt.ResultSchema.parse(o);
  }
};
var ho = W({
  capability: pt,
  info: pc
});
function uc(r) {
  if (r != null) return {
    session_id: r.sessionId,
    target_id: r.targetId
  };
}
function Hm(r) {
  return r != null && r > 0 ? r + qm : void 0;
}
var go = {};
p(go, {
  Handoff: () => ut
});
var ut = {};
p(ut, {
  PayloadSchema: () => gc,
  ResultSchema: () => Ym,
  SubmissionAttemptEventSchema: () => bc,
  SubmissionDiagnosticsSchema: () => _c,
  SubmissionRejectionSchema: () => rn,
  commandType: () => hc,
  create: () => Xm
});
var mc = /^[A-Za-z0-9_-]{1,48}$/;
var fc = new Set(["__proto__", "constructor", "prototype"]);
var $m = t.object({
  id: t.string().regex(mc).refine(r => !fc.has(r)),
  label: t.string(),
  type: t.string().min(1),
  autocomplete: t.string().nullable().optional(),
  required: t.boolean(),
  selector: t.string()
});
var Gm = t.object({
  selector: t.string(),
  action: t.enum(["click", "press_enter"])
});
var Vm = t.object({
  id: t.string().regex(mc).refine(r => !fc.has(r)),
  label: t.string().trim().min(1).max(120),
  selector: t.string().optional(),
  field_ids: t.array(t.string()).max(6).optional()
}).refine(r => r.selector != null != (r.field_ids?.length ?? 0) > 0, "browser auth options require either a selector or credential fields");
var yc = t.object({
  origin: t.string(),
  account_identifier: t.string().min(1).max(320).refine(r => r.trim().length > 0).optional(),
  fields: t.array($m).max(6),
  options: t.array(Vm).min(2).max(10).optional(),
  qr_code: t.literal(true).optional(),
  submit: Gm.optional(),
  otpHandle: t.string().min(1).max(16384).optional()
}).refine(r => r.account_identifier == null || r.fields.length === 1 && r.fields[0]?.type === "password" && r.options == null && r.qr_code == null && r.otpHandle == null, "account_identifier is only supported for a password-only sign-in").refine(r => r.fields.length > 0 || r.options != null || r.qr_code === true, "browser auth requests require credential fields, sign-in options, or a QR code");
var hc = "tab_browser_auth_handoff";
var gc = yc.and(t.object({
  browser_id: t.string(),
  tab_id: t.string()
}));
var rn = t.object({
  outcome: t.enum(["origin_changed", "submission_failed"]),
  reason: t.enum(["request_url_invalid", "request_scheme", "request_origin", "paused_iframe", "iframe_origin", "child_frame_origin", "other"]),
  request_class: t.enum(["main_document", "background", "other"]),
  submission_phase: t.enum(["pending", "settled", "not_applicable"])
});
var bc = t.object({
  sequence: t.number().int().min(0).max(65535),
  kind: t.enum(["prompt_completed", "field_fill_started", "field_fill_completed", "field_fill_uncertain", "url_changed", "document_changed", "frame_changed", "reinspection_started", "reinspection_succeeded", "reinspection_failed", "site_request", "site_navigation", "site_submission_verified", "submit_started", "attempt_completed"]),
  phase: t.enum(["prompt", "filling", "before_submit", "submitting", "settled"]),
  field_index: t.number().int().min(0).max(63).optional(),
  reinspection: t.number().int().min(1).max(3).optional(),
  outcome: t.enum(["submitted", "unavailable", "origin_changed", "page_changed", "locator_invalid", "submission_failed", "prompt_changed"]).optional(),
  request_class: t.enum(["main_document", "background"]).optional(),
  method: t.enum(["get", "post", "other"]).optional(),
  origin_relation: t.enum(["same", "cross", "other"]).optional()
});
var _c = t.object({
  schema_version: t.literal(1),
  request_id: t.string().uuid(),
  submission_mode: t.enum(["ordinary", "private"]),
  first_rejection: rn.optional(),
  terminal_rejection: rn.optional(),
  attempt_events: t.array(bc).max(64).optional(),
  dropped_attempt_events: t.number().int().min(0).max(65535).optional()
});
var Ym = t.object({
  status: t.enum(["submitted", "declined", "cancelled", "unavailable", "expired", "origin_changed", "page_changed", "locator_invalid", "submission_failed"]),
  locator_error: t.object({
    field_id: t.string(),
    reason: t.literal("not_user_visible")
  }).optional(),
  selected_option: t.string().optional(),
  reason: t.literal("user_took_over").optional(),
  submission_diagnostics: _c.optional()
});
function Xm(r) {
  return new i(hc, gc, r);
}
var wc = {
  id: "browserAuth",
  description: "MUST read its documentation before the first interaction with any authentication or sign-in flow required for the task. Covers method selection, secure user-provided credentials, and post-authentication verification and recovery."
};
var mt = class extends M {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    tabId: s,
    transport: a
  }) {
    super(a, e, s, o, n);
  }
  async request(e) {
    let o = Km(e, {
      browserId: this.browserId,
      tabId: this.tabId
    });
    let n = ut.create({
      ...o,
      browser_id: this.browserId,
      tab_id: this.tabId
    });
    n.parse();
    let s = await this.transport.send({
      command: n
    });
    return ut.ResultSchema.parse(s);
  }
};
var bo = W({
  capability: mt,
  info: wc
});
function Km(r, e) {
  let o = {
    origin: r.origin,
    account_identifier: r.account_identifier,
    otpHandle: r.otpHandle,
    fields: r.fields.map(n => {
      let s = {
        id: n.id,
        label: n.label,
        type: n.type,
        required: n.required,
        selector: on(n.selector, e)
      };
      return n.autocomplete !== void 0 && (s.autocomplete = n.autocomplete), s;
    }),
    ...(r.qr_code === true ? {
      qr_code: true
    } : {})
  };
  return r.options != null && (o.options = r.options.map(n => ({
    id: n.id,
    label: n.label,
    ...(n.field_ids == null ? {} : {
      field_ids: n.field_ids
    }),
    ...(n.selector == null ? {} : {
      selector: on(n.selector, e)
    })
  }))), r.submit != null && (o.submit = {
    action: r.submit.action,
    selector: on(r.submit.selector, e)
  }), o;
}
function on(r, e) {
  if (typeof r == "string") return r;
  if (!(r instanceof Y)) throw new Error("browserAuth selector must be a string or PlaywrightLocator");
  let o = Y.browserAuthSelector(r);
  if (o.browserId !== e.browserId || o.tabId !== e.tabId) throw new Error("browserAuth selector locator must belong to this tab");
  return o.selector;
}
var _o = {};
p(_o, {
  Bundle: () => ft,
  List: () => yt
});
var ft = {};
p(ft, {
  PayloadSchema: () => Pc,
  ResultSchema: () => rf,
  commandType: () => Rc,
  create: () => of
});
var xc = t.enum(["font", "image", "script", "stylesheet", "video", "other"]);
var Sc = t.enum(["font", "image", "stylesheet", "video"]);
var Zm = t.object({
  kind: t.enum(["attribute", "computedStyle", "resource"]),
  nodeId: t.number().int().positive().optional(),
  property: t.string().optional()
});
var Jm = t.object({
  id: t.string(),
  kind: xc,
  name: t.string(),
  sources: t.array(Zm),
  url: t.string()
});
var Qm = t.object({
  id: t.string(),
  markup: t.string(),
  name: t.string()
});
var Cc = t.object({
  assets: t.array(Jm),
  id: t.string(),
  inlineSvgs: t.array(Qm),
  pageUrl: t.string().nullable(),
  summary: t.object({
    byKind: t.record(xc, t.number().int().nonnegative()),
    inlineSvgCount: t.number().int().nonnegative(),
    totalCount: t.number().int().nonnegative()
  })
});
var Tc = t.object({
  assetIds: t.array(t.string()).optional(),
  inventoryId: t.string(),
  kinds: t.array(Sc).optional()
});
var ef = t.object({
  contentType: t.string().nullable(),
  id: t.string(),
  kind: Sc,
  name: t.string(),
  path: t.string(),
  url: t.string()
});
var tf = t.object({
  contentType: t.string().nullable(),
  id: t.string(),
  name: t.string(),
  reason: t.string(),
  url: t.string()
});
var Ec = t.object({
  assets: t.array(ef),
  directoryPath: t.string(),
  failures: t.array(tf),
  manifestPath: t.string(),
  summary: t.object({
    downloadedCount: t.number().int().nonnegative(),
    elapsedMs: t.number().nonnegative(),
    failedCount: t.number().int().nonnegative(),
    requestedCount: t.number().int().nonnegative()
  })
});
var Rc = "tab_page_assets_bundle";
var Pc = Tc.extend({
  browser_id: t.string(),
  tab_id: t.string()
});
var rf = Ec;
function of(r) {
  return new i(Rc, Pc, r);
}
var yt = {};
p(yt, {
  PayloadSchema: () => vc,
  ResultSchema: () => nf,
  commandType: () => Ac,
  create: () => sf
});
var Ac = "tab_page_assets_list";
var vc = t.object({
  browser_id: t.string(),
  tab_id: t.string()
});
var nf = Cc;
function sf(r) {
  return new i(Ac, vc, r);
}
var Ic = {
  id: "pageAssets",
  description: "List assets already observed in the current page state and bundle selected assets into a temporary local artifact."
};
var ht = class extends M {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    tabId: s,
    transport: a
  }) {
    super(a, e, s, o, n);
  }
  async list() {
    let e = await this.transport.send({
      command: yt.create({
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    });
    return yt.ResultSchema.parse(e);
  }
  async bundle(e) {
    let o = await this.transport.send({
      command: ft.create({
        ...e,
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    });
    return ft.ResultSchema.parse(o);
  }
};
var wo = W({
  capability: ht,
  info: Ic
});
var xo = {
  id: "webmcp",
  description: "Fetch page-defined WebMCP tools bound to the current document, then call them through the returned object."
};
function So(r) {
  return {
    name: r.name,
    call_name: r.call_name,
    ...(r.title == null ? {} : {
      title: r.title
    }),
    ...(r.description == null ? {} : {
      description: r.description
    }),
    inputSchema: r.input_schema,
    ...(r.annotations == null ? {} : {
      annotations: r.annotations
    }),
    ...(r.origin == null ? {} : {
      origin: r.origin
    }),
    ...(r.pageUrl == null ? {} : {
      pageUrl: r.pageUrl
    })
  };
}
var gt = class extends M {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    tabId: s,
    transport: a
  }) {
    super(a, e, s, o, n);
  }
  async fetchTools() {
    let e = qe.ResultSchema.parse(await this.transport.send({
      command: qe.create({
        browser_id: this.browserId,
        tab_id: this.tabId
      })
    }));
    let o = e.tools.map(So);
    let n = new Map(e.tools.map(a => [a.call_name, a]));
    let s = af(o);
    return Object.freeze({
      description: () => s,
      call: async (a, c, l) => {
        let m = a.trim();
        let d = n.get(m);
        if (d == null) throw new Error(`WebMCP tool ${JSON.stringify(m)} is not available in this snapshot. Call fetchTools() again.`);
        return (await this.transport.send({
          command: qt.create({
            browser_id: this.browserId,
            tab_id: this.tabId,
            tool_name: d.name,
            tool_description: d.description,
            tool_title: d.title,
            registration_id: d.registration_id,
            input: c,
            ...(l?.timeoutMs == null ? {} : {
              timeout_ms: l.timeoutMs
            })
          })
        })).result;
      }
    });
  }
};
function af(r) {
  return r.length === 0 ? "No WebMCP tools are available in this document." : ["WebMCP tools available in this document:", JSON.stringify(r.map(({
    call_name: e,
    ...o
  }) => ({
    ...o,
    name: e
  })), null, 2), "Call tools.call(name, input) to invoke one."].join(`
`);
}
var Co = W({
  capability: gt,
  info: xo
});
var nn = [ho, mo, bo, wo, Co];
var cf = lf(nn);
var Bc = ({
  browserId: r,
  capabilities: e,
  documentation: o,
  tabId: n,
  transport: s
}) => {
  let a = {};
  for (let c of e ?? []) {
    let l = cf.get(c.id);
    l != null && Object.assign(a, {
      [c.id]: l({
        browserId: r,
        documentation: o,
        info: c,
        tabId: n,
        transport: s
      })
    });
  }
  return new at(a);
};
function lf(r) {
  return new Map(r.map(e => [e.id, e.create]));
}
var bt = class {
  constructor({
    browserId: e,
    dialogId: o,
    tabId: n,
    transport: s,
    type: a
  }) {
    this.browserId = e;
    this.dialogId = o;
    this.tabId = n;
    this.transport = s;
    this.type = a;
  }
  async dismiss() {
    await this.transport.send({
      command: Ce.create({
        action: "dismiss",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        tab_id: this.tabId
      })
    });
  }
};
var Xr = class extends bt {
  constructor(e) {
    super({
      ...e,
      type: "alert"
    });
  }
};
var Kr = class extends bt {
  constructor(e) {
    super({
      ...e,
      type: "beforeunload"
    });
  }
};
var Zr = class extends bt {
  constructor(e) {
    super({
      ...e,
      type: "confirm"
    });
  }
  async accept() {
    await this.transport.send({
      command: Ce.create({
        action: "accept",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        tab_id: this.tabId
      })
    });
  }
};
var Jr = class extends bt {
  constructor(e) {
    super({
      ...e,
      type: "prompt"
    });
  }
  async accept(e) {
    if (typeof e != "string") throw new Error("prompt.accept requires text");
    await this.transport.send({
      command: Ce.create({
        action: "accept",
        browser_id: this.browserId,
        dialog_id: this.dialogId,
        prompt_text: e,
        tab_id: this.tabId
      })
    });
  }
};
var re = class {
  #e;
  #r;
  constructor({
    browserId: e,
    capabilities: o,
    documentation: n,
    transport: s,
    tabPayload: a = {}
  }) {
    if (!a.id) throw new Error("Tab requires an id");
    this.#e = e;
    this.#r = s;
    this.id = a.id;
    this.playwright = new Qe({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.dom_cua = new et({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.cua = new tt({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.ax = new rt({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.content = new ot({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.clipboard = new nt({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.dev = new st({
      browserId: e,
      tabId: this.id,
      transport: this.#r
    });
    this.capabilities = Bc({
      browserId: this.#e,
      capabilities: o,
      documentation: n,
      tabId: this.id,
      transport: this.#r
    });
  }
  async goto(e) {
    if (!e) throw new Error("tab.goto requires a url");
    if (this.#o(), !this.id) throw new Error("tab.goto requires a tab id");
    await this.#r.send({
      command: Ht.create({
        browser_id: this.#e,
        tab_id: this.id,
        url: e
      })
    });
  }
  async markHandoff() {
    await this.#t("handoff");
  }
  async markDeliverable() {
    await this.#t("deliverable");
  }
  async requestManualHandoff() {
    return this.requestUserTakeover();
  }
  async requestUserTakeover(e) {
    await this.#r.send({
      command: Ut.create({
        browser_id: this.#e,
        tab_id: this.id,
        reason: e
      })
    });
  }
  async back() {
    this.#o();
    await this.#r.send({
      command: xe.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async forward() {
    this.#o();
    await this.#r.send({
      command: Se.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async reload() {
    this.#o();
    await this.#r.send({
      command: $t.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async close() {
    this.#o();
    await this.#r.send({
      command: Dt.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
  async screenshot(e = {}) {
    this.#o();
    let o = {
      browser_id: this.#e,
      tab_id: this.id,
      fullPage: e.fullPage
    };
    if (e.clip) {
      let {
        x: s,
        y: a,
        width: c,
        height: l
      } = e.clip;
      if (typeof s != "number" || typeof a != "number" || typeof c != "number" || typeof l != "number") throw new Error("tab.screenshot clip requires x, y, width, and height");
      o.cropX = s;
      o.cropY = a;
      o.cropWidth = c;
      o.cropHeight = l;
    }
    let n = await this.#r.send({
      command: or.create(o)
    });
    return ee(n.data);
  }
  async title() {
    return (await this.#n()).title;
  }
  async url() {
    return (await this.#n()).url;
  }
  async getJsDialog() {
    this.#o();
    let o = (await this.#r.send({
      command: Xt.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    })).dialog;
    if (o != null) return df({
      browserId: this.#e,
      dialogId: o.id,
      tabId: this.id,
      transport: this.#r,
      type: o.type
    });
  }
  async #t(e) {
    this.#o();
    await this.#r.send({
      command: jt.create({
        browser_id: this.#e,
        tab_id: this.id,
        status: e
      })
    });
  }
  #o() {
    if (!this.#r) throw new Error("Tab is not bound to a transport");
  }
  async #n() {
    return this.#o(), await this.#r.send({
      command: we.create({
        browser_id: this.#e,
        tab_id: this.id
      })
    });
  }
};
function df({
  browserId: r,
  dialogId: e,
  tabId: o,
  transport: n,
  type: s
}) {
  switch (s) {
    case "alert":
      return new Xr({
        browserId: r,
        dialogId: e,
        tabId: o,
        transport: n
      });
    case "beforeunload":
      return new Kr({
        browserId: r,
        dialogId: e,
        tabId: o,
        transport: n
      });
    case "confirm":
      return new Zr({
        browserId: r,
        dialogId: e,
        tabId: o,
        transport: n
      });
    case "prompt":
      return new Jr({
        browserId: r,
        dialogId: e,
        tabId: o,
        transport: n
      });
  }
}
var Ro = {};
p(Ro, {
  Call: () => Pe,
  GetAuditTrail: () => Ae,
  commands: () => yf
});
var Pe = {};
p(Pe, {
  PayloadSchema: () => Qr,
  ResultSchema: () => pf,
  commandType: () => To,
  create: () => uf
});
var To = "browser_management_call";
var Qr = t.object({
  args: t.array(t.unknown()),
  browser_id: t.string(),
  method: t.string(),
  namespace: t.string()
});
var pf = t.object({
  value: t.unknown()
});
function uf(r) {
  return new i(To, Qr, r);
}
var Ae = {};
p(Ae, {
  AuditChangeSchema: () => Mc,
  PayloadSchema: () => Oc,
  ResultSchema: () => mf,
  commandType: () => Eo,
  create: () => ff
});
var Eo = "browser_management_get_audit_trail";
var Oc = Qr.pick({
  browser_id: true
});
var Mc = Qr.omit({
  browser_id: true
}).extend({
  before: t.object({
    bookmarks: t.array(t.object({
      id: t.string(),
      index: t.number().optional(),
      parentId: t.string().optional(),
      title: t.string(),
      url: t.string().optional()
    })),
    tabLayout: t.object({
      groups: t.array(t.object({
        collapsed: t.boolean(),
        color: t.string(),
        id: t.number(),
        title: t.string().optional(),
        windowId: t.number()
      })),
      tabs: t.array(t.object({
        autoDiscardable: t.boolean(),
        groupId: t.number(),
        id: t.number(),
        index: t.number(),
        pinned: t.boolean(),
        url: t.string().optional(),
        windowId: t.number()
      }))
    }),
    windows: t.array(t.object({
      focused: t.boolean(),
      height: t.number().optional(),
      id: t.number(),
      left: t.number().optional(),
      state: t.string().optional(),
      top: t.number().optional(),
      width: t.number().optional()
    }))
  }).partial(),
  createdAt: t.number(),
  result: t.union([t.number(), t.object({
    id: t.string()
  })]).optional()
});
var mf = t.object({
  changes: t.array(Mc)
});
function ff(r) {
  return new i(Eo, Oc, r);
}
var yf = {
  [To]: Pe,
  [Eo]: Ae
};
var kc = {
  id: "management",
  description: "Organize windows, tabs, tab groups, and bookmarks. Use only for user-requested browser organization."
};
var _t = class extends te {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    transport: s
  }) {
    super(s, e, o, n);
    this.windows = this.createNamespace("windows");
    this.tabs = this.createNamespace("tabs");
    this.tabGroups = this.createNamespace("tabGroups");
    this.bookmarks = this.createNamespace("bookmarks");
  }
  async getAuditTrail() {
    let e = await this.transport.send({
      command: Ae.create({
        browser_id: this.browserId
      })
    });
    return Ae.ResultSchema.parse(e);
  }
  async invoke(e, o, ...n) {
    let s = await this.transport.send({
      command: Pe.create({
        args: n,
        browser_id: this.browserId,
        method: o,
        namespace: e
      })
    });
    return Pe.ResultSchema.parse(s).value;
  }
  createNamespace(e) {
    return new Proxy({}, {
      get: (o, n) => {
        if (!(typeof n != "string" || n === "then" || n === "toJSON" || n in Object.prototype)) return (...s) => this.invoke(e, n, ...s);
      }
    });
  }
};
var Po = it({
  capability: _t,
  info: kc
});
var Io = {};
p(Io, {
  Get: () => ve,
  Set: () => Ie,
  commands: () => wf
});
var ve = {};
p(ve, {
  PayloadSchema: () => Nc,
  ResultSchema: () => hf,
  commandType: () => Ao,
  create: () => gf
});
var Ao = "browser_visibility_get";
var Nc = t.object({
  browser_id: t.string()
});
var hf = t.object({
  visible: t.boolean()
});
function gf(r) {
  return new i(Ao, Nc, r);
}
var Ie = {};
p(Ie, {
  PayloadSchema: () => Dc,
  ResultSchema: () => bf,
  commandType: () => vo,
  create: () => _f
});
var vo = "browser_visibility_set";
var Dc = t.object({
  browser_id: t.string(),
  visible: t.boolean()
});
var bf = t.object({});
function _f(r) {
  return new i(vo, Dc, r);
}
var wf = {
  [Ao]: ve,
  [vo]: Ie
};
var jc = {
  id: "visibility",
  description: "Use to show or hide the browser to the user, and to determine the browser's current visibility. Keep browser work in the background unless the user asks to see it or live viewing is useful. When the browser should be visible, call set(true)."
};
var wt = class extends te {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    transport: s
  }) {
    super(s, e, o, n);
  }
  async set(e) {
    let o = await this.transport.send({
      command: Ie.create({
        browser_id: this.browserId,
        visible: e
      })
    });
    Ie.ResultSchema.parse(o);
  }
  async get() {
    let e = await this.transport.send({
      command: ve.create({
        browser_id: this.browserId
      })
    });
    return ve.ResultSchema.parse(e).visible;
  }
};
var Bo = it({
  capability: wt,
  info: jc
});
var ko = {};
p(ko, {
  Reset: () => Be,
  Set: () => Oe,
  commands: () => Ef
});
var Be = {};
p(Be, {
  PayloadSchema: () => Uc,
  ResultSchema: () => xf,
  commandType: () => Oo,
  create: () => Sf
});
var Oo = "browser_viewport_reset";
var Uc = t.object({
  browser_id: t.string()
});
var xf = t.object({});
function Sf(r) {
  return new i(Oo, Uc, r);
}
var Oe = {};
p(Oe, {
  PayloadSchema: () => Lc,
  ResultSchema: () => Cf,
  commandType: () => Mo,
  create: () => Tf
});
var Mo = "browser_viewport_set";
var Lc = t.object({
  browser_id: t.string(),
  height: t.number().int().positive(),
  width: t.number().int().positive()
});
var Cf = t.object({});
function Tf(r) {
  return new i(Mo, Lc, r);
}
var Ef = {
  [Oo]: Be,
  [Mo]: Oe
};
var zc = {
  id: "viewport",
  description: "Controls an explicit browser viewport override for responsive or device-size testing. Use it when a task calls for specific dimensions or breakpoint validation; otherwise leave it unset so the browser uses its normal viewport. Reset temporary overrides before finishing unless the user asked to keep them."
};
var xt = class extends te {
  constructor({
    browserId: e,
    documentation: o,
    info: n,
    transport: s
  }) {
    super(s, e, o, n);
  }
  async set(e) {
    let o = await this.transport.send({
      command: Oe.create({
        browser_id: this.browserId,
        ...e
      })
    });
    Oe.ResultSchema.parse(o);
  }
  async reset() {
    let e = await this.transport.send({
      command: Be.create({
        browser_id: this.browserId
      })
    });
    Be.ResultSchema.parse(e);
  }
};
var No = it({
  capability: xt,
  info: zc
});
var sn = [Po, Bo, No];
var Rf = Pf(sn);
var Fc = ({
  browserId: r,
  capabilities: e,
  documentation: o,
  transport: n
}) => {
  let s = {};
  for (let a of e ?? []) {
    let c = Rf.get(a.id);
    c != null && (s[a.id] = c({
      browserId: r,
      documentation: o,
      info: a,
      transport: n
    }));
  }
  return new at(s);
};
function Pf(r) {
  return new Map(r.map(e => [e.id, e.create]));
}
var St = class {
  #e;
  #r;
  #t;
  constructor({
    capabilities: e,
    onBrowserUsed: o,
    transport: n,
    browserId: s
  }) {
    this.#e = s;
    this.#r = o;
    this.#t = n;
    this.browserId = s;
    let a = new Q(n);
    this.capabilities = Fc({
      browserId: s,
      capabilities: e?.browser,
      documentation: a,
      transport: n
    });
    let c = l => new re({
      browserId: s,
      capabilities: e?.tab,
      documentation: a,
      transport: n,
      tabPayload: l
    });
    this.tabs = new Ke({
      browserId: s,
      createTab: c,
      transport: n
    });
    this.user = new Ze({
      browserId: s,
      createTab: c,
      transport: n
    });
  }
  async documentation() {
    return this.#r?.(), await this.#t.send({
      command: Mt.create({
        browser_id: this.browserId
      })
    });
  }
  async history(e = {}) {
    if (e === null || Array.isArray(e) || typeof e != "object") throw new Error("browser.history expects an options object");
    let o = {
      browser_id: this.#e
    };
    let n = Af(e.queries);
    let s = vf(e.limit);
    let a = Wc(e.from, "from");
    let c = Wc(e.to, "to");
    return n !== void 0 && (o.queries = n), s !== void 0 && (o.limit = s), a !== void 0 && (o.from = a), c !== void 0 && (o.to = c), (await this.#t.send({
      command: Yt.create(o)
    })).items;
  }
  async nameSession(e) {
    let o = e.trim();
    if (!o) throw new Error("browser.nameSession requires a name");
    await this.#t.send({
      command: Lt.create({
        browser_id: this.browserId,
        name: o
      })
    });
  }
};
var Wc = (r, e) => {
  if (r == null) return;
  let o = r instanceof Date ? r : new Date(r);
  if (Number.isNaN(o.getTime())) throw new Error(`browser.history received an invalid ${e} date`);
  return o.toISOString();
};
var Af = r => {
  if (r == null) return;
  if (!Array.isArray(r) || r.length === 0) throw new Error("browser.history received invalid queries");
  let e = [];
  for (let o of r) {
    if (typeof o != "string") throw new Error("browser.history received invalid queries");
    e.push(o);
  }
  return e;
};
var vf = r => {
  if (r != null) {
    if (!Number.isInteger(r) || r <= 0) throw new Error("browser.history received an invalid limit");
    return r;
  }
};
var Ct = class {
  constructor({
    executeAgentCommand: e,
    displaySideEffect: o
  } = {}) {
    if (typeof e != "function") throw new Error("FunctionAgentTransport requires an executeAgentCommand function");
    this.executeAgentCommand = e;
    this.displaySideEffect = o ?? Of;
  }
  async display(e) {
    await this.displaySideEffect(e);
  }
  async send({
    command: e,
    timeoutMs: o
  }) {
    let n = e.toJSON();
    let s = await this.executeAgentCommand({
      ...n,
      client_timeout_ms: typeof o == "number" && o > 0 ? o : void 0
    });
    let a = await If(s, this.displaySideEffect);
    if (a == null) throw new Error("transport send returned empty response");
    return a;
  }
};
var If = async (r, e) => {
  let o = Bf.safeParse(r);
  if (!o.success) return r;
  for (let a of o.data.side_effects) await e(a);
  let {
    side_effects: n,
    ...s
  } = o.data;
  return s;
};
var Bf = t.object({
  side_effects: t.array(t.string())
}).passthrough();
var Of = async r => {
  let e = globalThis.display;
  if (typeof e == "function") {
    await e(r);
    return;
  }
  console.log(r);
};
function qc({
  apiManifest: r,
  browserInfo: e,
  disabledMemberIds: o
}) {
  let n = new Set(o);
  for (let [s, a] of Object.entries(r.interfaces)) for (let [c, l] of Object.entries(a)) {
    let m = `${s}.${c}`;
    (e.apiSupportOverrides?.[m] ?? l.unsupportedByDefaultIn?.includes(e.type) !== true) || n.add(m);
  }
  return n;
}
var Do = class {
  apiManifest;
  disabledMemberIds;
  view;
  constructor({
    apiManifest: e,
    decorateTab: o,
    disabledMemberIds: n
  }) {
    this.apiManifest = e;
    this.disabledMemberIds = n;
    this.view = Mf(e, o);
  }
  createBrowser = ({
    browserInfo: e,
    onBrowserUsed: o,
    transport: n
  }) => {
    let s = qc({
      apiManifest: this.apiManifest,
      browserInfo: e,
      disabledMemberIds: this.disabledMemberIds
    });
    return this.view(new St({
      browserId: e.id,
      capabilities: e.capabilities,
      onBrowserUsed: o,
      transport: n
    }), s);
  };
  wrapAgent(e) {
    return this.view(e, this.disabledMemberIds);
  }
  createAgent({
    displaySideEffect: e,
    executeAgentCommand: o
  }) {
    return this.wrapAgent(new Xe({
      createBrowser: this.createBrowser,
      transport: new Ct({
        displaySideEffect: e,
        executeAgentCommand: o
      })
    }));
  }
};
function Mf(r, e) {
  let o = new WeakMap();
  let n = Object.keys(r.interfaces).map(s => {
    let a = Reflect.get(an, s);
    if (!kf(a)) throw new Error(`Browser API interface has no runtime type: ${s}`);
    return [a, s];
  });
  return (s, a) => {
    let c = new WeakMap();
    let l = d => {
      if (d == null || typeof d != "object") return d;
      let b = o.get(d);
      return b ?? (Array.isArray(d) ? d.map(l) : co(d) ? Object.fromEntries(Object.entries(d).map(([C, q]) => [C, l(q)])) : d);
    };
    let m = d => {
      if (d == null || typeof d != "object" || o.has(d)) return d;
      if (d instanceof Promise) return d.then(m);
      if (Array.isArray(d)) return d.map(m);
      let b = n.find(([P]) => d instanceof P)?.[1];
      if (b == null) return d;
      let C = c.get(d);
      if (C != null) return C;
      let q = P => typeof P != "string" || !a.has(`${b}.${P}`);
      let Me = new Map();
      let Tt = new Proxy(d, {
        get(P, k) {
          if (!q(k)) return;
          let D = Reflect.get(P, k, P);
          if (k === "constructor") return D;
          if (typeof D != "function") return m(D);
          let cn = Me.get(k);
          if (cn != null) return cn;
          let ln = (...$c) => m(Reflect.apply(D, P, $c.map(Gc => l(Gc))));
          return Me.set(k, ln), ln;
        },
        getOwnPropertyDescriptor(P, k) {
          if (!q(k)) return;
          let D = Reflect.getOwnPropertyDescriptor(P, k);
          return D == null || !("value" in D) ? D : {
            ...D,
            value: m(D.value)
          };
        },
        has(P, k) {
          return q(k) && Reflect.has(P, k);
        },
        ownKeys(P) {
          return Reflect.ownKeys(P).filter(q);
        }
      });
      return c.set(d, Tt), o.set(Tt, d), Tt instanceof re && e?.(Tt), Tt;
    };
    return m(s);
  };
}
function kf(r) {
  return typeof r == "function" && r.prototype != null;
}
function Hc({
  apiManifest: r,
  decorateTab: e,
  disabledMemberIds: o,
  displayBridge: n,
  executeAgentCommand: s
}) {
  return new Do({
    apiManifest: r,
    decorateTab: e,
    disabledMemberIds: o
  }).createAgent({
    displaySideEffect: wn({
      displayBridge: n,
      displayTruncateMaxChars: 1e5
    }),
    executeAgentCommand: s
  });
}
async function nT(r = {}) {
  let e = globalThis.nodeRepl;
  if (e == null || typeof e.rpc != "function") throw new Error("Browser use requires a trusted Node REPL browser service");
  let o = e.rpc;
  let n = e.env?.CUA_REPL_BROWSER_ENV === "orbit" ? "orbit" : r.environment;
  let s = {
    setup: m => o("browser", {
      method: "setup",
      params: m
    }),
    execute: m => o("browser", {
      method: "execute",
      params: m
    }),
    executeWithRecovery: m => o("browser", {
      method: "executeWithRecovery",
      params: m
    })
  };
  let {
    apiManifest: a,
    disabledMemberIds: c,
    credentialRecoveryErrorVersion: l
  } = await s.setup({
    environment: r.environment ?? "codex-app",
    undocumentedApiMembers: r.undocumentedApiMembers,
    excludedDocumentation: r.excludedDocumentation
  });
  return Hc({
    apiManifest: a,
    decorateTab: r.decorateTab,
    disabledMemberIds: new Set(c),
    displayBridge: {
      displayImage: m => e.emitImage(m),
      displayValue: m => console.log(m)
    },
    async executeAgentCommand(m) {
      try {
        if (l !== 1) return await s.execute(m);
        let d = await s.executeWithRecovery(m);
        if (d?.ok === true) return d.value;
        let b = fn(d?.ok === false ? d.error : void 0);
        throw b == null ? new Error("Browser service returned an invalid recovery response") : new eo(b);
      } catch (d) {
        if (n === "orbit" && typeof d == "object" && d !== null && "message" in d && typeof d.message == "string") {
          let b = mn(d.message);
          b !== d.message && (d.message = b);
        }
        throw d;
      }
    }
  });
}
export { nT as setupBrowserRuntime };
//# sourceMappingURL=browser-client.mjs.map
