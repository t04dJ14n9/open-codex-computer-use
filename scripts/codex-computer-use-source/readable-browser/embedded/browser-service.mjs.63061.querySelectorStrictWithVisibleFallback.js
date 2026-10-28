// Derived view of embedded code from browser-desktop/scripts/browser-service.mjs:63061; minified names are preserved.
function querySelectorStrictWithVisibleFallback(injected, parsedSelector, root, strict = false) {
  const matches = injected.querySelectorAll(parsedSelector, root);
  if (!matches.length) {
    injected.checkDeprecatedSelectorUsage(parsedSelector, matches);
    return null;
  }
  if (matches.length === 1) {
    injected.checkDeprecatedSelectorUsage(parsedSelector, matches);
    return matches[0];
  }
  if (strict) throw injected.strictModeViolationError(parsedSelector, matches);
  const visibleMatches = matches.filter(element => {
    const state = injected.elementState(element, "visible");
    return !!state.matches;
  });
  if (visibleMatches.length === 1) return visibleMatches[0];
  throw injected.strictModeViolationError(parsedSelector, matches);
}
//# sourceMappingURL=browser-service.mjs.63061.querySelectorStrictWithVisibleFallback.js.map
