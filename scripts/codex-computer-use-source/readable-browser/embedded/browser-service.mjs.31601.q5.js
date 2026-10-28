// Derived view of embedded code from browser-desktop/scripts/browser-service.mjs:31601; minified names are preserved.
(() => {
  const focusedFrameElementInRoot = root => {
    const active = root.activeElement;
    if (active == null) return null;
    const activeWindow = active.ownerDocument.defaultView ?? window;
    if (active instanceof activeWindow.HTMLElement && active.shadowRoot != null) return focusedFrameElementInRoot(active.shadowRoot);
    if (active instanceof activeWindow.HTMLIFrameElement || active instanceof activeWindow.HTMLFrameElement) {
      try {
        const frameDocument = active.contentDocument ?? active.contentWindow?.document ?? null;
        if (frameDocument != null) return focusedFrameElementInRoot(frameDocument);
      } catch {}
      return active;
    }
    return null;
  };
  return focusedFrameElementInRoot(document);
})();
//# sourceMappingURL=browser-service.mjs.31601.q5.js.map
