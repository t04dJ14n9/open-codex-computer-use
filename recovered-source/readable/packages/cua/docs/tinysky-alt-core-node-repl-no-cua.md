## Computer Use

Control native apps and browsers on the user’s computer by reading or operating UI. Prefer purpose-built skills, connectors, APIs, or CLIs when available.

- Use `node_repl` (JavaScript) for all Computer Use actions.
- Do not use AppleScript, `osascript`, JXA, System Events scripting, shell commands, or another browser/computer tool for app interaction.
- `node_repl` state is persistent across calls.
- If you create a tab or get an app, the initial UI state is automatically included in the tool result.
- Use only APIs described in the skill or returned documentation.

## API

```typescript
type Vec2 = [x: number, y: number];
type ObservationOptions = { emit?: boolean };
type StateOptions = ObservationOptions & { disableDiffing?: boolean };
type ScreenshotRegion = {
  id: string;
  zIndex: number;
  bytes: Uint8Array;
  originX?: number;
  originY?: number;
  width?: number;
  height?: number;
};
type StateAndScreenshot = {
  state: string;
  screenshot?: Uint8Array;
  screenshots?: ScreenshotRegion[];
};
type ScreenshotInputOptions = { screenshotId?: string }; // Windows only
type AppClickOptions = ClickOptions & ScreenshotInputOptions;
type AppScrollOptions = { pixels: number } & ScreenshotInputOptions;
type PasteOptions = { format?: "text" | "md" | "html" };
type ClickOptions = {
  mouseButton?: MouseButton;
  clickCount?: number;
  key?: string;
  durationMs?: number;
};
type PressKeyOptions = { durationMs?: number };
type SelectTextOptions = {
  prefix?: string;
  suffix?: string;
  selectionType?: SelectionType;
};
type Direction = "up" | "down" | "left" | "right" | "u" | "d" | "l" | "r";
type SelectionType = "text" | "cursor_before" | "cursor_after";
type MouseButton = "left" | "right" | "middle" | "l" | "r" | "m";

interface Target<ScreenshotResult = Uint8Array | ScreenshotRegion[]> {
  getAXState(options?: StateOptions): Promise<string>;
  getScreenshot(options?: ObservationOptions): Promise<ScreenshotResult>;
  getAXStateAndScreenshot(options?: StateOptions): Promise<StateAndScreenshot>;
  click(target: number | Vec2, options?: ClickOptions): Promise<void>;
  drag(from: Vec2, to: Vec2): Promise<void>;
  scroll(target: number | Vec2, direction: Direction, pages?: number): Promise<void>;
  selectText(elementIndex: number, text: string, options?: SelectTextOptions): Promise<void>;
  setValue(elementIndex: number, value: string): Promise<void>;
  performSecondaryAction(elementIndex: number, action: string): Promise<void>;
}

type AppInfo = {
  id: string;
  displayName?: string;
  lastUsedDate?: string;
  useCount?: number;
  isRunning?: boolean;
  windows?: WindowInfo[];
};
type WindowInfo = { id: number; app: string; title?: string };

interface App extends Target {
  click(target: number | Vec2, options?: AppClickOptions): Promise<void>;
  drag(from: Vec2, to: Vec2, options?: ScreenshotInputOptions): Promise<void>;
  scroll(
    target: number | Vec2,
    direction: Direction,
    distance?: number | AppScrollOptions,
  ): Promise<void>;
  paste(text: string, options?: PasteOptions): Promise<void>;
  pressKey(key: string, options?: PressKeyOptions): Promise<void>;
  // Type at current focus, or pass a field index from getAXState() to target it (Linux).
  typeText(text: string, elementIndex?: number): Promise<void>;
  // Send printable keys to current focus without pasting or finding a text field (Linux only).
  typeCharacters?(text: string): Promise<{ charactersSent: number }>;
}

type BrowserInfo = {
  id: string;
  name?: string;
  family?: string;
  type?: "iab" | "extension" | "cdp" | "mcpapps";
  profileName?: string;
  metadata?: { extensionInstanceId?: string; codexSessionId?: string };
};

type BrowserTabInfo = {
  id: string;
  providerTabId?: string;
  title?: string;
  url?: string;
};

interface Browser {
  readonly browserId: string;
  documentation(): Promise<string>;
}

interface BrowserProvider {
  list(): Promise<Array<BrowserInfo>>;
  get(id: string): Promise<Browser>;
}

interface BrowserState extends BrowserInfo {
  tabs: Array<BrowserTabInfo>;
}

type TabInfo = {
  id: string;
  providerTabId?: string;
  browserId: string;
  title?: string;
  url?: string;
};

type State = {
  apps: Array<AppInfo>;
  browsers: Array<BrowserState>;
  errors?: string[]; // Inventory failures; the other inventory remains usable.
};

type Point = { x: number; y: number };

type Screenshot = {
  bytes: Uint8Array;
  data_url: string;
  filepath: string;
};

interface DragHandle {
  start(point: Point): Promise<void>;
  move_to(point: Point): Promise<void>;
  end(): Promise<void>;
}

interface Computer {
  target: "linux" | "mac" | "windows";
  launch_app?(input: { app: string }): Promise<void>;
  drag_handle?(): DragHandle;
  get_screenshot?(): Promise<Array<Screenshot>>;
  move?(point: Point): Promise<void>;
}

type BrowserOptions = { browser?: string };
type GetBrowserOptions = { id?: string; extensionInstanceId?: string; url?: string };
type CreateBrowserTabOptions = { visible?: boolean; sessionName?: string };

/** Native input wrappers throw on DOM-only tabs. Use documented Playwright locators instead. */
interface Tab extends Target<Uint8Array> {
  paste(elementIndex: number | null, text: string, options?: PasteOptions): Promise<void>;
  pressKey(elementIndex: number | null, key: string, options?: PressKeyOptions): Promise<void>;
  typeText(elementIndex: number | null, text: string): Promise<void>;
  readonly id: string;
  goto?(url: string): Promise<void>;
  back?(): Promise<void>;
  forward?(): Promise<void>;
  reload?(): Promise<void>;
  close?(): Promise<void>;
  markDeliverable?(): Promise<void>;
  markHandoff?(): Promise<void>;
}

declare const cua: {
  initialize(): Promise<State>;
  getState(options?: ObservationOptions): Promise<State>;
  browsers: BrowserProvider;
  computer: Computer;

  // Pass an app name, path, or bundle ID on macOS. Pass { windowId } on Linux and Windows.
  getApp(target: string | { windowId: number }): Promise<App>;
  listApps(options?: ObservationOptions): Promise<Array<AppInfo>>;
  // Linux and Windows only.
  listWindows?(options?: ObservationOptions): Promise<Array<WindowInfo>>;

  /** Select without opening a tab. Use the returned browserId with createBrowserTab. */
  getBrowser(options?: GetBrowserOptions): Promise<Browser>;
  /** Apply options before opening the tab; omitted settings stay unchanged, unsupported settings throw. */
  createBrowserTab(
    browserId: string,
    url?: string,
    options?: CreateBrowserTabOptions,
  ): Promise<Tab>;
  /** Bind an existing tab; a string is a tab ID. */
  getTab(
    reference: string | { mention: string } | { url: string },
    options?: BrowserOptions,
  ): Promise<Tab>;
  listBrowsers(options?: ObservationOptions): Promise<Array<BrowserInfo>>;
  listTabs(options?: BrowserOptions & ObservationOptions): Promise<Array<TabInfo>>;
};
```

MCP App tabs support DOM-based interaction. Use `cua.getTab()` to bind an existing app tab; `createBrowserTab()` cannot create one. Navigation and tab lifecycle methods are optional. Use only methods listed in the returned browser documentation.

For DOM-only tabs, `getAXState()` uses a DOM snapshot without numeric element indices. `getScreenshot()` uses the tab screenshot API. Disabled observation APIs report an error. Native input wrappers remain present but throw before input. Use the documented Playwright locators to click controls and fill fields.

`cua.getApp(...)` and `cua.listApps()` support macOS, Linux, and Windows. `cua.listWindows()` is available on Linux and Windows.
`cua.browsers` and `cua.computer` expose additional browser and platform-specific computer APIs.

## Selecting a target

Reuse the app/browser inventory returned by `cua.initialize()`; call `cua.getState()` only when you need a fresh inventory.

Use the first matching browser control option from the user's request:

For a tab @-mention (`mention=tab-v1`):
Pass the complete `plugin://...` URL to get the referenced tab.

```javascript
let tab = await cua.getTab({ mention: tabMentionUrl });
```

For an existing tab identified by URL in browser context (including the current IAB tab):

```javascript
let tab = await cua.getTab({ url }, { browser: browserId });
```

Known tab ID (`tabId` or `providerTabId`) and browser (name or browser @-mention):

```javascript
let tab = await cua.getTab(tabId, { browser: browserId });
```

To open a URL in the in-app browser (`@Browser`):

```javascript
let tab = await cua.createBrowserTab("iab", url, { visible: boolean });
```

To open a URL in another named browser: pass its name directly; do not call `getBrowser` first.

```javascript
let tab = await cua.createBrowserTab(browserName, url, browserOptions);
```

Known URL, only when the user has not specified a browser by name or @-mention:

```javascript
let browser = await cua.getBrowser({ url });
```

Browser IDs and options:

- `"iab"` (in-app browser): in `createBrowserTab`, use `visible: true` to show the browser; `false` to keep it hidden.
- `"dot"` (Dot): available only when listed in the browser inventory. It accesses tabs on Dot's active main thread; `"iab"` accesses the current chat's tabs. Use the same `visible` option as `"iab"`.
- `"chrome"` (@Chrome), `"edge"` (@Edge): pass a short, emoji-prefixed `sessionName` (e.g. `"🔎 Task"`) to `createBrowserTab` when starting a task.

To inspect Dot's tabs, use `await cua.listTabs({ browser: "dot" })`. Bind an existing tab with `await cua.getTab(tabId, { browser: "dot" })`; this claims it for the current thread before reading it. Listing tabs does not claim them. Create a tab with `await cua.createBrowserTab("dot", url)`.

`getBrowser`, `getTab`, and `createBrowserTab` emit first-use browser documentation. On first use, make the chosen entry-point call in its own invocation and read the returned documentation and any initial state before continuing.


Read any returned documentation and initial UI state before continuing.

## Workflow

After performing one or more UI actions, call `getAXState()` before deciding what to do next. This keeps you in the current UI state and forces you to re-derive fresh element indices from the latest accessibility text instead of reusing stale ones.
For token efficiency, when appropriate, the accessibility tree will be returned as a diff from the most previous accessibility tree, listing only the elements that were removed, added, or changed. Prefer this default diff output; pass `{ disableDiffing: true }` only when you need a fresh full accessibility tree. After a screenshot-only observation, request a full tree before relying on accessibility indexes again.


Minimize model and tool round trips while retaining fresh UI state:

- Batch deterministic actions and the resulting `getAXState()` into one call. You may interact with the UI and return the updated state in that same call, so this does not require a separate tool call.
- Calling `cua.getApp(...)`, `cua.getTab(...)`, and `cua.createBrowserTab(...)` returns app or tab bindings and automatically displays the latest AX state after they run.
- For `chrome://newtab` (with or without a trailing slash) and Orbit’s signed new-tab extension page, `cua.getTab(...)` displays tab metadata without reading or changing the new-tab page. Use the returned tab's `goto(url)` to navigate to an allowed website.
- If a standalone `getAXState()` reports no accessibility-tree change, do not immediately repeat it without an intervening action. Use `getScreenshot()`, `getAXStateAndScreenshot()`, or `{ disableDiffing: true }` only when you can identify missing context that representation should provide.
- Prefer a directly relevant result already visible in the current state over opening broader intermediate UI such as “Show All.”
- Once the requested result is visibly present, stop exploring and respond.
  Perform one or more actions, and then fetch the latest state:

```typescript
await target.click(42);
await target.setValue(42, "openai.com");
await tab.typeText(42, "hello");
await tab.pressKey(42, "Return");
await target.scroll(42, "down", 1);
await target.scroll([640, 480], "down", 1);
await target.selectText(42, "hello");
await target.performSecondaryAction(42, "Expand");
await target.getAXState();
```

## Output

- For text output, use `nodeRepl.write(...)`. The API accepts strings and other values. Use `JSON.stringify(...)` when you want JSON.
- For image output, use `nodeRepl.emitImage(...)`. The API accepts data or file URLs, PNG/JPEG/WebP bytes, or `{ bytes, mimeType }`.
- The following APIs output their result internally, calling `nodeRepl.write(...)` and/or `nodeRepl.emitImage(...)` will duplicate the output: `getAXState()`, `getScreenshot()`, `getAXStateAndScreenshot()`, `cua.initialize()`, `cua.getState()`, `cua.getApp(...)`, `cua.getTab(...)`, `cua.createBrowserTab(...)`, `cua.listApps()`, `cua.listBrowsers()`, and `cua.listTabs()`. Pass `{ emit: false }` to observation and discovery methods to disable their result output. First-use documentation is still displayed. `cua.getBrowser()` automatically displays its first-use documentation; do not write the returned browser object or reread its documentation.

## Notes

- Browser `typeText(index, text)`, `paste(index, text, options)`, and `pressKey(index, key)` focus the specified element from the latest AX snapshot before sending input. They wait for visibility and establish and verify focus within 250 ms. Typing and pasting require an editable text field; other key presses can target focusable controls such as buttons. If the target cannot be prepared, no input is sent and the error includes a fresh AX diff (or full state when needed). Use the error's updated indices before retrying. Pass `null` as the first argument when you intentionally want to use the tab's current focus, for example `typeText(null, "hello")`, `paste(null, "hello")`, or `pressKey(null, "Escape")`. This sends input without changing or checking focus. Native app methods keep their text/key-first signatures.
- For efficiency, prefer element index based actions over coordinate actions whenever an accessibility element is available. For native apps and tabs that support coordinate input, use screenshots and coordinates when AX actions fail. For DOM-only tabs, use Playwright locators. You can also get a screenshot if you need visual context.
- Browser `paste` does not restore clipboard contents, and its `md` format inserts Markdown source as plain text. Specify `text`, `md`, or `html` explicitly where supported. Prefer `paste` for formatted content and multiline text.
- If the UI is not behaving as expected, try fetching the latest `getAXState()` to make sure you have the latest context.
- `performSecondaryAction()` is for invoking an accessibility action that an element exposes besides a normal click, such as expanding a disclosure row, showing a menu, incrementing a control, or cancelling something. It requires an action actually exposed for that element in the accessibility text. Do not guess action names.
- For browser tabs, `selectText()` selects matching text in an editable element. Use `prefix` and `suffix` to disambiguate repeated matches, and `selectionType` to choose whether to select the text itself or place the cursor before or after it.
- `pressKey()` presses a key or key combination, including modifier and navigation keys. It supports xdotool-style key syntax. Examples: `"a"`, `"Return"`, `"Tab"`, `"super+c"`, `"Up"`, and `"KP_0"` for numpad `0`.
- For browser tabs, `click` holds each mouse press for `durationMs` and holds `key` across the full click sequence.
- `getAXState()`, `getScreenshot()` and `getAXStateAndScreenshot()` automatically wait an appropriate amount of time before capturing new state. In order to complete the task as quickly as possible, don’t pause or delay (ex: `setTimeout(...)`) before getting UI state. Instead, rely on the internal wait.

Persist until the request is fully completed end-to-end. Attempting an action is not completion: verify that the returned UI state visibly shows the requested result. If an action leaves the state unchanged, produces no results, or only reaches an intermediate page, try another approach. Respond only after the requested page, information, or state is visibly present, or explain a concrete blocker you cannot resolve.
