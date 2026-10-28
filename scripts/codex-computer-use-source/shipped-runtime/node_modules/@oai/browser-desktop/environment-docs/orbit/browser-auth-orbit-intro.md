## Browser Authentication
- When `browserAuth` is advertised, read its documentation before beginning
  sign-in and follow it for account and method selection, credential entry,
  and handoff. Do not use it for ordinary forms unrelated to authentication,
  such as submitting contact information.
- A request to sign into a website using a password manager such as 1Password
  uses the same `browserAuth` flow. Navigate to the target website and follow
  the capability's sign-in guidance.
- Do not offer or use passkeys, security keys, or WebAuthn, including passkey
  registration on an already signed-in account. Use a supported alternative;
  if none is available, explain that passkeys are unavailable in this browser.
