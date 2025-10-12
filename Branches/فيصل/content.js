// =========================
// Content script
// =========================

// --- 1. Coloring headers (Discount / Lifecycle) ---
function ch_addStyleToHeaders() {
    const headers = document.querySelectorAll("mat-expansion-panel-header");

    headers.forEach(header => {
        const label = header.querySelector("label");
        if (!label) return;

        const text = label.textContent.trim().toLowerCase();
        if (text === "discount" || text === "lifecycle") {
            header.setAttribute(
                "style",
                "background-color:red; border-radius:6px;"
            );
        }
    });
}

ch_addStyleToHeaders();
const ch_observer = new MutationObserver(ch_addStyleToHeaders);
ch_observer.observe(document.body, { childList: true, subtree: true });

// --- 2. Order total calculation ---
function ot_parsePrice(text) {
    if (!text) return 0;
    let normalized = text.replace(/[^\d.,]/g, "").trim();

    // split على النقطة
    const parts = normalized.split(".");
    if (parts.length > 2) {
        normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
    }

    // split على الكوما
    const commaParts = normalized.split(",");
    if (commaParts.length > 2) {
        normalized = commaParts.slice(0, -1).join("") + "." + commaParts[commaParts.length - 1];
    }

    // شيل أي فواصل ألوف
    normalized = normalized.replace(/,/g, "");

    return parseFloat(normalized) || 0;
}

function ot_formatPrice(num) {
    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/,/g, ".");
}

function ot_calculateOrderTotal(modal) {
    const itemsContainer = modal.querySelector("#order-items");
    if (!itemsContainer) return;

    const items = itemsContainer.querySelectorAll(".item");
    let total = 0;

    items.forEach(item => {
        const qtyEl = item.querySelector(".item-amount .subheader");
        let parentQty = 1;
        if (qtyEl) {
            const match = qtyEl.textContent.match(/(\d+)/);
            if (match) parentQty = parseInt(match[1]);
        }

        const priceEl = item.querySelector(".item-price p");
        let parentPrice = 0;
        if (priceEl) parentPrice = ot_parsePrice(priceEl.textContent);

        total += parentPrice;

        const modifiers = item.querySelectorAll(".item-modifier");
        modifiers.forEach(mod => {
            const modPriceEl = mod.querySelector(".modifier-price p");
            if (!modPriceEl) return;

            let modPrice = ot_parsePrice(modPriceEl.textContent);

            let modQty = 1;
            const modQtyEl = mod.querySelector(".modifier-amount p");
            if (modQtyEl) {
                const m = modQtyEl.textContent.match(/(\d+)/);
                if (m) modQty = parseInt(m[1]);
            }

            total += modPrice * parentQty * modQty;
        });
    });

    console.log("✅ إجمالي الأوردر:", ot_formatPrice(total));

    let totalBox = itemsContainer.querySelector(".my-order-total");
    if (!totalBox) {
        totalBox = document.createElement("div");
        totalBox.className = "my-order-total";
        totalBox.style.cssText = `
      margin: 10px 0;
      padding: 8px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      color: black;
      text-align: center;
    `;
    }
    totalBox.textContent = `إجمالي الأوردر : ${ot_formatPrice(total)} ج.م`;

    const feeElement = itemsContainer.querySelector(".fee");
    if (feeElement && feeElement.parentNode) {
        feeElement.parentNode.insertBefore(totalBox, feeElement);
    } else {
        itemsContainer.appendChild(totalBox);
    }
}

const ot_bodyCheck = setInterval(() => {
    const target = document.querySelector(".body");
    if (target) {
        clearInterval(ot_bodyCheck);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches("wk-order-active-modal")) {
                        ot_calculateOrderTotal(node);
                    }
                });
            });
        });

        observer.observe(target, { childList: true, subtree: true });
    }
}, 1000);

// --- 3. Order Timers ---
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

    function attachButtons() {
        const timers = loadTimers();

        document.querySelectorAll(".header-medium.bold").forEach(orderEl => {
            const orderId = orderEl.textContent.trim();
            if (orderEl.parentElement.querySelector(".order-timer-btn")) return;

            const wrapper = document.createElement("span");
            wrapper.style.marginLeft = "10px";

            const btn = document.createElement("button");
            btn.textContent = "🔔 Start";
            btn.className = "order-timer-btn";
            btn.style.cursor = "pointer";
            btn.style.border = "none";
            btn.style.background = "transparent";
            btn.style.fontSize = "16px";

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

    setInterval(attachButtons, 2000);
})();
