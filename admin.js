let allMenuItems = [];
let allCategories = [];
let deleteCallback = null;

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tabName = this.dataset.tab;

    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    this.classList.add("active");
    document.getElementById(`${tabName}-tab`).classList.add("active");

    if (tabName === "menu") loadAdminMenu();
    if (tabName === "categories") loadCategories();
    if (tabName === "orders") loadOrders();
    if (tabName === "feedback") loadFeedback();
  });
});

// Toast notification for admin
function showAdminToast(message) {
  const toast = document.getElementById("admin-toast");
  const messageElement = document.getElementById("admin-toast-message");

  messageElement.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Custom delete modal
function showDeleteModal(title, message, callback) {
  const modal = document.getElementById("delete-modal");
  document.getElementById("delete-modal-title").textContent = title;
  document.getElementById("delete-modal-message").textContent = message;

  deleteCallback = callback;
  modal.style.display = "flex";
}

function hideDeleteModal() {
  document.getElementById("delete-modal").style.display = "none";
  deleteCallback = null;
}

document.getElementById("confirm-delete-btn").addEventListener("click", () => {
  if (deleteCallback) {
    deleteCallback();
  }
  hideDeleteModal();
});

document
  .getElementById("cancel-delete-btn")
  .addEventListener("click", hideDeleteModal);

// Menu Management
async function loadAdminMenu() {
  try {
    const data = await api.getMenu();
    allMenuItems = data;

    // Load categories for the select dropdown
    const categoriesData = await api.getCategories();
    allCategories = categoriesData;

    renderAdminMenu(data);
    populateCategorySelect();
  } catch (error) {
    console.error("Error loading menu:", error);
  }
}

function renderAdminMenu(items) {
  const container = document.getElementById("menu-items-container");

  if (items.length === 0) {
    container.innerHTML = '<p class="loading">No menu items yet.</p>';
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <div class="menu-admin-card">
            <div class="menu-admin-header">
                <h4>${item.name}</h4>
                <span class="category-badge">${item.category_name}</span>
            </div>
            <p class="menu-admin-desc">${item.description}</p>
            <div class="menu-admin-footer">
                <span class="menu-price">${formatNaira(item.price)}</span>
                <span class="menu-status ${item.is_available ? "available" : "unavailable"}">
                    ${item.is_available ? "✅ Available" : "❌ Unavailable"}
                </span>
            </div>
            <div class="menu-admin-actions">
                <button class="btn btn-primary btn-small" onclick="editItem(${item.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="confirmDeleteItem(${item.id}, '${item.name.replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function populateCategorySelect() {
  const select = document.getElementById("item-category");
  select.innerHTML =
    '<option value="">Select Category</option>' +
    allCategories
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
}

document.getElementById("add-item-btn").addEventListener("click", () => {
  document.getElementById("form-title").textContent = "Add New Menu Item";
  document.getElementById("menu-item-form").reset();
  document.getElementById("item-id").value = "";
  document.getElementById("add-item-form").style.display = "flex";
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  document.getElementById("add-item-form").style.display = "none";
});

// Price input validation
function validatePriceInput(input) {
  input.value = input.value.replace(/[^0-9.]/g, "");
  const parts = input.value.split(".");
  if (parts.length > 2) {
    input.value = parts[0] + "." + parts.slice(1).join("");
  }
}

document
  .getElementById("menu-item-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    const itemId = document.getElementById("item-id").value;
    const data = {
      category_id: parseInt(document.getElementById("item-category").value),
      name: document.getElementById("item-name").value,
      description: document.getElementById("item-description").value,
      price: parseFloat(document.getElementById("item-price").value),
      image_url: document.getElementById("item-image").value || null,
      is_available: document.getElementById("item-available").checked,
    };

    try {
      if (itemId) {
        await api.updateMenuItem(itemId, data);
        showAdminToast(`"${data.name}" has been updated successfully!`);
      } else {
        await api.createMenuItem(data);
        showAdminToast(`"${data.name}" has been added successfully!`);
      }

      document.getElementById("add-item-form").style.display = "none";
      loadAdminMenu();
    } catch (error) {
      console.error("Error saving item:", error);
      showAdminToast("Failed to save item. Please try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });

document.getElementById("item-price").addEventListener("input", function () {
  validatePriceInput(this);
});

function editItem(id) {
  const item = allMenuItems.find((i) => i.id === id);
  if (!item) return;

  document.getElementById("form-title").textContent = "Edit Menu Item";
  document.getElementById("item-id").value = item.id;
  document.getElementById("item-category").value = item.category_id;
  document.getElementById("item-name").value = item.name;
  document.getElementById("item-description").value = item.description;
  document.getElementById("item-price").value = item.price;
  document.getElementById("item-image").value = item.image_url || "";
  document.getElementById("item-available").checked = item.is_available;
  document.getElementById("add-item-form").style.display = "flex";
}

function confirmDeleteItem(id, name) {
  showDeleteModal(
    "Delete Menu Item",
    `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    () => deleteItem(id, name),
  );
}

async function deleteItem(id, name) {
  try {
    await api.deleteMenuItem(id);
    showAdminToast(`"${name}" has been deleted successfully!`);
    loadAdminMenu();
  } catch (error) {
    console.error("Error deleting item:", error);
    showAdminToast("Failed to delete item. Please try again.");
  }
}

// Category Management
async function loadCategories() {
  try {
    const categories = await api.getCategories();
    allCategories = categories;
    renderCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function renderCategories(categories) {
  const container = document.getElementById("categories-grid");

  if (categories.length === 0) {
    container.innerHTML = '<p class="loading">No categories yet.</p>';
    return;
  }

  container.innerHTML = categories
    .map(
      (cat) => `
        <div class="category-card">
            <h4>${cat.name}</h4>
            <div class="category-actions">
                <button class="btn btn-primary btn-small" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="confirmDeleteCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

document.getElementById("add-category-btn").addEventListener("click", () => {
  document.getElementById("category-form-title").textContent =
    "Add New Category";
  document.getElementById("category-form").reset();
  document.getElementById("category-id").value = "";
  document.getElementById("add-category-form").style.display = "flex";
});

document.getElementById("cancel-category-btn").addEventListener("click", () => {
  document.getElementById("add-category-form").style.display = "none";
});

document
  .getElementById("category-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    const categoryId = document.getElementById("category-id").value;
    const data = {
      name: document.getElementById("category-name").value,
    };

    try {
      if (categoryId) {
        await api.updateCategory(categoryId, data);
        showAdminToast(
          `Category "${data.name}" has been updated successfully!`,
        );
      } else {
        await api.createCategory(data);
        showAdminToast(`Category "${data.name}" has been added successfully!`);
      }

      document.getElementById("add-category-form").style.display = "none";
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      showAdminToast("Failed to save category. Please try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });

function editCategory(id, name) {
  document.getElementById("category-form-title").textContent = "Edit Category";
  document.getElementById("category-id").value = id;
  document.getElementById("category-name").value = name;
  document.getElementById("add-category-form").style.display = "flex";
}

function confirmDeleteCategory(id, name) {
  showDeleteModal(
    "Delete Category",
    `Are you sure you want to delete "${name}"? This may affect menu items in this category.`,
    () => deleteCategory(id, name),
  );
}

async function deleteCategory(id, name) {
  try {
    await api.deleteCategory(id);
    showAdminToast(`Category "${name}" has been deleted successfully!`);
    loadCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
    showAdminToast("Failed to delete category. Please try again.");
  }
}

// Orders Management
async function loadOrders() {
  try {
    const orders = await api.getAllOrders();
    const container = document.getElementById("orders-list");

    if (orders.length === 0) {
      container.innerHTML = '<p class="loading">No orders yet.</p>';
      return;
    }

    container.innerHTML = orders
      .map(
        (order) => `
            <div class="order-card">
                <div class="order-header">
                    <h4>Order #${order.id}</h4>
                    <span class="order-date">${new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div class="order-customer">
                    <p><strong>Customer:</strong> ${order.customer_name}</p>
                    <p><strong>Phone:</strong> ${order.customer_phone}</p>
                </div>
                <div class="order-items">
                    <strong>Items:</strong>
                    <ul>
                        ${
                          order.items
                            ? order.items
                                .map(
                                  (item) => `
                            <li>${item.item_name || "Item"} × ${item.quantity} - ${formatNaira(item.price)}</li>
                        `,
                                )
                                .join("")
                            : "<li>Loading items...</li>"
                        }
                    </ul>
                </div>
                <div class="order-total">
                    <strong>Total: ${formatNaira(order.total_price)}</strong>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading orders:", error);
    document.getElementById("orders-list").innerHTML =
      '<p class="error">Failed to load orders.</p>';
  }
}

// Feedback Management
async function loadFeedback() {
  try {
    const feedbacks = await api.getFeedback();
    const container = document.getElementById("feedback-list");

    if (feedbacks.length === 0) {
      container.innerHTML = '<p class="loading">No feedback yet.</p>';
      return;
    }

    container.innerHTML = feedbacks
      .map(
        (fb) => `
            <div class="feedback-card">
                <h4>${fb.customer_name}</h4>
                <div class="feedback-rating">${"★".repeat(fb.rating)}${"☆".repeat(5 - fb.rating)}</div>
                <p>${fb.comment}</p>
                <small>${new Date(fb.created_at).toLocaleString()}</small>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading feedback:", error);
    document.getElementById("feedback-list").innerHTML =
      '<p class="error">Failed to load feedback.</p>';
  }
}

// Initialize
loadAdminMenu();
