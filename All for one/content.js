// --- 0. Toast function ---

let counterEnabled = JSON.parse(localStorage.getItem("orderCounterEnabled") || "true");

function toggleOrderCounter() {
    counterEnabled = !counterEnabled;
    localStorage.setItem("orderCounterEnabled", JSON.stringify(counterEnabled));
    showToast(counterEnabled ? "✅ تم تشغيل عداد الأوردرات" : "⛔ تم إيقاف عداد الأوردرات");
    console.log("Order Counter Enabled:", counterEnabled);
}

document.addEventListener("keydown", (e) => {
    if (e.altKey && e.code === "Digit9") {
        toggleOrderCounter();
        e.preventDefault();
    }
});


function showToast(message, success = true) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "20px";
    toast.style.background = success ? "rgba(0,128,0,0.85)" : "rgba(200,0,0,0.85)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = 9999;
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.3s ease";
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// --- Persistent Order Counter Widget ---
function createPersistentOrderCounter() {
    if (document.getElementById("order-counter-widget")) return;

    const counterBox = document.createElement("div");
    counterBox.id = "order-counter-widget";
    counterBox.style.position = "fixed";
    counterBox.style.bottom = "20px";
    counterBox.style.right = "20px";
    counterBox.style.background = "#000";
    counterBox.style.color = "#fff";
    counterBox.style.padding = "10px 15px";
    counterBox.style.borderRadius = "6px";
    counterBox.style.fontSize = "14px";
    counterBox.style.fontWeight = "bold";
    counterBox.style.zIndex = 99999;
    counterBox.style.cursor = "pointer";
    counterBox.style.userSelect = "none";
    counterBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    counterBox.textContent = " Orders: 0";

    // counterBox.addEventListener("click", () => {
    //     localStorage.setItem("orderCounter", "0");
    //     updatePersistentCounter();
    //     showToast(" Counter reset to 0");
    // });

    document.body.appendChild(counterBox);
    updatePersistentCounter();
}

function updatePersistentCounter() {
    const count = parseInt(localStorage.getItem("orderCounter") || "0");
    const counterBox = document.getElementById("order-counter-widget");
    if (counterBox) counterBox.textContent = ` Orders: ${count}`;
}

window.addEventListener("storage", (e) => {
    if (e.key === "orderCounter") updatePersistentCounter();
});

createPersistentOrderCounter();

// --- 1. Clipboard functions ---
// document.addEventListener("keydown", (e) => {
//     if (e.altKey && e.code === "Digit0") {
//         const count = parseInt(localStorage.getItem("orderCounter") || "0");
//         showToast("Order Counter: " + count);
//         e.preventDefault();
//     }
// });

function copyOrderNumber() {
    const orderHeader = document.querySelector('.striped-info .title-wrapper wk-ui-title .header');
    if (!orderHeader) return showToast('❌ Order header not found', false);
    const match = orderHeader.textContent.match(/#\d+/);
    if (!match) return showToast('❌ Order number not found', false);

    navigator.clipboard.writeText(match[0])
        .then(() => showToast(`✅ Copied: ${match[0]}`))
        .catch(() => showToast('❌ Clipboard error', false));
}

function copyPhoneNumber() {
    const phoneEl = document.querySelector('.striped-info .external-id-wrapper p.medium');
    if (!phoneEl) return showToast('❌ Phone not found', false);
    navigator.clipboard.writeText(" " + phoneEl.textContent)
        .then(() => showToast(`✅ Copied: ${phoneEl.textContent}`))
        .catch(() => showToast('❌ Clipboard error', false));
}

function copyPayment() {
    let payment = "";
    document.querySelectorAll("wk-ui-caption .caption").forEach(span => {
        const t = span.textContent.trim();
        if (/CASH/i.test(t)) payment = "كاش";
        else if (t.includes("الدفع عبر")) payment = "فيزا";
    });
    if (!payment) return showToast("❌ Payment not found", false);

    const phoneEl = document.querySelector('.striped-info .external-id-wrapper p.medium');
    if (!phoneEl) return showToast("❌ Phone not found", false);

    let discountText = "";
    const discountHeader = Array.from(document.querySelectorAll("mat-expansion-panel-header"))
        .find(h => {
            const label = h.querySelector("label")?.textContent.trim().toLowerCase();
            return label === "discount" || label === "lifecycle";
        });

    if (discountHeader) {
        const p = discountHeader.querySelector("p.medium");
        if (p) discountText = ` + خصم ${p.textContent.replace(/[^\d.]/g, "")} ج`;
    }

    const finalText = payment + discountText + " // " + phoneEl.textContent;

    navigator.clipboard.writeText(finalText)
        .then(() => showToast(`✅ Copied: ${finalText}`))
        .catch(() => showToast("❌ Clipboard error", false));
}

function copyBranchNote() {
    const raw = localStorage.getItem('RestaurantApp.user-name') || "";
    let candidate = raw;
    try {
        if ((candidate.startsWith('"') && candidate.endsWith('"')) ||
            candidate.startsWith('{') || candidate.startsWith('[')) {
            const parsed = JSON.parse(candidate);
            if (typeof parsed === 'string') candidate = parsed;
            else if (parsed && typeof parsed === 'object') {
                const found = Object.values(parsed).find(v => typeof v === 'string' && /@/.test(v));
                if (found) candidate = found;
            }
        }
    } catch { }

    const emailMatch = String(candidate).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const key = (emailMatch ? emailMatch[0] : String(candidate)).trim().toLowerCase().replace(/^"|"$/g, "");

    const branchMap = {
        "zahraa@karamelsham.org": "حضورعميل زهراء معادى",
        "shubra@karamelsham.org": "حضورعميل شيرا تك واى",
        "october@karamelsham.org": "حضور عميل اكتوبر",
        "helwan@karamelsham.org": "حضور عميل  حلوان",
        "gdida@karamelsham.org": "حضورعميل مصر الجديده",
        "maskan@karamelsham.org": "حضورعميل-الف",
        "talat@karamelsham.org": "حضور عميل طلعت حرب",
        "faisal@karamelsham.org": "حضور عميل فيصل",
        "mohandseen@karamelsham.org": "حضور عميل المهندسين"
    };

    const text = branchMap[key] || "";
    if (!text) return showToast(`❌ Branch note not found for user: ${raw}`, false);

    navigator.clipboard.writeText(text)
        .then(() => showToast(`✅ Copied: ${text}`))
        .catch(() => showToast("❌ Clipboard error", false));
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "copyOrder") copyOrderNumber();
    else if (msg.action === "copyPhone") copyPhoneNumber();
    else if (msg.action === "copyPayment") copyPayment();
    else if (msg.action === "copyBranch") copyBranchNote();
});

// --- 1. Coloring headers (Discount / Lifecycle) ---
function ch_addStyleToHeaders() {
    const headers = document.querySelectorAll("mat-expansion-panel-header");
    headers.forEach(header => {
        const label = header.querySelector("label");
        if (!label) return;
        const text = label.textContent.trim().toLowerCase();
        if (text === "discount" || text === "lifecycle") {
            header.setAttribute("style", "background-color:red; border-radius:6px;");
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

    const parts = normalized.split(".");
    if (parts.length > 2) {
        normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
    }


    const commaParts = normalized.split(",");
    if (commaParts.length > 2) {
        normalized = commaParts.slice(0, -1).join("") + "." + commaParts[commaParts.length - 1];
    }


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

// --- 3. Order Timers + Counter ---
(function () {
    const TIMER_KEY = "orderTimers";
    const COUNTER_KEY = "orderCounter";

    function loadTimers() {
        return JSON.parse(localStorage.getItem(TIMER_KEY) || "{}");
    }

    function saveTimers(timers) {
        localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
    }

    function incrementCounter() {
        if (!JSON.parse(localStorage.getItem("orderCounterEnabled") || "true")) {
            console.log("⛔ Counter is disabled. No increment.");
            return;
        }

        let count = parseInt(localStorage.getItem(COUNTER_KEY) || "0");
        count++;
        localStorage.setItem(COUNTER_KEY, count);
        updatePersistentCounter();
        console.log("✅ Orders started:", count);
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

            if (timers[orderId]) updateCountdown(btn, orderId, timers);

            btn.addEventListener("click", () => {
                if (!timers[orderId]) {
                    timers[orderId] = Math.floor(Date.now() / 1000) + 15 * 60;
                    saveTimers(timers);
                    updateCountdown(btn, orderId, timers);
                    incrementCounter();
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
