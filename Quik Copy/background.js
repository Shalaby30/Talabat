chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    if (command === "copy-order") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: copyOrderNumber
      });
    } else if (command === "copy-phone") {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: copyFormattedPhone
      });
    }
  });
});

function copyOrderNumber() {
  const orderHeader = document.querySelector('.striped-info .title-wrapper wk-ui-title .header');
  console.log('Order header element:', orderHeader);

  if (!orderHeader) {
    console.log('❌ Specific order header not found');
    return;
  }

  console.log('Order header text:', orderHeader.textContent);

  const match = orderHeader.textContent.match(/#\d+/);
  if (!match) {
    console.log('❌ No order number found in that header');
    return;
  }

  const orderNumber = match[0];
  navigator.clipboard.writeText(orderNumber).then(() => {
    console.log(`✅ Order number copied: ${orderNumber}`);
  }).catch(err => {
    console.error('❌ Failed to copy:', err);
  });
}

function copyFormattedPhone() {
  const phoneElement = document.querySelector('.striped-info .external-id-wrapper p.medium');
  if (!phoneElement) {
    console.log('❌ Phone number element not found');
    return;
  }

  const phoneNumber = phoneElement.textContent; // no trim or replace

  navigator.clipboard.writeText(phoneNumber).then(() => {
    console.log(`✅ Phone number copied: ${phoneNumber}`);
  }).catch(err => {
    console.error('❌ Failed to copy phone number:', err);
  });
}

