chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (command === "show-order") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractOrderData
        });
    } else if (command === "copy-order-number") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractOrderNumber
        });
    } else if (command === "copy-order-id") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractOrderId
        });
    } else if (command === "copy-customer-arrival") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyCustomerArrival
        });
    }
});

function extractOrderNumber() {
    // Try to find order number in the popup first
    let orderNumber = document.getElementById("orderNumber")?.textContent.trim();

    // If not found in popup, try to find it in the modal
    if (!orderNumber) {
        const modal = document.querySelector("wk-order-active-modal, [class*='order-active-modal']");
        if (!modal) {
            alert("❌ لم يتم العثور على الأوردر بعد، افتحه واضغط Alt+1 تاني");
            return;
        }
        orderNumber = modal.querySelector(".header")?.textContent.match(/#(\d+)/)?.[1];
    }

    if (orderNumber) {
        navigator.clipboard.writeText("#" + orderNumber)
            .then(() => alert("✅ تم نسخ رقم الأوردر: " + orderNumber))
            .catch(err => console.error("❌ خطأ في النسخ: ", err));
    } else {
        alert("❌ لم يتم العثور على رقم الأوردر");
    }
}

function extractOrderId() {
    const orderId2 = document.getElementById("orderId")?.textContent.trim();
    if (orderId2) {
        navigator.clipboard.writeText(orderId2)
            .then(() => alert("✅ تم نسخ الكود الخارجي: " + orderId2))
            .catch(err => console.error("❌ خطأ في النسخ: ", err));
    } else {
        alert("❌ لم يتم العثور على الكود الخارجي");
    }
}

function copyCustomerArrival() {
    const text = "حضور عميل فيصل";
    navigator.clipboard.writeText(text)
        .then(() => alert("✅ تم نسخ النص: " + text))
        .catch(err => console.error("❌ خطأ في النسخ: ", err));
}

function extractOrderData() {
    const modal = document.querySelector("wk-order-active-modal, [class*='order-active-modal']");
    if (!modal) {
        alert("❌ لم يتم العثور على الأوردر بعد، افتحه واضغط Alt+0 تاني");
        return;
    }

    // استخراج بيانات عامة
    const restaurantName = modal.querySelector("wk-ui-order-restaurant-name")?.textContent.trim() || "غير معروف";
    const orderNumber = modal.querySelector(".header")?.textContent.match(/#(\d+)/)?.[1] || "؟";
    const externalId = modal.querySelector(".e2e-order-external-id p")?.textContent.trim() || "؟";
    const total = modal.querySelector(".my-order-total")?.textContent.trim() || "؟";
    const payment = modal.querySelector(".payment-method-wrapper .caption")?.textContent.trim() || "؟";

    // الخصم (discount أو lifecycle)
    let discount = "";
    const discountPanel = Array.from(modal.querySelectorAll("mat-expansion-panel-header, label"))
        .find(el => /discount|lifecycle/i.test(el.textContent));
    if (discountPanel) {
        const value = discountPanel.querySelector("p")?.textContent.trim();
        if (value) discount = value;
    }

    // استخراج العناصر
    const items = Array.from(modal.querySelectorAll(".item")).map(item => {
        const name = item.querySelector(".item-name")?.textContent.trim() || "عنصر";

        // 🔹 استخراج الكمية بدقة من العنصر اللي فيه subheader
        const qtyText = item.querySelector(".item-amount .subheader")?.textContent.trim() || "1";
        const qtyMatch = qtyText.match(/(\d+)/);
        const qty = qtyMatch ? qtyMatch[1] : "1";

        const price = item.querySelector(".item-price p")?.textContent.trim()
            || item.querySelector(".item-price")?.textContent.trim() || "";

        // 🔹 استخراج الإضافات (modifiers)
        const modifiers = Array.from(item.querySelectorAll(".item-modifier")).map(mod => {
            const modName = mod.querySelector(".modifier-name")?.textContent.trim() || "";
            const modQtyText = mod.querySelector(".modifier-amount")?.textContent.trim() || "1";
            const modQtyMatch = modQtyText.match(/(\d+)/);
            const modQty = modQtyMatch ? modQtyMatch[1] : "1";
            const modPrice = mod.querySelector(".modifier-price p")?.textContent.trim() || "";
            return { modName, modQty, modPrice };
        });

        return { name, qty, price, modifiers: modifiers || [] };
    });

    // إنشاء واجهة العرض
    const popup = window.open("", "_blank", "width=500,height=700");
    if (!popup) return alert("⚠️ لم يتم فتح نافذة العرض (ربما تم حظر النوافذ المنبثقة).");

    popup.document.open();
    popup.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>تفاصيل الأوردر</title>
          <style>
            body {
              font-family: "Cairo", sans-serif;
              padding: 20px;
              background: #fafafa;
              color: #222;
            }
            h2, h3 { margin: 10px 0; }
            .info {
              background: #fff;
              border-radius: 10px;
              padding: 15px;
              box-shadow: 0 0 5px #ddd;
            }
            .item {
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .item-main {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .item:last-child { border-bottom: none; }
            .modifier {
              margin-right: 10px;
              color: #555;
              font-size: 14px;
            }
            .total {
              background: #f8f9fa;
              margin-top: 10px;
              padding: 10px;
              font-weight: bold;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #eee;
            }
            .discount {
              margin-top: 10px;
              padding: 6px;
              font-weight: bold;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #eee;
              background: #ffeaea;
              color: #b00000;
            }
            .payment {
              text-align: center;
              margin-top: 5px;
            }

          </style>
        </head>
        <body>
          <div class="info">
            <h2>${restaurantName}</h2>
            <p>🧾 رقم الأوردر: <b id="orderNumber">${orderNumber}</b></p>
            <p>🔢 الكود الخارجي: <b id="orderId">${externalId}</b></p>
            <hr>
            <h3>العناصر:</h3>
            ${items.map(i => `
              <div class="item">
                <div class="item-main">
                  <div><b>${i.qty} × ${i.name}</b></div>
                  <div><small>${i.price}</small></div>
                </div>
                ${Array.isArray(i.modifiers) && i.modifiers.length
            ? i.modifiers.map(m => `
                      <div class="modifier item-main">
                        <p>${m.modQty} × ${m.modName}</p>
                        <p>${m.modPrice}</p>
                      </div>
                    `).join("")
            : ""
        }
              </div>
            `).join("")}
            ${discount ? `<div class="discount">خصم: ${discount}</div>` : ""}
            <div class="total">${total}</div>
            <div class="payment text-center">${payment}</div>
          </div>
          <script>
            const orderCode = document.getElementById("orderNumber");
            navigator.clipboard.writeText(orderCode.textContent)
                .then(() => console.log("✅ Order number copied"))
                .catch(err => console.error("❌ Clipboard error:", err));
          </script>
        </body>
      </html>
    `);
    popup.document.close();
}
