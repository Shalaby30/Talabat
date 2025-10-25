// =========================
// background.js
// Handles keyboard shortcuts
// =========================

// Listener للاختصارات (commands)
chrome.commands.onCommand.addListener((command) => {
    // نجيب التاب النشط
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        const tabId = tabs[0].id;

        // تحديد نوع الإجراء حسب الأمر
        let action = "";

        if (command === "copy-order") {
            action = "copyOrder";
        } else if (command === "copy-phone") {
            action = "copyPhone";
        } else if (command === "copy-payment") {
            action = "copyPayment";
        } else if (command === "bransh-copy") {
            action = "copyBranch";
        }

        // نرسل الرسالة للـ content script ليقوم بالنسخ وعرض التوست
        if (action) {
            chrome.tabs.sendMessage(tabId, { action });
        }
    });
});
