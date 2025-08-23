(function () {
  const TIMER_KEY = "orderTimers";

  // load timers from localStorage
  function loadTimers() {
    return JSON.parse(localStorage.getItem(TIMER_KEY) || "{}");
  }

  // save timers
  function saveTimers(timers) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
  }

  // format mm:ss
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function attachButtons() {
    const timers = loadTimers();

    document.querySelectorAll(".header-medium.bold").forEach(orderEl => {
      const orderId = orderEl.textContent.trim();

      // check if button already exists
      if (orderEl.parentElement.querySelector(".order-timer-btn")) return;

      // create wrapper
      const wrapper = document.createElement("span");
      wrapper.style.marginLeft = "10px";

      // create button
      const btn = document.createElement("button");
      btn.textContent = "🔔 Start";
      btn.className = "order-timer-btn";
      btn.style.cursor = "pointer";
      btn.style.border = "none";
      btn.style.background = "transparent";
      btn.style.fontSize = "16px";

      wrapper.appendChild(btn);
      orderEl.appendChild(wrapper);

      // if timer already running, show countdown instead
      if (timers[orderId]) {
        updateCountdown(btn, orderId, timers);
      }

      // handle click
      btn.addEventListener("click", () => {
        if (!timers[orderId]) {
          // 15 minutes
          timers[orderId] = Math.floor(Date.now() / 1000) + 15 * 60;
          saveTimers(timers);
          updateCountdown(btn, orderId, timers);
        }
      });
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
      }
    }
    tick();
  }

  // run every 2s to attach buttons to new orders
  setInterval(attachButtons, 2000);
})();
