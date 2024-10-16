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
  import_loglevel.default.setLevel("debug");
  var log_default = import_loglevel.default;

  // api.ts
  function requestProps(authToken = "", extraProps = {}) {
    const defaultProps = {
      method: "POST",
      async: true,
      headers: {
        "Content-Type": "application/json",
        ...authToken.length > 0 && { Authorization: `Bearer ${authToken}` }
      },
      contentType: "json"
    };
    return { ...defaultProps, ...extraProps };
  }
  async function isAuthTokenValid(authUrl2, authToken) {
    return await new Promise(async (resolve, _reject) => {
      const authStatusUrl = `${authUrl2}/status`;
      return await fetch(authStatusUrl, requestProps(authToken, { method: "GET" })).then(
        async (response) => await response.json().then((json) => {
          resolve(json.message !== "missing user" && response.status === 200);
        })
      ).catch((e) => {
        log_default.debug(errorResponse(e));
        resolve(false);
      });
    });
  }
  async function getAuthToken(authUrl2, loginFormData) {
    return await new Promise(async (resolve, _reject) => {
      const rProps = {
        method: "POST",
        async: true,
        headers: { "Content-Type": "application/json" },
        contentType: "json",
        body: loginFormData
      };
      return await fetch(authUrl2, rProps).then(
        async (response) => await response.json().then((json) => {
          resolve(responseFormatter(response, json));
        })
      ).catch((e) => {
        resolve(errorResponse(e));
      });
    });
  }
  function responseFormatter(authResponse, authJson) {
    if (authResponse.status !== 200 || typeof authJson.review_token === "undefined" || authJson.review_token === null) {
      return { message: ["error", authJson.message] };
    } else {
      return { authToken: authJson.review_token, currentName: authJson.name, message: ["success", "authenticated"] };
    }
  }
  async function postRating(ratingUrl, authToken, ratingFormData) {
    return await new Promise(async (resolve, _reject) => {
      const rProps = requestProps(authToken, { body: ratingFormData });
      return await fetch(ratingUrl, rProps).then(
        async (response) => await response.json().then((json) => {
          if (response.status === 200) {
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
  }
  async function getRating(ratingUrl, authToken, url) {
    return await new Promise(async (resolve, _reject) => {
      const rProps = requestProps(authToken, { method: "GET" });
      const getRatingUrl = `${ratingUrl}/for_url?url=${encodeURIComponent(url)}`;
      log_default.trace("getRatingUrl", getRatingUrl);
      return await fetch(getRatingUrl, rProps).then(
        async (response) => await response.json().then((json) => {
          if (response.status === 200 && json.quality) {
            resolve({
              success: true,
              data: json
            });
          } else {
            resolve({ success: false, data: json });
          }
        })
      ).catch((e) => {
        resolve(errorResponse(e));
      });
    });
  }
  function errorResponse(e) {
    return { success: false, message: ["error", `Error: ${e})`] };
  }
  var api_default = {
    getAuthToken,
    isAuthTokenValid,
    requestProps,
    getRating,
    postRating
  };

  // utilities.js
  var retryIfMissing = (obj, func, ...args) => {
    if (typeof obj === "undefined" || obj === null) {
      log_default.debug(`${func.name} requires an element not present in DOM, trying again in 50ms`);
      setTimeout(func, 50, ...args);
      return true;
    }
  };
  var baseUrl = "http://localhost:3009";
  var renderLocalAlert = () => {
    if (document.getElementById("local-alert")) {
      return;
    }
    if (baseUrl.match(/http:\/\/localhost/i)) {
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
  var elementsFromSelectorOrElements = (selOrEl) => {
    if (typeof selOrEl === "string") {
      return document.querySelectorAll(selOrEl);
    } else {
      return [selOrEl].flat();
    }
  };
  var elementsHide = (selOrEl) => {
    elementsFromSelectorOrElements(selOrEl).forEach((el) => el.classList.add("hidden"));
  };
  var elementsShow = (selOrEl) => {
    elementsFromSelectorOrElements(selOrEl).forEach((el) => el.classList.remove("hidden"));
  };
  var elementsCollapse = (selOrEl, toggle = true) => {
    const els = elementsFromSelectorOrElements(selOrEl);
    if (toggle === true) {
      toggle = els[0]?.classList.contains("hidden") ? "show" : "hide";
    }
    if (toggle === "show") {
      els.forEach((el) => el.classList.remove("hidden"));
    } else {
      els.forEach((el) => el.classList.add("hidden"));
    }
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
  var renderAlert = (kind, text, shareText) => {
    const body = document.getElementById("body-popup");
    const alert = document.createElement("div");
    alert.textContent = text;
    alert.classList.add(`alert-${kind}`, "alert", "my-4");
    body.prepend(alert);
    if (typeof shareText !== "undefined" && shareText !== null) {
      alert.after(shareDiv(shareText));
    }
  };
  var renderAlerts = (messages, shareText = null) => {
    hideAlerts();
    if (typeof messages[0] === "string") {
      messages = [messages];
    }
    messages.forEach((m) => renderAlert(m[0], m[1], shareText));
  };
  var toggleMenu = (event = false, toggle = true) => {
    event && event.preventDefault();
    const menuBtn = document.getElementById("rating-menu-btn");
    const menu = document.getElementById("rating-menu");
    if (toggle === true) {
      toggle = menuBtn.classList.contains("active") ? "hide" : "show";
    }
    elementsCollapse(menu, toggle);
    if (toggle === "hide") {
      menuBtn.classList.remove("active");
    } else {
      menuBtn.classList.add("active");
    }
  };
  var utilities_default = {
    elementsCollapse,
    elementsHide,
    elementsShow,
    hideAlerts,
    pageLoadedFunctions,
    renderAlerts,
    retryIfMissing,
    toggleMenu
  };

  // rating.js
  var formNewRatingUrl = () => document.getElementById("new_rating")?.getAttribute("action");
  var ratingCheckboxes = ["changed_opinion", "significant_factual_error", "learned_something", "not_understood", "not_finished"];
  var submitRating = async function() {
    const formData = new FormData(document.getElementById("new_rating"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    return await api_default.postRating(formNewRatingUrl(), window.authToken, jsonFormData);
  };
  var handleRatingSubmit = async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("ratingSubmitButton");
    submitBtn.classList.add("disabled");
    utilities_default.elementsShow("#rating-submit-spinner");
    const result = await submitRating();
    log_default.debug(result);
    utilities_default.renderAlerts(result.message, result.share);
    if (result.success) {
      document.getElementById("new_rating").classList.add("hidden");
      utilities_default.toggleMenu(false, "hide");
    }
    utilities_default.elementsHide("#rating-submit-spinner");
    submitBtn.classList.remove("disabled");
    return false;
  };
  var backgroundRatingUpdate = async function() {
    if (window.ratingDataLoaded && window.metadataLoaded) {
      const result = await submitRating();
      log_default.debug(result);
    }
    return true;
  };
  var updateMenuCheck = (event) => {
    const el = event.target;
    const targetField = document.getElementById(el.getAttribute("data-target-id"));
    utilities_default.elementsCollapse(targetField, el.checked ? "show" : "hide");
  };
  var ratingTime = () => {
    log_default.trace("ratingTime");
    const ratingForm = document.getElementById("new_rating");
    if (utilities_default.retryIfMissing(ratingForm, ratingTime)) {
      return;
    }
    ratingForm.addEventListener("submit", handleRatingSubmit);
    document.getElementById("rating-menu-btn").addEventListener("click", utilities_default.toggleMenu);
    document.querySelectorAll("#rating-menu .form-control-check input").forEach((el) => el.addEventListener("change", updateMenuCheck));
    document.getElementById("logout-btn").addEventListener("click", login_default.logout);
    showRatingForm();
    utilities_default.pageLoadedFunctions();
  };
  var showRatingForm = () => {
    log_default.trace("showRatingForm");
    if (window.authToken) {
      if (login_default.isAuthUrl()) {
        return;
      }
      utilities_default.elementsHide(".spinners, #whitespace-preserver");
      utilities_default.elementsShow("#rating-save-row");
      utilities_default.elementsShow("#new_rating");
    }
    if (window.currentName) {
      document.getElementById("username").textContent = window.currentName;
    }
  };
  var updateBasicRatingFields = (tabUrl, title) => {
    log_default.trace("updateBasicRatingFields");
    const ratingUrlField = document.getElementById("submitted_url");
    utilities_default.retryIfMissing(ratingUrlField, updateBasicRatingFields, tabUrl, title);
    ratingUrlField.value = tabUrl;
    document.getElementById("citation_title").value = title;
    document.getElementById("timezone").value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    ratingTime();
  };
  var updateAdditionalRatingFields = (ratingAttrs) => {
    log_default.trace("updateAdditionalRatingFields");
    log_default.debug(ratingAttrs);
    const ratingUrlField = document.getElementById("submitted_url");
    utilities_default.retryIfMissing(ratingUrlField, updateAdditionalRatingFields, ratingAttrs);
    if (ratingAttrs.quality !== "quality_med") {
      document.getElementById(`quality_${ratingAttrs.quality}`).checked = true;
    }
    if (ratingAttrs.agreement !== "neutral") {
      document.getElementById(`agreement_${ratingAttrs.agreement}`).checked = true;
    }
    ratingCheckboxes.filter((field) => ratingAttrs[field]).forEach(function(field) {
      document.getElementById(field).checked = true;
    });
    window.ratingDataLoaded = true;
    ratingCheckboxes.concat(["quality_quality_high", "quality_quality_med", "quality_quality_low"]).forEach((field) => document.getElementById(field).addEventListener("change", backgroundRatingUpdate));
  };
  var loadRemoteRatingData = async (tabUrl) => {
    const result = await api_default.getRating(formNewRatingUrl(), window.authToken, tabUrl);
    log_default.debug(`rating result: ${JSON.stringify(result)}`);
    if (result.success) {
      updateAdditionalRatingFields(result.data);
    }
  };
  var addMetadata = (metadata) => {
    log_default.debug(`addMetadata, metadata length: ${metadata?.length}`);
    const citationMetadataField = document.getElementById("citation_metadata_str");
    utilities_default.retryIfMissing(citationMetadataField, addMetadata, metadata);
    citationMetadataField.value = JSON.stringify(metadata);
    window.metadataLoaded = true;
  };
  var rating_default = {
    addMetadata,
    showRatingForm,
    updateBasicRatingFields,
    loadRemoteRatingData
  };

  // login.js
  var baseUrl2 = "http://localhost:3009";
  var formAuthUrl = baseUrl2 + "/api/v1/auth";
  var authUrl = baseUrl2 + "/browser_extension_auth";
  var storeAuthData = (authToken, currentName) => {
    browser.storage.local.set({ authToken, currentName });
    window.authToken = authToken;
    window.currentName = currentName;
  };
  var handleFallbackLoginSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById("new_user"));
    const jsonFormData = JSON.stringify(Object.fromEntries(formData));
    const result = await api_default.getAuthToken(formAuthUrl, jsonFormData);
    log_default.debug(result);
    if (typeof result.authToken === "undefined" || result.authToken === null) {
      utilities_default.renderAlerts(result.message);
    } else {
      storeAuthData(result.authToken, result.currentName);
      utilities_default.hideAlerts();
      if (isAuthUrl()) {
        utilities_default.elementsCollapse("#new_user");
        utilities_default.renderAlerts([["success", "Logged in!"]]);
      } else {
        rating_default.showRatingForm();
      }
    }
    return false;
  };
  var countdownAndClose = (selector, ms, closeFunc = false) => {
    if (window.currentUrl?.toLowerCase()?.endsWith("#noclose")) {
      log_default.trace("URL ends with #noClose, so skip automatically closing");
      utilities_default.elementsHide(".closeAutomaticallyText");
      return;
    }
    let secondsLeft = ms / 1e3;
    const countdownEl = document.querySelector(selector);
    countdownEl.textContent = secondsLeft;
    const countdownTimer = setInterval(function() {
      countdownEl.textContent = secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1e3);
    if (closeFunc) {
      setTimeout(closeFunc, ms);
    }
    setTimeout(window.close, ms);
  };
  var removeAuthData = () => {
    browser.storage.local.remove("authToken");
    browser.storage.local.remove("currentName");
    window.authToken = void 0;
  };
  var isAuthUrl = (url = null) => (url || window.currentUrl).startsWith(authUrl);
  var isSignInOrUpUrl = (url = null) => {
    url ||= window.currentUrl;
    return `${baseUrl2}/users/sign_in` === url || `${baseUrl2}/users/sign_up` === url;
  };
  var checkAuthToken = async function(token) {
    if (utilities_default.retryIfMissing(formAuthUrl, checkAuthToken, token)) {
      return;
    }
    const result = await api_default.isAuthTokenValid(formAuthUrl, token);
    log_default.trace("auth token check success:", result);
    if (result) {
      rating_default.showRatingForm();
      return;
    }
    removeAuthData();
    loginTime();
  };
  var loginFromAuthPageData = (authToken, currentName) => {
    log_default.trace(`loginFromAuthPageData - authToken: ${authToken}, ${currentName}`);
    utilities_default.hideAlerts();
    storeAuthData(authToken, currentName);
    utilities_default.elementsHide(".spinners, #new_rating, #whitespace-preserver, #sign_in_message");
    utilities_default.elementsShow("#auth_message_in");
    window.closeTabFunction = (event = false) => {
      event && event.preventDefault();
      chrome.tabs.remove(window.tabId);
    };
    document.getElementById("closeTabLink").addEventListener("click", window.closeTabFunction);
    countdownAndClose("#in_countdown", 3e3, window.closeTabFunction);
  };
  var loginTime = () => {
    log_default.trace("loginTime");
    if (isAuthUrl()) {
      return;
    }
    if (window.fallbackLogin) {
      return;
    }
    const loginMessage = document.getElementById("sign_in_message");
    if (utilities_default.retryIfMissing(loginMessage, loginTime)) {
      return;
    }
    if (isSignInOrUpUrl()) {
      log_default.debug("sign in page!!!");
      document.querySelector("#sign_in_message p").textContent = "Sign in to Convus on this page";
    }
    utilities_default.elementsHide(".spinners, #new_rating, #whitespace-preserver");
    utilities_default.elementsShow(loginMessage);
    utilities_default.pageLoadedFunctions();
    document.getElementById("signInBtn").addEventListener("click", () => {
      setTimeout(window.close, 100);
    });
  };
  var fallbackLoginTime = () => {
    log_default.debug("fallbacklogintime - UNABLE TO PARSE THE PAGE, probably Safari BS");
    window.fallbackLogin = true;
    const loginForm = document.getElementById("new_user");
    if (utilities_default.retryIfMissing(loginForm, loginTime)) {
      return;
    }
    utilities_default.elementsHide("#new_rating, .spinners, #whitespace-preserver, #sign_in_message");
    utilities_default.elementsShow(loginForm);
    loginForm.addEventListener("submit", handleFallbackLoginSubmit);
  };
  var logout = () => {
    removeAuthData();
    utilities_default.toggleMenu(false, "hide");
    utilities_default.elementsHide("#new_rating");
    utilities_default.elementsShow("#auth_message_out");
    countdownAndClose("#out_countdown", 5e3);
  };
  var login_default = {
    loginFromAuthPageData,
    checkAuthToken,
    fallbackLoginTime,
    isAuthUrl,
    isSignInOrUpUrl,
    loginTime,
    logout
  };

  // injected_script.js
  function injectedScript() {
    const authUrl2 = "http://localhost:3009/browser_extension_auth";
    console.log("Convus extension is getting the page metadata!");
    if (window.location.href.startsWith(authUrl2)) {
      const authData = {
        currentName: document.querySelector('meta[name="ext-username"]')?.content,
        authToken: document.querySelector('meta[name="ext-token"]')?.content
      };
      return authData;
    }
    const attrToPair = (attr) => [attr.name, attr.value];
    const elToAttrs = (el) => Object.fromEntries(Array.from(el.attributes).map(attrToPair));
    const elsToAttrs = (els) => Array.from(els).map(elToAttrs);
    const jsonLdString = (scriptEls) => Array.from(scriptEls).map((i) => i.innerText.trim());
    let metadataAttrs = elsToAttrs(document.getElementsByTagName("meta"));
    const jsonLD = jsonLdString(document.querySelectorAll('script[type="application/ld+json"]'));
    if (jsonLD.length) {
      metadataAttrs = [...metadataAttrs, ...[{ json_ld: jsonLD }]];
    }
    let articleText = document.querySelector("body").innerText;
    const nonArticleSelectors = [
      "nav",
      "header",
      "footer",
      "#disqus_thread",
      ".GoogleActiveViewElement",
      ".hide-for-print"
    ];
    Array.from(document.querySelectorAll(nonArticleSelectors)).forEach(function(t) {
      articleText = articleText.replaceAll(t.innerText, "");
    });
    articleText = articleText.replaceAll("\\nADVERTISEMENT\\n", "\n");
    return metadataAttrs.concat([{ citation_text: articleText }]);
  }

  // popup.js
  var browserTarget = "chrome";
  var safariType = !!browserTarget.match("safari");
  if (browserTarget == "chrome") {
    browser = chrome;
  }
  browser.storage.local.get(["authToken", "currentName"]).then((data) => {
    if (typeof data.authToken === "undefined" || data.authToken === null) {
      log_default.debug(`missing auth!   authToken: '${data.authToken}' and currentName: '${data.currentName}'`);
      login_default.loginTime();
    } else {
      log_default.trace("auth present");
      window.authToken = data.authToken;
      window.currentName = data.currentName;
      login_default.checkAuthToken(data.authToken);
    }
  });
  var handlePageData = (response, isAuthUrl2) => {
    log_default.debug("Script response: ", response);
    let result = response[0];
    if (result.result !== void 0) {
      result = result.result;
    }
    log_default.warn(`result: ${JSON.stringify(result)}`);
    if (isAuthUrl2) {
      log_default.trace(`authUrl?: ${isAuthUrl2}    ${window.currentUrl}`);
      login_default.loginFromAuthPageData(result.authToken, result.currentName);
    } else {
      rating_default.addMetadata(result);
    }
  };
  var injectScript = async function(tabId, isAuthUrl2) {
    await browser.scripting.executeScript({
      target: { tabId },
      func: injectedScript
    }).then((response) => {
      try {
        handlePageData(response, isAuthUrl2);
      } catch (e) {
        log_default.debug(e);
        let alert = [["warning", "Unable to parse the page."]];
        if (safariType) {
          alert = [["error", "Please upgrade to the most recent version Safari"]];
        }
        utilities_default.renderAlerts(alert);
        if (!window.authToken) {
          login_default.fallbackLoginTime();
        }
      }
    });
  };
  var getCurrentTab = async function() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    log_default.trace(tab);
    window.currentUrl = tab.url;
    const isAuthUrl2 = login_default.isAuthUrl(window.currentUrl);
    window.tabId = tab.id;
    window.ratingDataLoaded = false;
    window.metadataLoaded = false;
    if (login_default.isSignInOrUpUrl(window.currentUrl)) {
      log_default.debug("Viewing Convus sign in or up");
      return;
    } else if (!isAuthUrl2) {
      rating_default.updateBasicRatingFields(window.currentUrl, tab.title);
      rating_default.loadRemoteRatingData(window.currentUrl);
    }
    injectScript(window.tabId, isAuthUrl2);
  };
  getCurrentTab();
})();
//# sourceMappingURL=popup.js.map
