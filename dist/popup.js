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
  if (false) {
    import_loglevel.default.setLevel("warn");
  } else {
    import_loglevel.default.setLevel("debug");
  }
  var log_default = import_loglevel.default;

  // api.js
  var requestProps = (authToken = false, extraProps = {}) => {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const defaultProps = {
      method: "POST",
      async: true,
      headers,
      contentType: "json"
    };
    return { ...defaultProps, ...extraProps };
  };
  var isAuthTokenValid = (authUrl, authToken) => new Promise((resolve, reject) => {
    const authStatusUrl = `${authUrl}/status`;
    return fetch(authStatusUrl, requestProps(authToken, { method: "GET" })).then(
      (response2) => response2.json().then((json) => {
        resolve(json.message !== "missing user" && response2.status === 200);
      })
    ).catch((e) => {
      resolve(errorResponse(e));
    });
  });
  var getAuthToken = (authUrl, loginFormData) => new Promise((resolve, reject) => {
    const rProps = {
      method: "POST",
      async: true,
      headers: { "Content-Type": "application/json" },
      contentType: "json",
      body: loginFormData
    };
    return fetch(authUrl, rProps).then(
      (response2) => response2.json().then((json) => {
        let result2 = {};
        if (response2.status !== 200 || typeof json.review_token === "undefined" || json.review_token === null) {
          result2.message = ["error", json.message];
        } else {
          result2 = { authToken: json.review_token, currentName: json.name, message: ["success", "authenticated"] };
        }
        resolve(result2);
      })
    ).catch((e) => {
      resolve(errorResponse(e));
    });
  });
  var submitRating = (ratingUrl, authToken, ratingFormData) => new Promise((resolve, reject) => {
    const rProps = requestProps(authToken, { body: ratingFormData });
    return fetch(ratingUrl, rProps).then(
      (response2) => response2.json().then((json) => {
        if (response2.status === 200) {
          resolve({
            success: true,
            message: ["success", json.message],
            share: json.share
          });
        } else {
          resolve({ success: false, message: ["error", json.message] });
        }
      })
    ).catch((e) => {
      resolve(errorResponse(e));
    });
  });
  var errorResponse = (e) => {
    return { success: false, message: ["error", `Error: ${e})`] };
  };
  var api_default = {
    getAuthToken,
    isAuthTokenValid,
    requestProps,
    submitRating
  };

  // utilities.js
  var retryIfMissing = (obj, func, ...args) => {
    if (typeof obj === "undefined" || obj === null) {
      log_default.debug(`${func.name} requires an element not present in DOM, trying again in 50ms`);
      setTimeout(func, 5e3, ...args);
      return true;
    }
  };
  var baseUrl = () => {
    return document.getElementById("body-popup").getAttribute("data-baseurl");
  };
  var renderLocalAlert = () => {
    if (document.getElementById("local-alert")) {
      return;
    }
    if (baseUrl().match(/http:\/\/localhost/i)) {
      const localAlert = document.createElement("div");
      localAlert.textContent = "local convus";
      localAlert.classList.add("text-gray-400", "text-center");
      localAlert.setAttribute("id", "local-alert");
      document.getElementById("body-popup").append(localAlert);
    }
  };
  var pageLoadedFunctions = () => {
    renderLocalAlert();
  };
  var hideAlerts = () => {
    const visibleAlerts = document.querySelectorAll(".alert");
    visibleAlerts.forEach((el) => el.classList.add("hidden"));
    const visibleShares = document.querySelectorAll(".shareVisible");
    visibleShares.forEach((el) => el.classList.add("hidden"));
  };
  var copyShare = (event) => {
    const el = event.target.closest(".shareVisible");
    const shareText = el.getAttribute("data-sharetext");
    navigator.clipboard.writeText(shareText);
    const copiedAlert = document.createElement("p");
    copiedAlert.textContent = "Copied results to clipboard";
    copiedAlert.classList.add("text-center", "px-2", "py-2", "mt-4");
    el.append(copiedAlert);
  };
  var shareDiv = (shareText) => {
    const template = document.querySelector("#templates .shareTemplate");
    const el = template.cloneNode(true);
    el.classList.remove("shareTemplate");
    el.classList.add("shareVisible");
    el.setAttribute("data-sharetext", shareText);
    el.querySelector(".btnShare").addEventListener("click", copyShare);
    return el;
  };
  var renderAlerts = (message, shareText = null) => {
    hideAlerts();
    const kind = message[0];
    const text = message[1];
    const body = document.getElementById("body-popup");
    const alert = document.createElement("div");
    alert.textContent = text;
    alert.classList.add(`alert-${kind}`, "alert", "my-4");
    body.prepend(alert);
    if (typeof shareText !== "undefined" && shareText !== null) {
      alert.after(shareDiv(shareText));
    }
  };
  var toggleMenu = (event = false, closeMenu = "toggle") => {
    event && event.preventDefault();
    const menuBtn = document.getElementById("rating-menu-btn");
    const menu = document.getElementById("rating-menu");
    const action = closeMenu === "toggle" ? menu.classList.contains("active") : closeMenu;
    if (action) {
      menu.classList.add("hidden");
      menu.classList.remove("active");
      menuBtn.classList.remove("active");
    } else {
      menu.classList.remove("hidden");
      menu.classList.add("active");
      menuBtn.classList.add("active");
    }
  };
  var utilities_default = {
    hideAlerts,
    pageLoadedFunctions,
    renderAlerts,
    toggleMenu,
    retryIfMissing
  };

  // rating.js
  var updateRatingFields = (tabUrl, title) => {
    const ratingUrlField = document.getElementById("submitted_url");
    utilities_default.retryIfMissing(ratingUrlField, updateRatingFields, tabUrl, title);
    ratingUrlField.value = tabUrl;
    document.getElementById("citation_title").value = title;
    document.getElementById("timezone").value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
  var ratingTime = () => {
    const ratingForm = document.getElementById("new_rating");
    if (utilities_default.retryIfMissing(ratingForm, ratingTime)) {
      return;
    }
    ratingForm.addEventListener("submit", handleRatingSubmit);
    document.getElementById("rating-menu-btn").addEventListener("click", utilities_default.toggleMenu);
    document.querySelectorAll("#rating-menu .form-control-check input").forEach((el) => el.addEventListener("change", updateMenuCheck));
    document.getElementById("logout-btn").addEventListener("click", login_default.logout);
    if (window.authToken) {
      document.getElementById("new_user").classList.add("hidden");
      ratingForm.classList.remove("hidden");
    }
    if (window.currentName) {
      document.getElementById("username").textContent = window.currentName;
    }
    utilities_default.pageLoadedFunctions();
  };
  var formNewRatingUrl = () => document.getElementById("new_rating")?.getAttribute("action");
  var handleRatingSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("new_rating"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    const result2 = await api_default.submitRating(formNewRatingUrl(), window.authToken, jsonFormData);
    log_default.debug(result2);
    utilities_default.renderAlerts(result2.message, result2.share);
    if (result2.success) {
      document.getElementById("new_rating").classList.add("hidden");
      utilities_default.toggleMenu(false, true);
    }
    return false;
  };
  var updateMenuCheck = (event) => {
    const el = event.target;
    const fieldId = el.getAttribute("data-target-id");
    if (el.checked) {
      document.getElementById(fieldId).classList.remove("hidden");
    } else {
      document.getElementById(fieldId).classList.add("hidden");
    }
  };
  var rating_default = {
    ratingTime,
    updateRatingFields
  };

  // login.js
  var formAuthUrl = () => document.getElementById("new_user")?.getAttribute("action");
  var handleLoginSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("new_user"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    const result2 = await api_default.getAuthToken(formAuthUrl(), jsonFormData);
    log_default.debug(result2);
    if (typeof result2.authToken === "undefined" || result2.authToken === null) {
      utilities_default.renderAlerts(result2.message);
    } else {
      browser.storage.local.set(result2);
      window.authToken = result2.authToken;
      window.currentName = result2.currentName;
      utilities_default.hideAlerts();
      rating_default.ratingTime();
    }
    return false;
  };
  var checkAuthToken = async function(token) {
    const authUrl = formAuthUrl();
    if (utilities_default.retryIfMissing(authUrl, checkAuthToken, token)) {
      return;
    }
    const result2 = await api_default.isAuthTokenValid(authUrl, token);
    if (result2) {
      return;
    }
    browser.storage.local.remove("authToken");
    browser.storage.local.remove("name");
    window.authToken = void 0;
    loginTime();
  };
  var loginTime = () => {
    const loginForm = document.getElementById("new_user");
    if (utilities_default.retryIfMissing(loginForm, loginTime)) {
      return;
    }
    loginForm.classList.remove("hidden");
    document.getElementById("new_rating")?.classList?.add("hidden");
    loginForm.addEventListener("submit", handleLoginSubmit);
    utilities_default.pageLoadedFunctions();
  };
  var logout = () => {
    browser.storage.local.remove("authToken");
    utilities_default.toggleMenu(false, true);
    loginTime();
  };
  var login_default = {
    checkAuthToken,
    loginTime,
    logout
  };

  // popup.js
  if (true) {
    browser = chrome;
  }
  browser.storage.local.get(["authToken", "currentName"]).then((data) => {
    if (typeof data.authToken === "undefined" || data.authToken === null) {
      login_default.loginTime();
    } else {
      window.authToken = data.authToken;
      window.currentName = data.currentName;
      rating_default.ratingTime();
      login_default.checkAuthToken(data.authToken);
    }
  });
  function coolPageScript(pageUrl) {
    if (pageUrl === "http://localhost:3009/browser_extension_auth") {
      const authInfo = { apiToken: window.apiToken, username: window.username };
      return JSON.stringify(authInfo);
    } else {
      return JSON.stringify({ metadata: "asdfasd" });
    }
  }
  var getCurrentTab = async function() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    rating_default.updateRatingFields(tab.url, tab.title);
    response = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      function: coolPageScript,
      args: [tab.url]
    });
    log_default.debug(response);
    result = JSON.parse(response[0].result);
    log_default.debug(result);
  };
  getCurrentTab();
})();
//# sourceMappingURL=popup.js.map
