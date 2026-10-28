(function () {
          try {
            return this.ownerDocument?.defaultView?.frameElement ?? null;
          } catch {
            return null;
          }
        }
);
