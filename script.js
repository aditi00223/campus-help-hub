/**
 * Campus Help Hub - Client-Side JavaScript
 * 
 * Overview:
 * This script handles all interactive behavior for the Campus Help Hub web app:
 * 1. State Management: In-memory array of help requests (no backend or database).
 * 2. Form Handling: Input validation, priority handling, and adding new requests.
 * 3. Dynamic Rendering: Generates cards with category badges, priority tags, and resolution states.
 * 4. Combined Filtering: Real-time search by subject + category dropdown + status dropdown.
 * 5. Request Counters: Live calculation of Total, Active, and Resolved requests.
 * 6. Resolution & Deletion: Individual actions with immediate state and UI sync.
 * 
 * Hackathon Presentation Tip:
 * Highlights clean architectural patterns:
 * State (Data) -> Combined Filter Pipeline -> DOM Rendering & Live Statistics.
 */

// =============================================================================
// 1. APPLICATION STATE (Browser Memory)
// =============================================================================

/**
 * In-memory array storing all help request objects.
 * Seeded with 4 varied college student requests so all categories,
 * priorities (Normal/Urgent), and statuses (Active/Resolved) can be demonstrated immediately!
 */
let helpRequests = [
  {
    id: "req-1",
    studentName: "Priya Sharma",
    subject: "Data Structures & Algorithms",
    category: "Doubt",
    priority: "Urgent",
    description: "Struggling with Red-Black tree rotations and balancing rules. Looking for someone who can explain it intuitively over coffee or a quick Google Meet!",
    createdAt: "10 mins ago",
    isResolved: false
  },
  {
    id: "req-2",
    studentName: "Alex Chen",
    subject: "Organic Chemistry",
    category: "Notes",
    priority: "Normal",
    description: "Missed Tuesday's lecture on aromatic reaction mechanisms due to illness. Would really appreciate someone sharing their handwritten lecture notes!",
    createdAt: "1 hour ago",
    isResolved: false
  },
  {
    id: "req-3",
    studentName: "Samira Khan",
    subject: "Linear Algebra",
    category: "Study Partner",
    priority: "Urgent",
    description: "Preparing for the midterm next week on Eigenvalues and Eigenvectors. Looking for a study buddy to solve practice problem sets together at the library.",
    createdAt: "3 hours ago",
    isResolved: true
  },
  {
    id: "req-4",
    studentName: "David Patel",
    subject: "Microeconomics",
    category: "Other",
    priority: "Normal",
    description: "Need help setting up monopoly profit-maximization equations for assignment 3. Can trade Python tips in exchange!",
    createdAt: "5 hours ago",
    isResolved: false
  }
];

// =============================================================================
// 2. DOM ELEMENT REFERENCES
// =============================================================================

// Form & Input elements
const helpRequestForm = document.getElementById("helpRequestForm");
const studentNameInput = document.getElementById("studentName");
const subjectInput = document.getElementById("subject");
const categorySelect = document.getElementById("category");
const prioritySelect = document.getElementById("priority");
const descriptionInput = document.getElementById("description");

// Error message elements
const nameError = document.getElementById("nameError");
const subjectError = document.getElementById("subjectError");
const categoryError = document.getElementById("categoryError");
const descriptionError = document.getElementById("descriptionError");

// Counters elements
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const resolvedCount = document.getElementById("resolvedCount");

// Search & Filter elements
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

// Feed & Empty state elements
const requestsContainer = document.getElementById("requestsContainer");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");

// =============================================================================
// 3. UTILITY / HELPER FUNCTIONS
// =============================================================================

/**
 * Generates initials from a student's full name (e.g., "Priya Sharma" -> "PS").
 */
function getInitials(name) {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns the CSS modifier class for each category pill.
 */
function getCategoryBadgeClass(category) {
  switch (category) {
    case "Notes":
      return "badge-notes";
    case "Doubt":
      return "badge-doubt";
    case "Study Partner":
      return "badge-study-partner";
    default:
      return "badge-other";
  }
}

/**
 * Returns the CSS modifier class for the priority badge.
 */
function getPriorityBadgeClass(priority) {
  return priority === "Urgent" ? "badge-priority-urgent" : "badge-priority-normal";
}

/**
 * Safely escapes HTML special characters to prevent Cross-Site Scripting (XSS).
 */
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =============================================================================
// 4. REQUEST COUNTERS
// =============================================================================

/**
 * Recalculates and updates the Total, Active, and Resolved counters.
 * Called whenever a request is added, resolved, or deleted.
 */
function updateCounters() {
  const total = helpRequests.length;
  const resolved = helpRequests.filter(req => req.isResolved).length;
  const active = total - resolved;

  if (totalCount) totalCount.textContent = total;
  if (activeCount) activeCount.textContent = active;
  if (resolvedCount) resolvedCount.textContent = resolved;
}

// =============================================================================
// 5. RENDERING FUNCTIONS
// =============================================================================

/**
 * Renders an array of request objects as HTML cards into the container.
 * @param {Array} list - The list of requests to display
 */
function renderRequests(list) {
  // Clear previous cards
  requestsContainer.innerHTML = "";

  // Handle empty state
  if (list.length === 0) {
    emptyState.classList.remove("hidden");
    const hasSearch = searchInput.value.trim().length > 0;
    const hasCategory = categoryFilter.value !== "All";
    const hasStatus = statusFilter.value !== "All";

    emptyTitle.textContent = "No help requests found";

    if (hasSearch || hasCategory || hasStatus) {
      emptyMessage.textContent = "No requests match your current search and filter combination. Try adjusting or resetting your filters.";
      if (resetFiltersBtn) resetFiltersBtn.style.display = "inline-flex";
    } else {
      emptyMessage.textContent = "There are no requests in the hub yet. Be the first to ask for help using the form on the left!";
      if (resetFiltersBtn) resetFiltersBtn.style.display = "none";
    }
    return;
  }

  // Hide empty state if there are items to show
  emptyState.classList.add("hidden");

  // Create and append a card for each request
  list.forEach((request) => {
    const card = document.createElement("article");
    
    // Determine card classes: add .resolved and .urgent if applicable
    const isUrgent = request.priority === "Urgent";
    const isResolved = Boolean(request.isResolved);
    
    let cardClasses = ["request-card"];
    if (isResolved) {
      cardClasses.push("resolved");
    } else if (isUrgent) {
      cardClasses.push("urgent");
    }
    card.className = cardClasses.join(" ");
    card.setAttribute("data-id", request.id);

    const safeName = escapeHTML(request.studentName);
    const safeSubject = escapeHTML(request.subject);
    const safeCategory = escapeHTML(request.category);
    const safePriority = escapeHTML(request.priority || "Normal");
    const safeDescription = escapeHTML(request.description);
    const badgeClass = getCategoryBadgeClass(request.category);
    const priorityClass = getPriorityBadgeClass(request.priority);
    const initials = getInitials(request.studentName);

    // Priority badge label with icon
    const priorityLabel = isUrgent ? "⚡ Urgent" : "Normal";

    // Resolved status badge
    const resolvedBadgeHTML = isResolved
      ? `<span class="badge badge-resolved" title="This request is marked as resolved">✓ Resolved</span>`
      : "";

    // Resolve button: disabled with clear visual feedback if already resolved
    const resolveButtonHTML = isResolved
      ? `<button 
          type="button" 
          class="btn-resolve btn-resolved" 
          disabled 
          aria-disabled="true" 
          title="This request is already resolved"
        >
          <span aria-hidden="true">✓</span> Resolved
        </button>`
      : `<button 
          type="button" 
          class="btn-resolve" 
          onclick="handleResolveRequest('${request.id}')" 
          title="Mark this request as resolved" 
          aria-label="Mark request by ${safeName} as resolved"
        >
          <span aria-hidden="true">✓</span> Resolve
        </button>`;

    card.innerHTML = `
      <div class="card-top">
        <div class="student-meta">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div>
            <div class="student-name">${safeName}</div>
            <div class="timestamp">${request.createdAt || "Just now"}</div>
          </div>
        </div>
        <div class="card-badges">
          <span class="badge ${badgeClass}">${safeCategory}</span>
          <span class="badge ${priorityClass}">${priorityLabel}</span>
          ${resolvedBadgeHTML}
        </div>
      </div>

      <div class="card-subject">
        <span class="subject-icon" aria-hidden="true">📖</span>
        <span>${safeSubject}</span>
      </div>

      <p class="card-body">${safeDescription}</p>

      <div class="card-footer">
        ${resolveButtonHTML}
        <button 
          type="button" 
          class="btn-delete" 
          onclick="handleDeleteRequest('${request.id}')"
          title="Delete this request"
          aria-label="Delete request by ${safeName}"
        >
          <span aria-hidden="true">🗑️</span> Delete
        </button>
      </div>
    `;

    requestsContainer.appendChild(card);
  });
}

// =============================================================================
// 6. COMBINED FILTERING PIPELINE (Search + Category + Status)
// =============================================================================

/**
 * Evaluates all filter controls together:
 * 1. Search keyword (matches subject/topic)
 * 2. Category dropdown (All or specific category)
 * 3. Status dropdown (All, Active, or Resolved)
 */
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter.value;

  // Toggle clear search button visibility
  if (query.length > 0) {
    clearSearchBtn.style.display = "flex";
  } else {
    clearSearchBtn.style.display = "none";
  }

  // Filter the requests array against all 3 criteria simultaneously
  const filtered = helpRequests.filter(req => {
    // 1. Subject search check
    const matchesSearch = !query || req.subject.toLowerCase().includes(query);

    // 2. Category check
    const matchesCategory = selectedCategory === "All" || req.category === selectedCategory;

    // 3. Status check
    let matchesStatus = true;
    if (selectedStatus === "Active") {
      matchesStatus = !req.isResolved;
    } else if (selectedStatus === "Resolved") {
      matchesStatus = Boolean(req.isResolved);
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Render the filtered subset
  renderRequests(filtered);
}

/**
 * Resets all filter controls back to their default values and refreshes the view.
 */
function resetAllFilters() {
  searchInput.value = "";
  categoryFilter.value = "All";
  statusFilter.value = "All";
  clearSearchBtn.style.display = "none";
  applyFilters();
}

// =============================================================================
// 7. FORM HANDLING & VALIDATION
// =============================================================================

/**
 * Clears all error messages and red borders from the form.
 */
function clearValidationErrors() {
  nameError.textContent = "";
  subjectError.textContent = "";
  categoryError.textContent = "";
  descriptionError.textContent = "";

  studentNameInput.classList.remove("input-error");
  subjectInput.classList.remove("input-error");
  categorySelect.classList.remove("input-error");
  descriptionInput.classList.remove("input-error");
}

/**
 * Validates all form inputs.
 * Returns true if all required fields are valid, false otherwise.
 */
function validateForm(name, subject, category, description) {
  let isValid = true;
  clearValidationErrors();

  if (!name) {
    nameError.textContent = "Please enter your name.";
    studentNameInput.classList.add("input-error");
    isValid = false;
  }

  if (!subject) {
    subjectError.textContent = "Please enter a subject or topic.";
    subjectInput.classList.add("input-error");
    isValid = false;
  }

  if (!category) {
    categoryError.textContent = "Please select a category.";
    categorySelect.classList.add("input-error");
    isValid = false;
  }

  if (!description) {
    descriptionError.textContent = "Please describe the help you need.";
    descriptionInput.classList.add("input-error");
    isValid = false;
  } else if (description.length < 5) {
    descriptionError.textContent = "Description must be at least 5 characters.";
    descriptionInput.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

/**
 * Handles form submission: validates, creates new request with priority, updates UI.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const name = studentNameInput.value.trim();
  const subject = subjectInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect ? prioritySelect.value : "Normal";
  const description = descriptionInput.value.trim();

  // Validate form fields
  if (!validateForm(name, subject, category, description)) {
    return;
  }

  // Create a new request object
  const newRequest = {
    id: "req-" + Date.now(), // Unique ID based on current timestamp
    studentName: name,
    subject: subject,
    category: category,
    priority: priority || "Normal",
    description: description,
    createdAt: "Just now",
    isResolved: false
  };

  // Add the new request to the top of the array
  helpRequests.unshift(newRequest);

  // Reset form inputs and clear validation states
  helpRequestForm.reset();
  if (prioritySelect) prioritySelect.value = "Normal";
  clearValidationErrors();

  // Reset filter controls so student immediately sees their newly posted request
  resetAllFilters();

  // Recalculate statistics counters
  updateCounters();

  // Focus the new card smoothly
  const firstCard = requestsContainer.querySelector(".request-card");
  if (firstCard) {
    firstCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// =============================================================================
// 8. RESOLVE & DELETE ACTIONS
// =============================================================================

/**
 * Marks a single request as resolved by its ID.
 * Exposed globally so the onclick in the card can call it directly.
 * @param {string} id - The ID of the request to resolve
 */
window.handleResolveRequest = function(id) {
  const targetRequest = helpRequests.find(req => req.id === id);
  if (targetRequest) {
    targetRequest.isResolved = true;
    updateCounters();
    applyFilters();
  }
};

/**
 * Deletes a single request from the array by its ID.
 * Exposed globally so the onclick in the card can call it directly.
 * @param {string} id - The ID of the request to delete
 */
window.handleDeleteRequest = function(id) {
  // Filter out the request with the matching ID
  helpRequests = helpRequests.filter(req => req.id !== id);

  // Update counters & re-apply current filters
  updateCounters();
  applyFilters();
};

// =============================================================================
// 9. EVENT LISTENERS & INITIALIZATION
// =============================================================================

// Form submit event
helpRequestForm.addEventListener("submit", handleFormSubmit);

// Search input event (live filtering as the user types)
searchInput.addEventListener("input", applyFilters);

// Category & Status filter change events
categoryFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// Clear search button click
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  applyFilters();
  searchInput.focus();
});

// Reset filters button click in empty state
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", resetAllFilters);
}

// Live validation error clearing when user begins typing
[studentNameInput, subjectInput, descriptionInput].forEach(input => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");
    const errorElem = document.getElementById(input.id + "Error");
    if (errorElem) errorElem.textContent = "";
  });
});

categorySelect.addEventListener("change", () => {
  categorySelect.classList.remove("input-error");
  categoryError.textContent = "";
});

// Initial render & counter calculation when page loads
document.addEventListener("DOMContentLoaded", () => {
  updateCounters();
  applyFilters();
});
