// Derived view of embedded code from browser-desktop/scripts/browser-service.mjs:59699; minified names are preserved.
(() => {
  const body = document.body;
  return {
    readyState: document.readyState,
    elementCount: body?.querySelectorAll('*').length ?? 0,
    textLength: body?.innerText?.length ?? 0
  };
})();
//# sourceMappingURL=browser-service.mjs.59699.standalone-helper.js.map
