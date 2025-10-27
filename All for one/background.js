// =========================
// background.js
// Handles keyboard shortcuts
// =========================


chrome.commands.onCommand.addListener((command) => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        const tabId = tabs[0].id;

   
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


        if (action) {
            chrome.tabs.sendMessage(tabId, { action });
        }
    });
});


