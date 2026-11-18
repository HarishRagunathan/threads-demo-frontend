// Print only the chosen document. Hidden application layout must never paginate.
let selected = null;
let pageStyle = null;

export function preparePrint(
  element,
  { paper = "A4", title = document.title } = {},
) {
  if (!element) throw new Error("There is no document to print yet.");
  document.getElementById("print-root")?.remove();
  pageStyle?.remove();
  const root = document.createElement("div");
  root.id = "print-root";
  root.dataset.paper = paper;
  root.setAttribute("aria-hidden", "true");
  root.append(element.cloneNode(true));
  document.body.append(root);
  document.body.dataset.printing = "true";
  pageStyle = document.createElement("style");
  // Thermal receipts paginate on 80 mm paper; PDF downloads use an exact roll length.
  pageStyle.textContent = `@page { size: ${paper === "80mm" ? "80mm 297mm" : "A4"}; margin: ${paper === "80mm" ? "3mm" : "12mm"}; }`;
  document.head.append(pageStyle);
  selected = { element, paper, title, previousTitle: document.title };
  document.title = title;
  return root;
}

export function clearPrint() {
  if (selected) document.title = selected.previousTitle;
  document.getElementById("print-root")?.remove();
  delete document.body.dataset.printing;
  pageStyle?.remove();
  selected = null;
  pageStyle = null;
}

export function printElement(element, options) {
  preparePrint(element, options);
  window.print();
}

export function installPrintHandlers() {
  const before = () => {
    if (selected && document.getElementById("print-root")) return;
    const elements = document.querySelectorAll("#root .print-area");
    const element = elements[elements.length - 1];
    if (element)
      preparePrint(element, {
        paper: element.classList.contains("thermal") ? "80mm" : "A4",
      });
  };
  window.addEventListener("beforeprint", before);
  window.addEventListener("afterprint", clearPrint);
  return () => {
    window.removeEventListener("beforeprint", before);
    window.removeEventListener("afterprint", clearPrint);
    clearPrint();
  };
}
