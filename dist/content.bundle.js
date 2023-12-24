/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
// Function to check if the page is an article
function isArticle() {
  // Example heuristic: check for a large amount of text
  return true;
}

// Function to create and insert the summary panel
function createSummaryPanel() {
  const panel = document.createElement("div");
  panel.id = "summary-panel";
  panel.style.cssText = `
        position: fixed; 
        top: 0; 
        right: -450px; /* Start off-screen */
        width: 450px; 
        height: 100vh; 
        background-color: white; 
        box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.25); 
        overflow-y: auto; 
        transition: right 0.3s ease-in-out;
        z-index: 10000;
    `;

  document.body.appendChild(panel);
  return panel;
}

// Function to toggle the summary panel
function toggleSummaryPanel() {
  const panel =
    document.getElementById("summary-panel") || createSummaryPanel();
  if (panel.style.right === "0px") {
    panel.style.right = "-450px"; // Hide
  } else {
    panel.style.right = "0px"; // Show
  }
}

// Function to create and insert the icon
function insertButton() {
  const buttonHtml = `<button id="summary-button-12-23">Summarize</button>`;

  const container = document.createElement("div");
  container.innerHTML = buttonHtml;
  const button = container.firstChild;

  button.onclick = function () {
    toggleSummaryPanel();
  };

  document.body.appendChild(button);
}

// Run the script
if (isArticle()) {
  insertButton();
}

// // Modify button's onclick event to toggle the panel
// button.onclick = function () {
//   toggleSummaryPanel();
// };

/******/ })()
;
//# sourceMappingURL=content.bundle.js.map