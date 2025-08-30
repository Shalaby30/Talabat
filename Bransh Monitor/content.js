(function () {
  const TIMER_KEY = "orderTimers";

  function loadTimers() {
    return JSON.parse(localStorage.getItem(TIMER_KEY) || "{}");
  }

  function saveTimers(timers) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function createButton(orderEl, orderId, timers) {
    if (orderEl.querySelector(".order-timer-btn")) return;

    const wrapper = document.createElement("span");
    wrapper.style.marginLeft = "10px";

    const btn = document.createElement("button");
    btn.textContent = "⏳ Start";
    btn.className = "order-timer-btn";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.fontSize = "16px";
    btn.style.color = "red";

    wrapper.appendChild(btn);
    orderEl.appendChild(wrapper);

    if (timers[orderId]) {
      updateCountdown(btn, orderId, timers);
    }

    btn.addEventListener("click", () => {
      if (!timers[orderId]) {
        timers[orderId] = Math.floor(Date.now() / 1000) + 15 * 60;
        saveTimers(timers);
        updateCountdown(btn, orderId, timers);
      }
    });
  }

  function updateCountdown(btn, orderId, timers) {
    function tick() {
      const now = Math.floor(Date.now() / 1000);
      const remaining = timers[orderId] - now;

      if (remaining > 0) {
        btn.textContent = "⏳ " + formatTime(remaining);
        requestAnimationFrame(tick);
      } else {
        btn.textContent = "⏰ Done!";
        btn.style.color = "green"; // يبان أوضح انه خلص
        delete timers[orderId];
        saveTimers(timers);
      }
    }
    tick();
  }

  function observeOrders() {
    const timers = loadTimers();

    const tbody = document.querySelector("tbody");
    if (!tbody) return;

    const observer = new MutationObserver(() => {
      document.querySelectorAll(".header-medium.bold").forEach(orderEl => {
        const orderId = orderEl.textContent.trim();
        createButton(orderEl, orderId, timers);
      });
    });

    observer.observe(tbody, { childList: true, subtree: true });

    // أول تشغيل
    document.querySelectorAll(".header-medium.bold").forEach(orderEl => {
      const orderId = orderEl.textContent.trim();
      createButton(orderEl, orderId, timers);
    });
  }

  observeOrders();
})();