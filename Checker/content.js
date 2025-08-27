(function () {
    console.log("🚀 Content script loaded!");

    function parsePrice(text) {
        const normalized = text.replace(/[\u200e\u200f\u00a0,]/g, "").trim();
        const match = normalized.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    }

    function calculateOrderTotal(modal) {
        const itemsContainer = modal.querySelector("#order-items");
        if (!itemsContainer) {
            console.log("❌ مفيش order-items لسه");
            return;
        }

        let doneBtn = itemsContainer.querySelector(".my-done-btn");
        if (!doneBtn) {
            doneBtn = document.createElement("button");
            doneBtn.textContent = "✅ تم التنفيذ";
            doneBtn.className = "my-done-btn";
            doneBtn.style.cssText = `
    margin-top: 10px;
    padding: 12px;
    background: green;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
    display: block;
    box-sizing: border-box;
`;

            itemsContainer.appendChild(doneBtn);
        }

        const orderIdEl = modal.querySelector(".external-id-wrapper p.medium");
        const orderId = orderIdEl ? orderIdEl.innerText.trim() : "unknown";


        const doneOrders = JSON.parse(localStorage.getItem("doneOrders") || "{}");
        if (doneOrders[orderId]) {
            doneBtn.textContent = "✔️ الأوردر منفذ";
            doneBtn.disabled = true;
            doneBtn.style.background = "gray";
        }

        doneBtn.onclick = () => {
            const doneOrders = JSON.parse(localStorage.getItem("doneOrders") || "{}");
            doneOrders[orderId] = true;
            localStorage.setItem("doneOrders", JSON.stringify(doneOrders));

            console.log(`💾 الأوردر ${orderId} اتسجل في localStorage`);
            doneBtn.textContent = "✔️ الأوردر منفذ";
            doneBtn.disabled = true;
            doneBtn.style.background = "gray";
        };
    }

    const bodyCheck = setInterval(() => {
        const target = document.querySelector(".body");
        if (target) {
            clearInterval(bodyCheck);
            console.log("🎯 لقيت .body ... هبتدي أراقب");

            const observer = new MutationObserver((mutations) => {
                mutations.forEach(m => {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.matches("wk-order-active-modal")) {
                            console.log("🎯 لقيت Order Modal جديد");
                            calculateOrderTotal(node);
                        }
                    });
                });
            });

            observer.observe(target, {
                childList: true,
                subtree: true
            });
        }
    }, 1000);
})();
