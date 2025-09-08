//  (function () {
//     console.log("🚀 Content script loaded!");

//     function parsePrice(text) {
//         const normalized = text.replace(/[\u200e\u200f\u00a0]/g, "");
//         const match = normalized.match(/(\d+(\.\d+)?)/);
//         return match ? parseFloat(match[0]) : 0;
//     }

//     function calculateOrderTotal(modal) {
//         const itemsContainer = modal.querySelector("#order-items");
//         if (!itemsContainer) {
//             console.log("❌ مفيش order-items لسه");
//             return;
//         }

//         const items = itemsContainer.querySelectorAll(".item");
//         let total = 0;

//         items.forEach(item => {
//             const qtyEl = item.querySelector(".item-amount .subheader");
//             let parentQty = 1;
//             if (qtyEl) {
//                 const match = qtyEl.textContent.match(/(\d+)/);
//                 if (match) parentQty = parseInt(match[1]);
//             }

//             const priceEl = item.querySelector(".item-price p");
//             let parentPrice = 0;
//             if (priceEl) parentPrice = parsePrice(priceEl.textContent);

//             total += parentPrice;


//             const modifiers = item.querySelectorAll(".item-modifier");
//             modifiers.forEach(mod => {
//                 const modPriceEl = mod.querySelector(".modifier-price p");
//                 if (!modPriceEl) return;

//                 let modPrice = parsePrice(modPriceEl.textContent);


//                 let modQty = 1;
//                 const modQtyEl = mod.querySelector(".modifier-amount p");
//                 if (modQtyEl) {
//                     const m = modQtyEl.textContent.match(/(\d+)/);
//                     if (m) modQty = parseInt(m[1]);
//                 }


//                 total += modPrice * parentQty * modQty;
//             });
//         });

//         console.log("✅ إجمالي الأوردر:", total.toFixed(2));


//         let totalBox = itemsContainer.querySelector(".my-order-total");
//         if (!totalBox) {
//             totalBox = document.createElement("div");
//             totalBox.className = "my-order-total";
//             totalBox.style.cssText = `
//         margin: 10px 0;
//         padding: 8px;
//         background: #f8f9fa;
//         border: 1px solid #ddd;
//         border-radius: 6px;
//         font-weight: bold;
//         font-size: 16px;
//         color: black;
//         text-align: center;
//       `;
//         }
//         totalBox.textContent = `إجمالي الأوردر : ${total.toFixed(2)} ج.م`;

//         const feeElement = itemsContainer.querySelector(".fee");
//         if (feeElement && feeElement.parentNode) {
//             feeElement.parentNode.insertBefore(totalBox, feeElement);
//         } else {
//             itemsContainer.appendChild(totalBox);
//         }
//     }


//     const bodyCheck = setInterval(() => {
//         const target = document.querySelector(".body");
//         if (target) {
//             clearInterval(bodyCheck);
//             console.log("🎯 لقيت .body ... هبتدي أراقب");

//             const observer = new MutationObserver((mutations) => {
//                 mutations.forEach(m => {
//                     m.addedNodes.forEach(node => {
//                         if (node.nodeType === 1 && node.matches("wk-order-active-modal")) {
//                             console.log("🎯 لقيت Order Modal جديد");
//                             calculateOrderTotal(node);
//                         }
//                     });
//                 });
//             });

//             observer.observe(target, {
//                 childList: true,
//                 subtree: true
//             });
//         }
//     }, 1000);
// })(); 


(function () {
    console.log("🚀 Content script loaded!");

    // دالة قراءة السعر
    function parsePrice(text) {
        if (!text) return 0;

        // شيل الحروف والكلمات زي "ج.م"
        let normalized = text.replace(/[^\d.,]/g, "").trim();

        // لو مكتوب بالطريقة المصرية (1.115.00)
        const parts = normalized.split(".");
        if (parts.length > 2) {
            normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
        }

        // لو مكتوب بفواصل (1,115,00)
        const commaParts = normalized.split(",");
        if (commaParts.length > 2) {
            normalized = commaParts.slice(0, -1).join("") + "." + commaParts[commaParts.length - 1];
        }

        return parseFloat(normalized) || 0;
    }

    // دالة تنسيق السعر
    function formatPrice(num) {
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/,/g, "."); // خلي الفواصل نقط
    }

    // دالة حساب التوتال
    function calculateOrderTotal(modal) {
        const itemsContainer = modal.querySelector("#order-items");
        if (!itemsContainer) {
            console.log("❌ مفيش order-items لسه");
            return;
        }

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
            if (priceEl) parentPrice = parsePrice(priceEl.textContent);

            total += parentPrice;

            // أضف أسعار الإضافات (modifiers)
            const modifiers = item.querySelectorAll(".item-modifier");
            modifiers.forEach(mod => {
                const modPriceEl = mod.querySelector(".modifier-price p");
                if (!modPriceEl) return;

                let modPrice = parsePrice(modPriceEl.textContent);

                let modQty = 1;
                const modQtyEl = mod.querySelector(".modifier-amount p");
                if (modQtyEl) {
                    const m = modQtyEl.textContent.match(/(\d+)/);
                    if (m) modQty = parseInt(m[1]);
                }

                total += modPrice * parentQty * modQty;
            });
        });

        console.log("✅ إجمالي الأوردر:", formatPrice(total));

        // اعرض التوتال في UI
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
        totalBox.textContent = `إجمالي الأوردر : ${formatPrice(total)} ج.م`;

        const feeElement = itemsContainer.querySelector(".fee");
        if (feeElement && feeElement.parentNode) {
            feeElement.parentNode.insertBefore(totalBox, feeElement);
        } else {
            itemsContainer.appendChild(totalBox);
        }
    }

    // راقب الصفحة لحد ما يفتح order modal
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
(function () {
    console.log("🚀 Content script loaded!");

    // دالة قراءة السعر
    function parsePrice(text) {
        if (!text) return 0;

        // شيل الحروف والكلمات زي "ج.م"
        let normalized = text.replace(/[^\d.,]/g, "").trim();

        // لو مكتوب بالطريقة المصرية (1.115.00)
        const parts = normalized.split(".");
        if (parts.length > 2) {
            normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
        }

        // لو مكتوب بفواصل (1,115,00)
        const commaParts = normalized.split(",");
        if (commaParts.length > 2) {
            normalized = commaParts.slice(0, -1).join("") + "." + commaParts[commaParts.length - 1];
        }

        return parseFloat(normalized) || 0;
    }

    // دالة تنسيق السعر
    function formatPrice(num) {
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/,/g, "."); // خلي الفواصل نقط
    }

    // دالة حساب التوتال
    function calculateOrderTotal(modal) {
        const itemsContainer = modal.querySelector("#order-items");
        if (!itemsContainer) {
            console.log("❌ مفيش order-items لسه");
            return;
        }

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
            if (priceEl) parentPrice = parsePrice(priceEl.textContent);

            total += parentPrice;

            // أضف أسعار الإضافات (modifiers)
            const modifiers = item.querySelectorAll(".item-modifier");
            modifiers.forEach(mod => {
                const modPriceEl = mod.querySelector(".modifier-price p");
                if (!modPriceEl) return;

                let modPrice = parsePrice(modPriceEl.textContent);

                let modQty = 1;
                const modQtyEl = mod.querySelector(".modifier-amount p");
                if (modQtyEl) {
                    const m = modQtyEl.textContent.match(/(\d+)/);
                    if (m) modQty = parseInt(m[1]);
                }

                total += modPrice * parentQty * modQty;
            });
        });

        console.log("✅ إجمالي الأوردر:", formatPrice(total));

        // اعرض التوتال في UI
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
        totalBox.textContent = `إجمالي الأوردر : ${formatPrice(total)} ج.م`;

        const feeElement = itemsContainer.querySelector(".fee");
        if (feeElement && feeElement.parentNode) {
            feeElement.parentNode.insertBefore(totalBox, feeElement);
        } else {
            itemsContainer.appendChild(totalBox);
        }
    }

    // راقب الصفحة لحد ما يفتح order modal
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
