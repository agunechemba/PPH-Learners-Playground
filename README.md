# PPH Learners Playground

**PPH Learners Playground** (codenamed *PepeCode*) is a lightweight, high-performance, and entirely offline web-based code editor. This project was developed specifically for the students and learners at **Pepe Programmers Hub** to provide a stable, zero-latency environment for mastering web development.

## 🚀 Purpose

The Playground is designed to remove the barriers of internet connectivity. It allows **Pepe Programmers Hub** learners to write, debug, and preview HTML, CSS, and JavaScript instantly, ensuring the learning process never stops, even without a data connection.

## ✨ Features

* **Live Preview:** Instant execution of code in a side-by-side preview pane.
* **Smart Highlighting:** Integrated with a local **Prism.js** engine for industry-standard syntax coloring.
* **Synchronized Line Numbers:** A custom-built gutter that stays perfectly aligned with your code.
* **Offline Reliability:** Zero external dependencies; no CDNs or internet required.
* **Indentation Support:** Enhanced textarea logic to support `Tab` key indents.
* **Project Export:** A fixed "Download" feature that allows learners to save their Playground sessions as standalone `.html` files.
* **Slim Light Theme:** Optimized for long coding sessions with a clean, high-contrast light interface.

## 📂 Project Structure

For the Playground to function offline, ensure these files are kept in the same directory:

```text
/PPH-Learners-Playground
├── index.html      # The UI structure
├── style.css       # Layout and Light Theme styles
├── script.js       # Editor logic and file export system
├── prism.css       # Local syntax highlighting styles
└── prism.js        # Local syntax highlighting engine

```

## 🛠️ How to Use

1. **Open:** Double-click `index.html` to launch the Playground in your browser.
2. **Code:** Write your HTML, CSS, or JS in the editor pane.
3. **Run:** Click the **▶ Run** button to refresh the preview.
4. **Save:** Click the **⬇ Download** button to export your work locally.

## 🧠 Technical Overview: The Layering System

To achieve syntax highlighting in an editable area, PPH Learners Playground uses a "Sandwich" architecture:

* **Top Layer:** A transparent `textarea` that captures user input and handles caret movement.
* **Bottom Layer:** A `<pre>` tag that renders the Prism-highlighted version of that same text.
* **The Sync Engine:** A JavaScript event loop that matches the scroll position and line-height (fixed at `21px`) between the input, the highlight, and the line numbers.

## 🎓 Credits

Developed for **Pepe Programmers Hub** learners.
Maintained by **Agunechemba Ekene**.

---

*Happy Coding at PPH!*
