(() => {
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
  browser.storage.local.get("topicsVisible").then((data) => data.topicsVisible).then((topicsVisible) => {
    toggleTopicsVisible(topicsVisible, true);
  });
  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    updateReviewFields(activeTab.url, activeTab.title);
  });
  var checkReviewToken = async function(token) {
    const authUrl = formAuthUrl();
    if (typeof authUrl === "undefined" || authUrl === null) {
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
      return setTimeout(loginTime, 50);
    }
    loginForm.classList.remove("hidden");
    document.getElementById("new_review")?.classList?.add("hidden");
    loginForm.addEventListener("submit", handleLoginSubmit);
  };
  var reviewTime = () => {
    const reviewForm = document.getElementById("new_review");
    if (typeof reviewForm === "undefined" || reviewForm === null) {
      return setTimeout(reviewTime, 50);
    }
    reviewForm.addEventListener("submit", handleReviewSubmit);
    document.getElementById("review-menu-btn").addEventListener("click", toggleMenu);
    document.querySelectorAll("#review-menu .form-control-check input").forEach((el) => el.addEventListener("change", updateMenuCheck));
    document.getElementById("logout-btn").addEventListener("click", logout);
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
      return setTimeout(window.close, 2e3);
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
  var toggleTopicsVisible = (isVisible, isOnLoad = false) => {
    window.topicsVisibile = isVisible;
    const topicsField = document.getElementById("field-group-topics");
    if (typeof topicsField === "undefined" || topicsField === null) {
      return setTimeout(toggleTopicsVisible, 50, isVisible, isOnLoad);
    }
    if (window.topicsVisibile) {
      topicsField.classList.remove("hidden");
    } else {
      topicsField.classList.add("hidden");
    }
    if (isOnLoad) {
      document.getElementById("show_topics").checked = isVisible;
    } else {
      browser.storage.local.set({ topicsVisible: isVisible });
    }
  };
  var toggleMenu = (e = null, closeMenu = "toggle") => {
    e?.preventDefault();
    const menuBtn = document.getElementById("review-menu-btn");
    const menu = document.getElementById("review-menu");
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
  var updateMenuCheck = (e) => {
    const el = e.target;
    const fieldId = el.getAttribute("data-target-id");
    if (fieldId === "field-group-topics") {
      toggleTopicsVisible(el.checked);
    } else if (el.checked) {
      document.getElementById(fieldId).classList.remove("hidden");
    } else {
      document.getElementById(fieldId).classList.add("hidden");
    }
  };
  var logout = () => {
    browser.storage.local.remove("reviewToken");
    toggleMenu(null, true);
    loginTime();
  };
})();
