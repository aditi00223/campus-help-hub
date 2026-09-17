# 🎓 Campus Help Hub

> A lightweight, responsive, and beginner-friendly web application designed for college students to find and request peer-to-peer academic help.

---

## 📁 Project Structure

```
campus-help-hub/
├── index.html     # Semantic HTML5 markup, forms, filter controls & layout
├── style.css      # Pure CSS3 styling, responsive grid & modern design tokens
├── script.js      # Client-side JavaScript handling state, filters, DOM & stats
└── README.md      # Documentation and hackathon presentation guide
```

---

## 🚀 How to Run the Project

1. **Zero installation, build steps, or server needed!**
2. Open the project folder:
   `C:\Users\aditi\.gemini\antigravity\scratch\campus-help-hub\`
3. Double-click **`index.html`** to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari.
4. *(Optional)* If using VS Code, right-click `index.html` and choose **"Open with Live Server"**.

---

## 💡 Key Features & Prototype Architecture

### 1. In-Memory Data Storage (`script.js`)
- All requests are stored in a JavaScript array (`helpRequests`).
- Pre-populated with 4 realistic college requests across different categories, priorities, and statuses for instant demo readiness.
- Object schema:
  - `id`: Unique identifier (`req-<timestamp>`)
  - `studentName`: Student's name
  - `subject`: Academic subject/topic
  - `category`: `Notes`, `Doubt`, `Study Partner`, or `Other`
  - `priority`: `Normal` or `Urgent`
  - `description`: Detailed explanation of help needed
  - `createdAt`: Timestamp string
  - `isResolved`: Boolean resolution status (`true` / `false`)

### 2. Request Priority (Normal vs. Urgent)
- The form includes a **Priority** dropdown (`Normal` / `Urgent`).
- Every card displays a priority tag (`Normal` or `⚡ Urgent`).
- Urgent requests feature a distinct red top border accent (`border-top: 3px solid #ef4444`) and soft red badge glow, catching attention while fitting the clean campus aesthetic.

### 3. Combined Filtering Pipeline (Search + Category + Status)
Students can seamlessly combine:
- **Search Query**: Real-time matching against `subject` (case-insensitive).
- **Category Dropdown**: Filter by `All Categories`, `Notes`, `Doubt`, `Study Partner`, or `Other`.
- **Status Dropdown**: Filter by `All Statuses`, `Active` (`!isResolved`), or `Resolved` (`isResolved`).
- If no requests match, a friendly **"No help requests found"** empty state appears with a **"Reset Filters"** button.

### 4. Live Community Statistics Counters
Three live badges near the heading continuously calculate and display:
- 📊 **Total**: Total number of help requests posted.
- ⚡ **Active**: Unresolved requests currently waiting for assistance (`total - resolved`).
- 🟢 **Resolved**: Requests marked as completed.
- Counters automatically update whenever requests are added, resolved, or deleted.

### 5. Resolve Request Functionality
- Clicking **✓ Resolve**:
  - Sets `isResolved = true` in memory.
  - Updates the card with an emerald green accent border (`border-left: 4px solid #16a34a`) and soft background tint.
  - Adds a `✓ Resolved` badge.
  - Disables the button to prevent duplicate submissions while keeping the card visible.
  - Automatically updates the Active and Resolved counters.

### 6. Delete Functionality
- Clicking 🗑️ **Delete** removes only that specific card by its unique ID.
- Automatically updates counters and refreshes the current filtered view.

### 7. Form Validation & UX
- Validates that Student Name, Subject, Category, and Description are non-empty after trimming.
- Displays inline red error messages and highlights invalid inputs.
- Automatically clears errors as soon as the student types.

### 8. Fully Responsive Design (`style.css`)
- **Desktop (900px+)**: Two-column layout with a sticky form on the left and a filterable feed on the right.
- **Tablets & Mobile (<900px, <600px)**: Gracefully collapses into a single column with flexible search and filter controls.

---

## 🎤 Hackathon Presentation Cheatsheet

1. **Clean Separation of Concerns**:
   - `index.html`: Accessible structure & form controls.
   - `style.css`: Pure modern CSS (Flexbox, CSS Grid, custom properties, responsive breakpoints).
   - `script.js`: State-driven architecture (`State -> applyFilters() -> renderRequests() & updateCounters()`).
2. **Filtering Formula**:
   `matchesSearch && matchesCategory && matchesStatus` — easily explained in 30 seconds to any judge!
3. **Enterprise Best Practices**:
   - HTML escaping (`escapeHTML`) to prevent XSS.
   - Accessible ARIA labels and live regions (`aria-live="polite"`).
