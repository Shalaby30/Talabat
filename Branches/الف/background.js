// =========================
// Background script
// Handles keyboard shortcuts
// =========================

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        const tabId = tabs[0].id;

        if (command === "copy-order") {
            chrome.scripting.executeScript({
                target: { tabId },
                function: bh_copyOrderNumber
            });
        } else if (command === "copy-phone") {
            chrome.scripting.executeScript({
                target: { tabId },
                function: bh_copyFormattedPhone
            });
        } else if (command === "bransh-copy") {
            chrome.scripting.executeScript({
                target: { tabId },
                function: () => {
                    navigator.clipboard.writeText("حضورعميل-الف")
                        .then(() => console.log("✅ Branch note copied"))
                        .catch(err => console.error("❌ Clipboard error:", err));
                }
            });
        }  else if (command === "copy-payment") {
            chrome.scripting.executeScript({
                target: { tabId },
                function: bh_copyPaymentMethod
            });
        }
    });
   
});

// ========== Functions for background ==========

function bh_copyOrderNumber() {
    const orderHeader = document.querySelector('.striped-info .title-wrapper wk-ui-title .header');
    if (!orderHeader) {
        console.log('❌ Order header not found');
        return;
    }

    const match = orderHeader.textContent.match(/#\d+/);
    if (!match) {
        console.log('❌ Order number not found in header');
        return;
    }

    const orderNumber = match[0];
    navigator.clipboard.writeText(orderNumber)
        .then(() => console.log(`✅ Order number copied: ${orderNumber}`))
        .catch(err => console.error('❌ Clipboard error:', err));
}

function bh_copyFormattedPhone() {
    const phoneElement = document.querySelector('.striped-info .external-id-wrapper p.medium');
    if (!phoneElement) {
        console.log('❌ Phone element not found');
        return;
    }

    const phoneNumber = phoneElement.textContent;
    navigator.clipboard.writeText(phoneNumber)
        .then(() => console.log(`✅ Phone number copied: ${phoneNumber}`))
        .catch(err => console.error('❌ Clipboard error:', err));
}
// ========== New function for Payment ==========
function bh_copyPaymentMethod() {
    let payment = "";

    // 1- نجيب وسيلة الدفع
    const captions = document.querySelectorAll("wk-ui-caption .caption");

    captions.forEach(span => {
        const text = span.textContent.trim();

        if (/CASH/i.test(text)) {
            payment = "كاش";
        } else if (text.includes("الدفع عبر")) {
            payment = "فيزا";
        }
    });

    if (!payment) {
        console.log("❌ Payment method not found");
        return;
    }

    // 2- 
    let discountText = "";
    const discountHeader = Array.from(document.querySelectorAll("mat-expansion-panel-header"))
        .find(header => {
            const label = header.querySelector("label");
            return label && label.textContent.trim().toLowerCase() === "discount";
        });

    if (discountHeader) {
        const priceElement = discountHeader.querySelector("p.medium");
        if (priceElement) {
            let rawText = priceElement.textContent.trim();
            // 
            let cleanNumber = rawText.replace(/[^\d.]/g, "");
            if (cleanNumber) {
                discountText = ` + خصم ${cleanNumber} ج`;
            }
        }
    }

    const phoneElement = document.querySelector('.striped-info .external-id-wrapper p.medium');
    if (!phoneElement) {
        console.log('❌ Phone element not found');
        return;
    }

    const phoneNumber = phoneElement.textContent;


    // 3- 
    const finalText = payment + discountText +" // " + phoneNumber ;

    navigator.clipboard.writeText(finalText)
        .then(() => console.log(`✅ Payment copied: ${finalText}`))
        .catch(err => console.error("❌ Clipboard error:", err));
}