# Tab Capability: browserAuth
Collects credentials for a validated login form and fills them into this tab without returning the values to the caller. Include `submit` only when the page requires an explicit submission action. Omit it for forms that auto-submit during credential entry.

## Browser Authentication
<!-- otp-autofill-enabled -->
Read this guidance before beginning sign-in. Handle account choices,
identifier-only steps, and user-provided one-time codes through chat or ordinary
browser interactions. `browserAuth.request(...)` presents sign-in method choices
and securely collects passwords, other reusable secrets, and email OTPs.
Browser-client validates, fills, and submits those values without returning
them to you.
<!-- otp-autofill-disabled -->
Read this guidance before beginning sign-in. Handle account choices,
identifier-only steps, and user-provided one-time codes through chat or ordinary
browser interactions. `browserAuth.request(...)` presents sign-in method choices
and securely collects passwords and other reusable secrets.
Browser-client validates, fills, and submits those values without returning
them to you.
<!-- /otp-autofill -->

Users can select an available password manager such as 1Password in the secure
form. Use the regular `browserAuth.request(...)` flow for these sign-ins.

This guidance covers sign-in credentials only. Payment credentials do not apply.

Use `await tab.getAXState()` for general page observations. Before acting on
each new sign-in step, also inspect a fresh `await tab.getScreenshot()` to
confirm which controls are visible, even when AX appears complete. Use Playwright
inspection when preparing credential locators or inspecting frames.

Determine the current sign-in step from the screenshot. If only an identifier
and Continue are visible, handle that step first; do not request a password.
Request credentials only for inputs visibly present in the screenshot, even
if AX or DOM lists other inputs.

### Passkeys
Passkeys are unavailable for browser tasks run by the user's dot. Do not offer, recommend,
select, create, register, or attempt to sign in with passkeys, security keys, or
WebAuthn, even when a website offers them. Use another supported sign-in method,
such as a password, single sign-on, or an email verification code. If no supported
alternative exists, explain that passkeys are unavailable instead of starting
the flow.

### Non-Negotiable Rules
- Never ask the user to paste passwords, security answers, recovery codes, or
  other reusable secrets into chat.
- Never enter, read, inspect, log, print, or reconstruct reusable sign-in secrets
  with Playwright, vision, tool output, or any other model-visible surface.
- Use secure credential requests for reusable secrets. Include an unknown
  username, email address, or phone number when the same form also requires a
  password. When requesting reusable secrets and multiple supported sign-in
  methods are visible, include `options` for those methods unless the user
  already chose a method. Also use `options` when the method-selection rules
  below leave a choice for the user.
- CAPTCHAs are outside `browserAuth`. Never use this capability for one; follow
  this browser's CAPTCHA guidance.
- Never include secrets, cookies, full URLs, query strings, JavaScript,
  DOM snippets, or other page content in a browser-auth request, except the
  selected account in `account_identifier`. Browser-client
  supplies the request message; do not provide one. Credential-field and
  sign-in option labels must describe only controls actually visible on the
  current page.
- If `browserAuth` returns `unavailable`, stop automated credential entry. If
  this browser's guidance permits manual takeover, offer its documented
  handoff. Otherwise, politely say that this browser cannot help the user log
  in to the site; do not explain why. For this refusal, do not add login steps
  unless the user explicitly asks how to sign in themselves. Never tell the
  user to sign in and come back; signing in in their browser does not sign in
  this browser. Do not fall back to chat or direct entry for reusable secrets.
- If login blocks only part of a broader task, keep and return any useful public
  work already completed.

### Authentication Lifecycle
1. Before the first authentication interaction, retain the target site's origin
   or a canonical signed-in URL for later verification, for example with
   `const targetOrigin = new URL(await tab.url()).origin`.
2. Inspect the visible page. Use only methods the page actually offers, such as
   phone or SMS OTP, email or Gmail OTP, Google sign-in, username and password,
   or device approval. Honor the user's stated identity and method
   preference. Reuse relevant memory and available account context for their
   username, email, or phone number; do not ask them to repeat known information.
   Prefer the following authentication methods in order of preference if it is not explicitly user stated:
   1. The user's previously logged in method on the site
   2. An identity provider like Google if they've successfully logged in elsewhere.
   If the intended identity is still ambiguous, offer to sign in with known information,
   preferring email and phone OTP where possible. Do not use secure elicitation for method choices,
   just ask in chat.
   Autofill known identifiers through ordinary browser interactions. On an
   identifier-only step, ask for an unknown identifier in chat. If the current
   form asks for both an unknown identifier and a password, collect both in one
   `browserAuth.request(...)` instead of asking separately in chat.
   When the user supplies an identifier for the current sign-in, that is explicit
   authorization to fill it; do not ask for another confirmation before entering.
   On an account chooser, when one already signed-in account is offered, select
   it directly unless it conflicts with the user's stated identity or method
   preference. If it conflicts, use another sign-in path that matches the
   requested identity and method. Otherwise, do not ask whether they want to
   use a different account. With multiple accounts, select a clear match to the
   intended identity; ask in chat if the choice remains ambiguous.
<!-- otp-autofill-enabled -->
3. Follow the selected method through the visible page. Handle identifiers as
   described above. Retrieve email OTP handles only from the connected mailbox
   matching the chosen identity and current sign-in attempt. For
   `[otp-handle:VALUE]`, pass the short reference `VALUE` as `otpHandle` to
   `browserAuth.request(...)`. It is scoped to this thread; never decode it or
   type it into the page. Each autofill asks for user approval; declining offers
   manual entry. Do not retry autofill after a denial. If email OTP autofill
   fails, explain the failure and ask for the code in chat so you can enter it.
   Also ask in chat if no handle is available. Enter the code through ordinary
   browser interactions, without `browserAuth`. Use it only for this attempt;
   never echo or save it.
<!-- otp-autofill-disabled -->
3. Follow the selected method through the visible page. Handle identifiers as
   described above and enter one-time sign-in codes through ordinary browser
   interactions. One-time codes must come directly from the user. Ask for the code
   in chat; never search for or retrieve it from email, messages, or other sources.
   Use a code only for the current sign-in attempt; do not echo or save it.
<!-- /otp-autofill -->
   For Google verification, select an existing phone OTP method first, then
   device approval. Do not ask the user to choose when that selection is clear.
<!-- otp-autofill-enabled -->
   Use `browserAuth.request(...)` for reusable secrets, email OTPs, or the QR
   approval flow below.
<!-- otp-autofill-disabled -->
   Use `browserAuth.request(...)` only when reusable secrets are needed, or for
   the QR approval flow below.
<!-- /otp-autofill -->
   Include an unknown identifier with the password when both must be collected;
   omit identifiers already filled from `fields`.
   If the flow would create an account, confirm permission in chat, naming the
   identity that would be used and offering to use another existing account.
   Signing in or using a service does not itself authorize registration. Honor
   explicit signup authorization already given.
   If the website displays a QR code for approval on another device, call
   `browserAuth.request({ origin: new URL(await tab.url()).origin, fields: [], qr_code: true })`.
   Browser-client securely captures and decodes the visible QR code. Never
   inspect, print, copy, or reconstruct its destination URL yourself. The only
   exception is a trusted native-mobile handoff error that explicitly provides
   a validated HTTPS sign-in URL: show the user that exact supplied URL, ask
   them to open it and report back when finished, and wait for their reply.
   Never expose another QR payload or derive a URL the error did not supply.
   If two-step verification or device approval displays a number-matching
   challenge, tell the user the exact non-secret number or matching detail to
   select on their device, for example, "Tap 37 on your phone."
   If the matching detail is an emoji, icon, or image, describe that exact
   visual cue, for example, "Tap the 🥶 emoji on your phone." Never invent a
   number or translate an image into a numeric code. Do not request
   manual browser takeover when approval on another device is sufficient. After
   the user confirms, call `await tab.getAXState()` and continue authentication.
   Repeat the account and method selection rules at each new authentication or
   recovery decision point. If the selected method fails, inspect the
   website-surfaced error before requesting credentials again. For an incorrect
   username, password, or verification code, report the error and, if this browser's guidance
   permits manual takeover, offer its documented handoff. Otherwise, let the
   user choose whether to retry or use a visible alternative. Never switch
   methods without the user's choice. If the site explicitly blocks sign-in or
   reports a generic failure such as "An error occurred" or "Something went
   wrong," stop after the first occurrence and explain that the website might
   be blocking sign-in. When using Cloud Browser, share the Help Center article
   in its guidance.
4. After every authentication transition, call
   `await tab.getAXState()`. Check for a CAPTCHA, error, next authentication
   step, or success. If AX state is incomplete, call `await tab.getScreenshot()`
   and use frame-aware Playwright inspection where needed. Do not assume success
   or dismiss an overlay without inspecting it.
5. When authentication appears complete, verify the target site with fresh
   `await tab.getAXState()` evidence. Treat a closed auth popup, blank page,
   spinner, missing tab, stale tab, or timeout as an unknown result, not a failed
   login and not proof of success.
6. If the target page fails to load after authentication, immediately create a
   new agent tab and navigate it to the retained target origin or canonical
   signed-in URL:

   ```js
   const verificationTab = await browser.tabs.new();
   await verificationTab.goto(targetOrigin);
   await verificationTab.getAXState();
   ```

   Inspect that fresh page. Authentication may already have succeeded and its
   cookies may be available even when the original tab or popup is stuck. Make
   this fresh-tab check the first recovery action; do not poll the stale tab,
   enumerate tabs, or reconnect first.
7. Report success only when the fresh target-domain page shows a positive
   signed-in signal. If the fresh page shows a login or verification screen,
   continue the authentication workflow from that page. If browser access still
   fails, report the state as unknown; never ask the user to check or operate
   this browser.
8. After a successful login with an identity provider, remember this so that
   next time you visit a different site, you can prefer it. Also, remember which
   login method you used on a site, so that if a user becomes logged out on a site
   in the future, you can login with the same method.

### Prepare A Credential Request
1. Inspect the live sign-in form with targeted Playwright checks that identify
   the currently visible credential fields and submit behavior, such as
   `tab.playwright.domSnapshot()` or narrowly scoped locator checks.
   Inspect what has already rendered.
<!-- otp-autofill-enabled -->
2. Include only inputs that are visible and enabled on the current page: reusable
   secrets, email OTPs, and any unknown identifier requested alongside a password.
   An email OTP request contains only the code input (or its digit inputs).
<!-- otp-autofill-disabled -->
2. Include only inputs that are visible and enabled on the current page: reusable
   secrets and any unknown identifier requested alongside a password. One-time
   codes belong in ordinary browser interactions, never in this secure request.
<!-- /otp-autofill -->
   Issue exactly one request at a time for the current sign-in page. For
   multi-step sign-in, inspect the new page and make a separate request after
   each navigation.
   When requesting only a password for a chosen sign-in method, always set
   `account_identifier` to the exact username or email already entered or
   clearly shown as the selected account for this sign-in. This includes an
   identifier filled on the current page or an earlier step. If no account
   identifier is available, omit it and still request the password. Never guess.
3. Start with `tab.playwright.domSnapshot()` to identify iframe hierarchy and
   owner attributes.
   If a field, option, or submit is inside an iframe, use its `frameLocator(...)`;
   use `frameLocator("iframe")` only when it resolves uniquely. Choose stable
   selectors that each resolve to exactly one field. Prefer semantic attributes
   such as `name`, `type`, and `autocomplete`. Avoid random-looking generated
   IDs when a stable semantic selector is available. Do not infer attributes
   that were not inspected.
4. Set each field's `type` to its actual non-empty HTML input type. For
   example, a password input may be `password`, and a security answer input
   may be `text`.
   Pass the inspected `autocomplete` value when the page exposes one.
   Set `label` to a short noun phrase describing only what the user should
   enter. Prefer concise wording visible on the page; otherwise use a natural
   label such as `Password`, `Security answer`, or `Recovery code`.
   Do not include instructions, explanations, required markers, account-specific
   values, or complete sentences.
5. Use only the current canonical origin, with scheme, host, and port but no
   path, query, or fragment.
6. Omit `submit` when filling the credential fields causes the form to
   auto-submit. Otherwise, prefer `click` on a stable selector that resolves
   to exactly one visible submit control distinct from the credential fields.
   The submit control may initially be disabled; after filling the fields,
   `browserAuth` waits for it to become enabled before clicking.
   If no suitable submit control exists and Enter on the final credential
   field submits the form, use `press_enter` with that exact field selector.

If a visible textbox may be inside a component or shadow root, inspect its
`id`, `name`, and `type` attributes through a browser-side role locator, then
verify the resulting exact CSS selector with browser-side Playwright locator
count, visibility, and enabled checks. An accessible name reported by a role
locator is not proof that an `aria-label` attribute exists. Never infer an
`aria-label` selector; use one only when the inspected attribute is actually
present. Do not treat `document.querySelectorAll(...)` returning zero as
authoritative for a shadow-root textbox.

Use only the existing browser-side surface for sign-in inspection. Do not run
shell commands, standalone or local Playwright, package installs, browser
runtime installs, or reconnect attempts to inspect the site. Reuse existing
browser and tab handles for browser-side checks.

Browser-client is the source of truth for whether the request is safe to show
to the user. Submit the inspected locators with `browserAuth.request(...)`.
If it returns `locator_invalid`, re-inspect the current form and correct the
request.

If inspection fails, make one additional targeted browser inspection. If it
still cannot identify the required visible, enabled fields, offer the documented
manual handoff when this browser's guidance permits it; otherwise, report the
blockage.

### Request Credentials
Get the advertised capability and issue a request containing only non-secret
metadata and selectors. For a combined form with an unknown username and password:

```js
const browserAuth = await tab.capabilities.get("browserAuth");
const browserAuthUrl = await tab.url();
if (!browserAuthUrl) {
  throw new Error("Cannot determine the current tab URL for browser auth.");
}

const usernameField = tab.playwright.locator('input[name="username"]');
const passwordField = tab.playwright.locator('input[type="password"]');
const submitButton = tab.playwright.locator('button[type="submit"]');

const browserAuthResult = await browserAuth.request({
  origin: new URL(browserAuthUrl).origin,
  fields: [
    {
      id: "username",
      label: "Username",
      type: "text",
      autocomplete: "username",
      required: true,
      selector: usernameField,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      autocomplete: "current-password",
      required: true,
      selector: passwordField,
    },
  ],
  submit: {
    selector: submitButton,
    action: "click",
  },
});
nodeRepl.write(browserAuthResult);
```

The example selectors are illustrative. Always inspect the current page and use
selectors that match its actual fields. If these controls are inside an iframe:

```js
const frame = tab.playwright.frameLocator("iframe#auth");
const field = frame.locator('input[type="password"]');
const submit = frame.locator('button[type="submit"]');
```

Omit `submit` when the form auto-submits during credential entry.

### Request A Sign-In Method
When a request for reusable secrets is needed and the user has not chosen a
method, include every supported method visibly offered on the current sign-in
page in `options`.
Also use `options` when the method-selection rules leave the choice ambiguous.
Include `options` only for two or more methods. A visible method button or link
counts even when its credential fields appear only after clicking it. For example,
offer visible Google, phone number, and email sign-in link controls alongside a
username and password form. Do not include hidden or unavailable methods.

For the current credential form, set the option's `field_ids` to the IDs of its
included fields and omit `selector`. For a visible method button or link, set
`selector` to its locator and omit `field_ids`. Each locator must resolve to one
visible, enabled control. Set each `label` to a short method name such as
"Google", "phone number", "email sign-in link", or "username and password".
Use `fields: []` when all options are buttons or links.

For an option with `selector`, Browser-client clicks the selected control and
returns its non-secret `selected_option` identifier. If that click reveals new
credential fields, inspect the new page and make a separate request for those
visible fields.
<!-- otp-autofill-enabled -->
Do not combine `otpHandle` with `options`; make the email OTP request separately
after the method is chosen.
<!-- otp-autofill-disabled -->

<!-- /otp-autofill -->

### Handle The Credential Request Result
- `submitted` means the selected sign-in control was clicked or credential entry
  completed and any configured submit action ran; it does not prove that sign-in
  succeeded. When options were offered, `selected_option` identifies the user's
  choice. Resume the Authentication Lifecycle at its transition-inspection step.
- `locator_invalid`, `page_changed`, or `origin_changed` means the saved request
  is stale or unsafe. If authentication still blocks the task, re-inspect the
  current page and issue a corrected fresh request.
- `expired` is a legacy result from an older browser runtime. Re-inspect before
  issuing a fresh request.
- `declined` with `reason: "user_took_over"` means the user took manual control
  of the cloud browser; their actions and final authentication state are
  unknown. Inspect the final page state with `await tab.getAXState()`, then continue the
  Authentication Lifecycle from its transition-inspection step. Do not inspect
  or act on any intermediate state from the manual sign-in.
- `declined` without that reason or `cancelled` means the user chose not to
  continue. Respect that choice and do not retry unless the user asks.
- `unavailable` must never trigger a fallback to chat or direct entry of
  reusable secrets. Follow the refusal guidance above.
- `submission_failed` must never trigger a fallback to chat or direct entry of
  reusable secrets. Inspect the current page for a non-secret website error and
  report it only if the website visibly shows it. Otherwise, follow the refusal
  guidance above.
- The result never contains credential values. Never try to print or
  reconstruct them.

## API Reference
```ts
const capability = await tab.capabilities.get("browserAuth");

type BrowserAuthRequestOptions = Omit<BrowserAuthHandoffOptions, "fields" | "options" | "submit"> & { fields: Array<BrowserAuthRequestField>; options?: Array<BrowserAuthRequestOption>; submit?: BrowserAuthRequestSubmit };

type BrowserAuthHandoffOptions = z.infer<typeof BrowserAuthHandoffOptionsSchema>;

type BrowserAuthRequestField = Omit<BrowserAuthField, "selector"> & { selector: BrowserAuthSelector };

type BrowserAuthRequestOption = Omit<BrowserAuthOption, "selector"> & { selector?: BrowserAuthSelector };

type BrowserAuthRequestSubmit = Omit<BrowserAuthSubmit, "selector"> & { selector: BrowserAuthSelector };

type BrowserAuthField = z.infer<typeof BrowserAuthFieldSchema>;

type BrowserAuthSelector = string | PlaywrightLocator;

type BrowserAuthOption = z.infer<typeof BrowserAuthOptionSchema>;

type BrowserAuthSubmit = z.infer<typeof BrowserAuthSubmitSchema>;

interface BrowserAuthTabCapability {
  request(options: BrowserAuthRequestOptions): Promise<{ locator_error?: { field_id: string; reason: "not_user_visible" }; reason?: "user_took_over"; selected_option?: string; status: "origin_changed" | "submission_failed" | "submitted" | "unavailable" | "page_changed" | "locator_invalid" | "declined" | "cancelled" | "expired"; submission_diagnostics?: { attempt_events?: Array<{ field_index?: number; kind: "prompt_completed" | "field_fill_started" | "field_fill_completed" | "field_fill_uncertain" | "url_changed" | "document_changed" | "frame_changed" | "reinspection_started" | "reinspection_succeeded" | "reinspection_failed" | "site_request" | "site_navigation" | "site_submission_verified" | "submit_started" | "attempt_completed"; method?: "other" | "get" | "post"; origin_relation?: "other" | "same" | "cross"; outcome?: "origin_changed" | "submission_failed" | "submitted" | "unavailable" | "page_changed" | "locator_invalid" | "prompt_changed"; phase: "prompt" | "settled" | "filling" | "before_submit" | "submitting"; reinspection?: number; request_class?: "main_document" | "background"; sequence: number }>; dropped_attempt_events?: number; first_rejection?: { outcome: "origin_changed" | "submission_failed"; reason: "other" | "request_url_invalid" | "request_scheme" | "request_origin" | "paused_iframe" | "iframe_origin" | "child_frame_origin"; request_class: "other" | "main_document" | "background"; submission_phase: "pending" | "settled" | "not_applicable" }; request_id: string; schema_version: 1; submission_mode: "ordinary" | "private"; terminal_rejection?: { outcome: "origin_changed" | "submission_failed"; reason: "other" | "request_url_invalid" | "request_scheme" | "request_origin" | "paused_iframe" | "iframe_origin" | "child_frame_origin"; request_class: "other" | "main_document" | "background"; submission_phase: "pending" | "settled" | "not_applicable" } } }>; // Request credentials for a validated login form. When requesting only a password for a chosen sign-in method, always set account_identifier to the exact username or email already entered or clearly shown as the selected account for this sign-in, including on the current page. If none is available, omit it and still request the password. Never guess. When `submit` is omitted, a `submitted` result means the credential fields were filled successfully; inspect the resulting page to confirm that the form auto-submitted and sign-in advanced.
}
```
