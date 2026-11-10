function e(e){if(!(Number.isSafeInteger(e)&&e>=0&&e<=3e4))throw new Error("durationMs must be an integer from 0 to 30000 milliseconds.");return e/1e3}export{e as duration_seconds};
