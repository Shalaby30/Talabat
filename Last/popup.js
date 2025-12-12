
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('buttons-container');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      container.textContent = "لا يوجد تبويب نشط.";
      return;
    }

    // Get the DATA object from content.js in the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.DATA ? window.DATA : {})
    });

    if (!results || !results[0] || !results[0].result) {
      container.textContent = "لم أتمكن من قراءة DATA من الصفحة. تأكد أن content.js محمّل.";
      return;
    }

    const DATA = results[0].result;
    const dataKeys = Object.keys(DATA);

    if (dataKeys.length === 0) {
      container.textContent = "لا توجد مجموعات في DATA.";
      return;
    }

    // Create a button for each data key
    dataKeys.forEach(key => {
      const button = document.createElement('button');
      button.textContent = key;
      button.className = 'btn';

      button.addEventListener('click', async () => {
        // execute startAutoDisable in the page context with the selected key
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (dataKey) => {
              if (typeof window.startAutoDisable === 'function') {
                window.startAutoDisable(dataKey);
              } else {
                console.error("startAutoDisable غير موجود في الصفحة");
              }
            },
            args: [key]
          });
        } catch (err) {
          console.error("فشل استدعاء startAutoDisable:", err);
        }
      });

      container.appendChild(button);
    });

  } catch (err) {
    console.error(err);
    container.textContent = "حدث خطأ أثناء التحميل.";
  }
});