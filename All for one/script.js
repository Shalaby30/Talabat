(function () {
  // رقم الأوردر
  let orderNumber = document.querySelector(".header")?.innerText || "N/A";

  // المنتجات
  let items = [];
  document.querySelectorAll("wk-order-items .item").forEach(item => {
    let qty = item.querySelector(".item-amount .subheader")?.innerText.trim() || "1x";
    let name = item.querySelector(".item-name p")?.innerText.trim() || "";
    let price = item.querySelector(".item-price p")?.innerText.trim() || "";
    if (name && price) {
      items.push({ qty, name, price });
    }
  });

  if (items.length > 0) {
    let popup = window.open("", "orderPopup", "width=600,height=700,scrollbars=yes");

    let rows = items.map(it => `
      <tr>
        <td style="padding:8px; text-align:center;">${it.qty}</td>
        <td style="padding:8px;">${it.name}</td>
        <td style="padding:8px; text-align:end; white-space:nowrap;">${it.price}</td>
      </tr>
    `).join("");

    popup.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>تفاصيل الأوردر</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background:#f5f5f5; padding:20px; }
            .card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
            h2 { text-align:center; color:#ff5a00; margin-bottom:20px; }
            .order-info { margin-bottom:20px; text-align:center; font-size:18px; font-weight:bold; color:#222; }
            table { width:100%; border-collapse:collapse; }
            th { background:#ff5a00; color:#fff; padding:10px; text-align:center; }
            td { border-bottom:1px solid #eee; font-size:16px; }
            tr:hover { background:#fafafa; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="order-info">رقم الأوردر: ${orderNumber}</div>
            
            <table>
              <thead>
                <tr>
                  <th>الكمية</th>
                  <th>المنتج</th>
                  <th>السعر</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);

    popup.document.close();
  } else {
    alert("❌ مفيش منتجات ظاهرة دلوقتي!");
  }
})();
