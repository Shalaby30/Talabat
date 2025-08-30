console.log("🚀 Branch Monitor Loaded");

function playSound() {
    const audio = new Audio(chrome.runtime.getURL("alert.mp3"));
    audio.play();
}

function notify(title, msg) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: msg });
    }
}

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

const tbody = document.querySelector(".va-MuiTableBody-root");

if (tbody) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches("tr")) {
                    const branchName = node.querySelector("td:nth-child(2) p")?.textContent?.trim() || "فرع غير معروف";
                    console.log(`🔴 ${branchName} اتقفل و اتضاف للجدول`);

                    playSound();
                    notify("🚨 فرع اتقفل", `${branchName}`);
                }
            });
        });
    });
    observer.observe(tbody, { childList: true });
    console.log("👀 مراقبة بدأت على جدول الفروع المقفولة");
} else {
    console.warn("⚠️ مفيش tbody بكلاس va-MuiTableBody-root في الصفحة");
}
