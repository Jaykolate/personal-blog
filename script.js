// script.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("posts.json")
    .then(res => res.json())
    .then(data => {
      const posts = data.blogs || data; // support both shapes
      const container = document.getElementById("blog-container");
      container.innerHTML = ""; // clear

      posts.forEach(post => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4 mb-4";

        // create card HTML safely (escape values)
        col.innerHTML = `
          <div class="card blog-card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title"></h5>
              <h6 class="card-subtitle mb-2 text-muted"></h6>
              <p class="card-text"></p>
              <button class="btn btn-outline-secondary mt-auto view-more-btn">View More</button>
            </div>
          </div>
        `;

        // append first so querySelector works
        container.appendChild(col);

        // fill content using DOM APIs and escaping
        const titleEl = col.querySelector(".card-title");
        const catEl = col.querySelector(".card-subtitle");
        const textEl = col.querySelector(".card-text");
        const btn = col.querySelector(".view-more-btn");

        titleEl.textContent = post.title || "Untitled";
        catEl.textContent = post.category || "";
        // short preview (escape + trim)
        const preview = (post.shortText !== undefined)
          ? post.shortText
          : (post.content ? post.content.substring(0, 120) + (post.content.length > 120 ? "..." : "") : "");
        textEl.textContent = preview;

        // store full content on dataset (raw), safe because we won't inject raw into innerHTML
        btn.dataset.title = post.title || "";
        btn.dataset.category = post.category || "";
        btn.dataset.content = post.fullText || post.content || "";

        // attach handler
        btn.addEventListener("click", () => {
          showModal(btn.dataset.title, btn.dataset.category, btn.dataset.content);
        });
      });
    })
    .catch(err => {
      console.error("Error loading posts:", err);
      const container = document.getElementById("blog-container");
      if (container) container.innerHTML = `<p class="text-danger">Failed to load posts.</p>`;
    });
});

// helper: escape HTML entities
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// helper: convert newlines to <br>
function nl2br(str) {
  return escapeHTML(str).replace(/\n/g, "<br>");
}

// create and show bootstrap modal with safe content
function showModal(title, category, content) {
  // remove old modal if present
  const old = document.getElementById("blogModal");
  if (old) {
    // hide first to avoid issues, then remove after hidden
    try { bootstrap.Modal.getInstance(old)?.hide(); } catch (e) {}
    old.remove();
  }

  // build modal container
  const modalDiv = document.createElement("div");
  modalDiv.className = "modal fade";
  modalDiv.id = "blogModal";
  modalDiv.tabIndex = -1;
  modalDiv.setAttribute("aria-hidden", "true");

  modalDiv.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <small class="text-muted modal-category"></small>
          <div class="modal-body-content mt-3"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);

  // populate safely
  modalDiv.querySelector(".modal-title").textContent = title || "";
  modalDiv.querySelector(".modal-category").textContent = category || "";
  modalDiv.querySelector(".modal-body-content").innerHTML = nl2br(content || "");

  // show using bootstrap
  const bsModal = new bootstrap.Modal(modalDiv);
  bsModal.show();

  // cleanup modal element on hide to avoid duplicates
  modalDiv.addEventListener("hidden.bs.modal", () => {
    modalDiv.remove();
  }, { once: true });
}
