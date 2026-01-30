const API_BASE_URL = "http://localhost:3000/api";

const api = {
  // Menu endpoints
  async getMenu() {
    const response = await fetch(`${API_BASE_URL}/menu`);
    return response.json();
  },

  async getMenuItem(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`);
    return response.json();
  },

  async getMenuByCategory(categoryId) {
    const response = await fetch(`${API_BASE_URL}/menu/category/${categoryId}`);
    return response.json();
  },

  async createMenuItem(data) {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateMenuItem(id, data) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteMenuItem(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Category endpoints
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  async createCategory(data) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateCategory(id, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Order endpoints
  async createOrder(data) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return response.json();
  },

  async getAllOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return response.json();
  },

  // Feedback endpoints
  async submitFeedback(data) {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getFeedback() {
    const response = await fetch(`${API_BASE_URL}/feedback`);
    return response.json();
  },
};

// Utility function to format price in Naira with comma
function formatNaira(amount) {
  const num = parseFloat(amount);
  return (
    "₦" +
    num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
