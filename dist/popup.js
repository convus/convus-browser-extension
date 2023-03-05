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
