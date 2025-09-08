console.log("🚀 Branch Monitor Loaded");

// دالة إرسال النوتفكيشن
function playSound() {
    const audio = new Audio(chrome.runtime.getURL("alert.mp3"));
    audio.play();
}
function notify(title, msg) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: msg,
      icon: "https://www.talabat.com/assets/images/Tlogo-500.png", // أيقونة اختيارية
    });
  } else {
    console.log("🔕 Notification not allowed");
  }
}

// نطلب إذن النوتفكيشن (مرة واحدة فقط)
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// نعمل فحص دوري لحد ما نلاقي tbody المطلوب
const checkInterval = setInterval(() => {
  const tbody = document.querySelector(".va-MuiTableBody-root");

  if (tbody) {
    clearInterval(checkInterval);
    console.log("🎯 لقيت .va-MuiTableBody-root ... هبتدي أراقب");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches("tr")) {
            console.log("🆕 صف جديد اتضاف في الجدول");
            
            // استخراج اسم الفرع والحالة مثلًا
            const branchName = node.querySelector("td:nth-child(2) p")?.textContent?.trim();
            const status = node.querySelector("td:nth-child(3) div div:nth-child(2) > div:first-child")?.textContent?.trim();

            console.log("📌 الفرع:", branchName);
            console.log("📌 الحالة:", status);
		  playSound();
            // إرسال إشعار
            notify(` فرع قفل ${branchName || "غير معروف"}`);
          }
        });
      });
    });

    observer.observe(tbody, {
      childList: true,
      subtree: true,
    });

    console.log("👁️‍🗨️ بدأ المراقبة...");
  } else {
    console.log("⏳ في انتظار ظهور tbody...");
  }
}, 1000);
