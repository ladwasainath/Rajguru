# Scooboo-style Header Demo

A lightweight HTML/CSS/JS demo that recreates a header similar to your screenshot. This template intentionally omits the following nav items per your request:
- Scooboo Luxe
- Popular on Reels
- Clearance

Files created:
- `index.html` — main page with header, navigation, and hero text
- `styles.css` — styling and responsive rules
- `script.js` — small JS for mobile menu, categories toggle, and search

How to view (Windows PowerShell):

```powershell
# Open the page in your default browser from the project folder
Start-Process "index.html"
```

Notes & design decisions:
- No external dependencies (icons use emoji and inline SVG) to keep things simple.
- Responsive breakpoint at 720px (nav collapses to a hamburger menu).
- Categories panel is a simple toggle for accessibility; for production you'd replace it with a proper listbox and keyboard trapping.

Next steps you might want:
- Add real icons (SVG sprite or icon font) and fonts.
- Implement a real search results page/back-end integration.
- Expand accessibility support (focus trap for mobile menu, keyboard navigation for nav and categories).

Image note:
- The header expects a file named `rajguru.png` in the project root. Replace this placeholder with your actual logo/image. If you prefer a different filename, update the `src` attribute in `index.html` accordingly.
