export class Site24x7LoggingService {
  static init() {
    Site24x7LoggingService.enableSite24x7(process.env.REACT_APP_SITE24X7_KEY);
  }

  static site24x7ErrorHandler = function (error) {
    if (window.s247r) {
      window.s247r('captureException', error);
    }
  };

  /**
   * @private
   * @param key
   */
  static enableSite24x7(key) {
    if (window.performance && window.performance.timing && window.performance.navigation && key) {
      if (!window.s247r) {
        window.s247r = function () {
          if (!window.s247r.q) {
            window.s247r.q = [];
          }
          window.s247r.q.push(arguments);
        };
      }
      const headScript = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');

      script.async = true;
      script.setAttribute('src', `//static.site24x7rum.com/beacon/site24x7rum-min.js?appKey=${key}`);
      headScript.appendChild(script);

      const windowError = window.onerror;

      window.onerror = function (message, source, lineno, colno, error) {
        if (windowError) {
          windowError(message, source, lineno, colno, error);
        }
        if (!error) {
          error = new Error(message);
        }
        if (!window.s247r.q) {
          window.s247r.q = [];
        }

        window.s247r.q.push(['captureException', error]);
      };
    }
  }
}
