function addStyleToDiscountHeader() {
    const headers = document.querySelectorAll("mat-expansion-panel-header");

    headers.forEach(header => {
        const label = header.querySelector("label");
        if (label && label.textContent.trim().toLowerCase() === "discount") {
            header.setAttribute(
                "style",
                "background-color:red; border-radius:6px;"
            );
        }
    });
}

addStyleToDiscountHeader();

const observer = new MutationObserver(addStyleToDiscountHeader);
observer.observe(document.body, { childList: true, subtree: true });


