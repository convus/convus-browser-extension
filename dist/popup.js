(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../node_modules/loglevel/lib/loglevel.js
  var require_loglevel = __commonJS({
    "../node_modules/loglevel/lib/loglevel.js"(exports, module) {
      (function(root, definition) {
        "use strict";
        if (typeof define === "function" && define.amd) {
          define(definition);
        } else if (typeof module === "object" && module.exports) {
          module.exports = definition();
        } else {
          root.log = definition();
        }
      })(exports, function() {
        "use strict";
        var noop = function() {
        };
        var undefinedType = "undefined";
        var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
        var logMethods = [
          "trace",
          "debug",
          "info",
          "warn",
          "error"
        ];
        function bindMethod(obj, methodName) {
          var method = obj[methodName];
          if (typeof method.bind === "function") {
            return method.bind(obj);
          } else {
            try {
              return Function.prototype.bind.call(method, obj);
            } catch (e) {
              return function() {
                return Function.prototype.apply.apply(method, [obj, arguments]);
              };
            }
          }
        }
        function traceForIE() {
          if (console.log) {
            if (console.log.apply) {
              console.log.apply(console, arguments);
            } else {
              Function.prototype.apply.apply(console.log, [console, arguments]);
            }
          }
          if (console.trace)
            console.trace();
        }
        function realMethod(methodName) {
          if (methodName === "debug") {
            methodName = "log";
          }
          if (typeof console === undefinedType) {
            return false;
          } else if (methodName === "trace" && isIE) {
            return traceForIE;
          } else if (console[methodName] !== void 0) {
            return bindMethod(console, methodName);
          } else if (console.log !== void 0) {
            return bindMethod(console, "log");
          } else {
            return noop;
          }
        }
        function replaceLoggingMethods(level, loggerName) {
          for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = i < level ? noop : this.methodFactory(methodName, level, loggerName);
          }
          this.log = this.debug;
        }
        function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
          return function() {
            if (typeof console !== undefinedType) {
              replaceLoggingMethods.call(this, level, loggerName);
              this[methodName].apply(this, arguments);
            }
          };
        }
        function defaultMethodFactory(methodName, level, loggerName) {
          return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
        }
        function Logger(name, defaultLevel, factory) {
          var self = this;
          var currentLevel;
          defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;
          var storageKey = "loglevel";
          if (typeof name === "string") {
            storageKey += ":" + name;
          } else if (typeof name === "symbol") {
            storageKey = void 0;
          }
          function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || "silent").toUpperCase();
            if (typeof window === undefinedType || !storageKey)
              return;
            try {
              window.localStorage[storageKey] = levelName;
              return;
            } catch (ignore) {
            }
            try {
              window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
            } catch (ignore) {
            }
          }
          function getPersistedLevel() {
            var storedLevel;
            if (typeof window === undefinedType || !storageKey)
              return;
            try {
              storedLevel = window.localStorage[storageKey];
            } catch (ignore) {
            }
            if (typeof storedLevel === undefinedType) {
              try {
                var cookie = window.document.cookie;
                var location = cookie.indexOf(
                  encodeURIComponent(storageKey) + "="
                );
                if (location !== -1) {
                  storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                }
              } catch (ignore) {
              }
            }
            if (self.levels[storedLevel] === void 0) {
              storedLevel = void 0;
            }
            return storedLevel;
          }
          function clearPersistedLevel() {
            if (typeof window === undefinedType || !storageKey)
              return;
            try {
              window.localStorage.removeItem(storageKey);
              return;
            } catch (ignore) {
            }
            try {
              window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            } catch (ignore) {
            }
          }
          self.name = name;
          self.levels = {
            "TRACE": 0,
            "DEBUG": 1,
            "INFO": 2,
            "WARN": 3,
            "ERROR": 4,
            "SILENT": 5
          };
          self.methodFactory = factory || defaultMethodFactory;
          self.getLevel = function() {
            return currentLevel;
          };
          self.setLevel = function(level, persist) {
            if (typeof level === "string" && self.levels[level.toUpperCase()] !== void 0) {
              level = self.levels[level.toUpperCase()];
            }
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {
                persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                return "No console available for logging";
              }
            } else {
              throw "log.setLevel() called with invalid level: " + level;
            }
          };
          self.setDefaultLevel = function(level) {
            defaultLevel = level;
            if (!getPersistedLevel()) {
              self.setLevel(level, false);
            }
          };
          self.resetLevel = function() {
            self.setLevel(defaultLevel, false);
            clearPersistedLevel();
          };
          self.enableAll = function(persist) {
            self.setLevel(self.levels.TRACE, persist);
          };
          self.disableAll = function(persist) {
            self.setLevel(self.levels.SILENT, persist);
          };
          var initialLevel = getPersistedLevel();
          if (initialLevel == null) {
            initialLevel = defaultLevel;
          }
          self.setLevel(initialLevel, false);
        }
        var defaultLogger = new Logger();
        var _loggersByName = {};
        defaultLogger.getLogger = function getLogger(name) {
          if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
            throw new TypeError("You must supply a name when creating a logger.");
          }
          var logger = _loggersByName[name];
          if (!logger) {
            logger = _loggersByName[name] = new Logger(
              name,
              defaultLogger.getLevel(),
              defaultLogger.methodFactory
            );
          }
          return logger;
        };
        var _log = typeof window !== undefinedType ? window.log : void 0;
        defaultLogger.noConflict = function() {
          if (typeof window !== undefinedType && window.log === defaultLogger) {
            window.log = _log;
          }
          return defaultLogger;
        };
        defaultLogger.getLoggers = function getLoggers() {
          return _loggersByName;
        };
        defaultLogger["default"] = defaultLogger;
        return defaultLogger;
      });
    }
  });

  // log.js
  var import_loglevel = __toESM(require_loglevel());
  if (true) {
    import_loglevel.default.setLevel("warn");
  } else {
    import_loglevel.default.setLevel("debug");
  }
  var log_default = import_loglevel.default;

  // api.js
  var requestProps = (reviewToken = false, extraProps = {}) => {
    const headers = { "Content-Type": "application/json" };
    if (reviewToken) {
      headers.Authorization = `Bearer ${reviewToken}`;
    }
    const defaultProps = {
      method: "POST",
      async: true,
      headers,
      contentType: "json"
    };
    return { ...defaultProps, ...extraProps };
  };
  var isReviewTokenValid = (authUrl, reviewToken) => new Promise((resolve, reject) => {
    const authStatusUrl = `${authUrl}/status`;
    return fetch(authStatusUrl, requestProps(reviewToken, { method: "GET" })).then(
      (response) => response.json().then((json) => {
        resolve(json.message !== "missing user" && response.status === 200);
      })
    ).catch((e) => {
      reject(e);
    });
  });
  var getReviewToken = (authUrl, loginFormData) => new Promise((resolve, reject) => {
    const rProps = {
      method: "POST",
      async: true,
      headers: { "Content-Type": "application/json" },
      contentType: "json",
      body: loginFormData
    };
    return fetch(authUrl, rProps).then(
      (response) => response.json().then((json) => {
        let result = {};
        if (response.status !== 200 || typeof json.review_token === "undefined" || json.review_token === null) {
          result.messages = [["error", json.message]];
        } else {
          result = { reviewToken: json.review_token, messages: [["success", "authenticated"]] };
        }
        resolve(result);
      })
    ).catch((e) => {
      reject(e);
    });
  });
  var submitReview = (reviewUrl, reviewToken, reviewFormData) => new Promise((resolve, reject) => {
    const rProps = requestProps(reviewToken, { body: reviewFormData });
    return fetch(reviewUrl, rProps).then(
      (response) => response.json().then((json) => {
        if (response.status === 200) {
          resolve({ success: true, messages: [["success", json.message]] });
        } else {
          resolve({ success: false, messages: [["error", json.message]] });
        }
      })
    ).catch((e) => {
      reject(e);
    });
  });
  var api_default = {
    getReviewToken,
    isReviewTokenValid,
    requestProps,
    submitReview
  };

  // popup.js
  if (false) {
    browser = chrome;
  }
  browser.storage.local.get("reviewToken").then((data) => data.reviewToken).then((reviewToken) => {
    if (typeof reviewToken === "undefined" || reviewToken === null) {
      loginTime();
    } else {
      window.reviewToken = reviewToken;
      reviewTime();
      checkReviewToken(reviewToken);
    }
  });
  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    updateReviewFields(activeTab.url, activeTab.title);
  });
  var checkReviewToken = async function(token) {
    const authUrl = formAuthUrl();
    if (typeof authUrl === "undefined" || authUrl === null) {
      log_default.debug(`authUrl not present in DOM, trying later (${token})`);
      return setTimeout(checkReviewToken, 50, token);
    }
    const result = await api_default.isReviewTokenValid(authUrl, token);
    if (result) {
      return;
    }
    browser.storage.local.remove("reviewToken");
    window.reviewToken = void 0;
    loginTime();
  };
  var updateReviewFields = (tabUrl, title) => {
    const reviewUrlField = document.getElementById("submitted_url");
    if (typeof reviewUrlField === "undefined" || reviewUrlField === null) {
      log_default.debug("reviewUrlField not present in DOM, trying later");
      return setTimeout(updateReviewFields, 50, tabUrl, title);
    }
    reviewUrlField.value = tabUrl;
    document.getElementById("citation_title").value = title;
  };
  var formAuthUrl = () => document.getElementById("new_user")?.getAttribute("action");
  var formNewReviewUrl = () => document.getElementById("new_review")?.getAttribute("action");
  var loginTime = () => {
    const loginForm = document.getElementById("new_user");
    if (typeof loginForm === "undefined" || loginForm === null) {
      log_default.debug("login form not present in DOM, trying later");
      return setTimeout(loginTime, 50);
    }
    loginForm.classList.remove("hidden");
    document.getElementById("new_review")?.classList?.add("hidden");
    loginForm.addEventListener("submit", handleLoginSubmit);
  };
  var reviewTime = () => {
    const reviewForm = document.getElementById("new_review");
    if (typeof reviewForm === "undefined" || reviewForm === null) {
      log_default.debug("review form not present in DOM, trying later");
      return setTimeout(reviewTime, 50);
    }
    reviewForm.addEventListener("submit", handleReviewSubmit);
    if (window.reviewToken) {
      document.getElementById("new_user").classList.add("hidden");
      reviewForm.classList.remove("hidden");
    }
  };
  var handleLoginSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("new_user"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    const result = await api_default.getReviewToken(formAuthUrl(), jsonFormData);
    if (typeof result.reviewToken === "undefined" || result.reviewToken === null) {
      renderAlerts(result.messages);
    } else {
      browser.storage.local.set(result);
      window.reviewToken = result.reviewToken;
      hideAlerts();
      reviewTime();
    }
    return false;
  };
  var handleReviewSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("new_review"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    const result = await api_default.submitReview(formNewReviewUrl(), window.reviewToken, jsonFormData);
    renderAlerts(result.messages);
    if (result.success) {
      document.getElementById("new_review").classList.add("hidden");
      return setTimeout(window.close, 3e3);
    }
    return false;
  };
  var hideAlerts = () => {
    const visibleAlerts = document.querySelectorAll(".alert");
    visibleAlerts.forEach((el) => el.classList.add("hidden"));
  };
  var renderAlerts = (messages) => {
    hideAlerts();
    messages.forEach((arr) => {
      const body = document.getElementById("body-popup");
      const alert = document.createElement("div");
      alert.textContent = arr[1];
      alert.classList.add(`alert-${arr[0]}`, "alert", "my-4");
      body.prepend(alert);
    });
  };
})();
//# sourceMappingURL=popup.js.map
