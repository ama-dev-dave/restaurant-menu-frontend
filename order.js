let orderCart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");

  if (orderCart.length === 0) {
    container.innerHTML =
      '<p class="empty-cart">Your cart is empty. <a href="index.html">Browse menu</a></p>';
    totalElement.textContent = "0.00";
    return;
  }

  container.innerHTML = orderCart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatNaira(item.price)} each</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn-danger btn-small" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `,
    )
    .join("");

  const total = orderCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  totalElement.textContent = total.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function updateQuantity(itemId, change) {
  const item = orderCart.find((i) => i.id === itemId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(itemId);
  } else {
    localStorage.setItem("cart", JSON.stringify(orderCart));
    renderCart();
  }
}

function removeFromCart(itemId) {
  orderCart = orderCart.filter((i) => i.id !== itemId);
  localStorage.setItem("cart", JSON.stringify(orderCart));
  renderCart();
}

// Phone number validation - only allow numbers
function validatePhoneInput(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
}

async function handleCheckout(e) {
  e.preventDefault();

  const customerName = document.getElementById("customer-name").value;
  const customerPhone = document.getElementById("customer-phone").value;

  if (orderCart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Validate phone number contains only digits
  if (!/^\d+$/.test(customerPhone)) {
    alert("Phone number must contain only numbers!");
    return;
  }

  const total = orderCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    total_price: total,
    items: orderCart.map((item) => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  try {
    const result = await api.createOrder(orderData);

    document.querySelector(".order-container").style.display = "none";
    document.getElementById("order-success").style.display = "block";
    document.getElementById("order-id").textContent = result.order_id;
    document.getElementById("confirm-phone").textContent = customerPhone;

    localStorage.removeItem("cart");
    orderCart = [];
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Failed to place order. Please try again.");
  }
}

if (document.getElementById("cart-items")) {
  renderCart();

  const phoneInput = document.getElementById("customer-phone");
  phoneInput.addEventListener("input", function () {
    validatePhoneInput(this);
  });

  document
    .getElementById("checkout-form")
    .addEventListener("submit", handleCheckout);
}
