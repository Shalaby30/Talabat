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
                    navigator.clipboard.writeText("حضور عميل فيصل")
                        .then(() => console.log("✅ Branch note copied"))
                        .catch(err => console.error("❌ Clipboard error:", err));
                }
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
