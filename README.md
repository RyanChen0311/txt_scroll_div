# txt_scroll_div — TXT Document Reader

> A browser-based `.txt` reader that splits any text file into pages by word count, with smooth scrolling, keyboard navigation, and real-time word counting.

---

## Live Demo

👉 https://ryanche n0311.github.io/txt_scroll_div/

---

## Features

- **File loading** — drag & drop or click to open any `.txt` file
- **Smart pagination** — splits at paragraph → sentence → word boundaries
- **Configurable page size** — 100 to 2,000 words per page
- **Navigation** — Prev / Next buttons, jump-to-page input, arrow key support
- **Word count badge** — each page shows its exact word count
- **Success toast** — confirms file name on load
- **Responsive** — works on desktop and mobile

---

## How Pagination Works

```
Input text
    │
    ├─ Split by paragraph (\n\n)
    │       │
    │       ├─ Paragraph fits in page?  → append to current page
    │       │
    │       └─ Paragraph too large?
    │               │
    │               └─ Split by sentence (。！？.!?)
    │                       │
    │                       └─ Still too large? → hard split at word limit
    │
    └─ Flush page when word count would exceed limit
```

### Word counting

| Token type | Count |
|---|---|
| Chinese character (一字) | 1 |
| English word | 1 |
| Number token | 1 |
| Punctuation | 0 |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `←` / `↑` | Previous page |
| `→` / `↓` | Next page |
| `Enter` (in jump input) | Jump to page |

---

## Project Structure

```
txt_scroll_div/
├── index.html    # HTML structure
├── styles.css    # Layout, page windows, responsive design
└── script.js     # Pagination logic, navigation, file reading
```

---

## Running Locally

```bash
# Any static file server works
npx serve .
# open http://localhost:3000
```

> No build step, no dependencies — pure HTML / CSS / JS.

---

## License

MIT — see [LICENSE](LICENSE).
