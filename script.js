const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const runBtn = document.getElementById("runBtn");
const downloadBtn = document.getElementById("downloadBtn");
const lineNumbers = document.getElementById("lineNumbers");
const highlightingContent = document.getElementById("highlighting-content");

// 1. UPDATED DOWNLOAD LOGIC
downloadBtn.addEventListener("click", () => {
  const code = editor.value;
  // Create a blob (a virtual file) from the textarea text
  const blob = new Blob([code], { type: "text/html" });
  
  // Create a temporary hidden link to "click" it automatically
  const tempLink = document.createElement("a");
  tempLink.href = URL.createObjectURL(blob);
  tempLink.download = "index.html"; // The name of the file to be saved
  
  // Trigger the download and clean up
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(tempLink.href);
});

// 2. UPDATED LINE NUMBERS & HIGHLIGHT SYNC
function updateAll() {
  const content = editor.value;

  // Update Highlight Layer (Prism)
  if (highlightingContent) {
    // Add a space at the end to prevent the "jumping" cursor bug
    highlightingContent.textContent = content + (content.endsWith("\n") ? " " : "");
    if (window.Prism) Prism.highlightElement(highlightingContent);
  }

  // Update Line Numbers
  const lines = content.split("\n").length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
}

// 3. SYNC SCROLLING (Crucial for alignment)
editor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editor.scrollTop;
  const highlighting = document.getElementById("highlighting");
  if (highlighting) {
    highlighting.scrollTop = editor.scrollTop;
    highlighting.scrollLeft = editor.scrollLeft;
  }
});

/* Event Listeners */
editor.addEventListener("input", updateAll);
runBtn.addEventListener("click", () => { preview.srcdoc = editor.value; });

/* Initial Load */
updateAll();
preview.srcdoc = editor.value;