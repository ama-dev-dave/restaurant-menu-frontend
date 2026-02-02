let menuItems = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadMenu() {
  try {
    const data = await api.getMenu();
    menuItems = data;
    extractCategories(data);
    renderCategories();
    renderMenu(data);
    updateCartCount();
  } catch (error) {
    console.error("Error loading menu:", error);
    document.getElementById("menu-grid").innerHTML =
      '<p class="error">Failed to load menu. Please try again.</p>';
  }
}

function extractCategories(items) {
  const categorySet = new Set();
  items.forEach((item) => {
    if (item.category_name) {
      categorySet.add(
        JSON.stringify({ id: item.category_id, name: item.category_name }),
      );
    }
  });
  categories = Array.from(categorySet).map((cat) => JSON.parse(cat));
}

function renderCategories() {
  const container = document.getElementById("category-filter");

  // Clear existing category buttons except "All Items"
  const allButton = container.querySelector('[data-category="all"]');
  container.innerHTML = "";
  container.appendChild(allButton);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.dataset.category = cat.id;
    btn.textContent = cat.name;
    container.appendChild(btn);
  });

  // Add click handlers to all buttons
  container.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const categoryId = this.dataset.category;

      // Remove active class from all buttons
      container
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Filter menu
      filterByCategory(categoryId);
    });
  });
}

function filterByCategory(categoryId) {
  if (categoryId === "all") {
    renderMenu(menuItems);
  } else {
    const filtered = menuItems.filter((item) => item.category_id == categoryId);
    renderMenu(filtered);
  }
}

function renderMenu(items) {
  const grid = document.getElementById("menu-grid");

  if (items.length === 0) {
    grid.innerHTML = '<p class="loading">No items found in this category.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <div class="menu-item">
            <img src="${item.image_url || "https://via.placeholder.com/300x200?text=No+Image"}" alt="${item.name}">
            <div class="menu-item-content">
                <span class="category-tag">${item.category_name}</span>
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="price">${formatNaira(item.price)}</div>
                ${
                  item.is_available
                    ? `<button class="btn btn-primary add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>`
                    : `<p class="unavailable">Currently Unavailable</p>`
                }
            </div>
        </div>
    `,
    )
    .join("");
}

function addToCart(itemId) {
  const item = menuItems.find((i) => i.id === itemId);
  if (!item) return;

  const existingItem = cart.find((i) => i.id === itemId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Show success toast notification
  showToast(`"${item.name}" has been added to cart`);
}

function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const messageElement = document.getElementById("toast-message");

  messageElement.textContent = message;
  toast.classList.add("show");

  // Auto hide after 2 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElements = document.querySelectorAll("#cart-count");

  countElements.forEach((el) => {
    el.textContent = count;
  });
}

// Initialize
if (document.getElementById("menu-grid")) {
  loadMenu();
}

