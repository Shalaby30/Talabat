(function () {
    console.log("🚀 Content script loaded!");

    function parsePrice(text) {
        // نشيل أي رموز خفية أو مسافات أو كوما للفصل بين الألوف
        const normalized = text.replace(/[\u200e\u200f\u00a0,]/g, "").trim();

        // نجيب الرقم
        const match = normalized.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    }


    function calculateOrderTotal(modal) {
        const itemsContainer = modal.querySelector("#order-items");
        if (!itemsContainer) {
            console.log("❌ مفيش order-items لسه");
            return;
        }

        const items = itemsContainer.querySelectorAll(".item");
        let total = 0;

        items.forEach(item => {
            // كمية الأب
            const qtyEl = item.querySelector(".item-amount .subheader");
            let parentQty = 1;
            if (qtyEl) {
                const match = qtyEl.textContent.match(/(\d+)/);
                if (match) parentQty = parseInt(match[1]);
            }

            // سعر الأب
            const priceEl = item.querySelector(".item-price p");
            let parentPrice = 0;
            if (priceEl) parentPrice = parsePrice(priceEl.textContent);

            total += parentPrice; // سعر الأب شامل الكمية (الموقع بيحسبها غالباً)

            // الإضافات (modifiers)
            const modifiers = item.querySelectorAll(".item-modifier");
            modifiers.forEach(mod => {
                const modPriceEl = mod.querySelector(".modifier-price p");
                if (!modPriceEl) return;

                let modPrice = parsePrice(modPriceEl.textContent);

                // كمية الإضافة نفسها (غالباً 1x)
                let modQty = 1;
                const modQtyEl = mod.querySelector(".modifier-amount p");
                if (modQtyEl) {
                    const m = modQtyEl.textContent.match(/(\d+)/);
                    if (m) modQty = parseInt(m[1]);
                }

                // السعر = سعر الإضافة × كمية الأب × كمية الإضافة
                total += modPrice * parentQty * modQty;
            });
        });

        console.log("✅ إجمالي الأوردر:", total.toFixed(2));

        // نضيف العنصر بتاعنا
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
        totalBox.textContent = `إجمالي الأوردر : ${total.toFixed(2)} ج.م`;

        // نحط قبل الرسوم
        const feeElement = itemsContainer.querySelector(".fee");
        if (feeElement && feeElement.parentNode) {
            feeElement.parentNode.insertBefore(totalBox, feeElement);
        } else {
            itemsContainer.appendChild(totalBox);
        }
    }

    // نستنى المودال
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
