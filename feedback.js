let selectedRating = 0;

function initializeStarRating() {
  const starsContainer = document.querySelector(".star-rating");

  starsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("star")) {
      const rating = parseInt(e.target.dataset.rating);
      selectedRating = rating;
      updateStars(rating);
    }
  });

  // Hover effect
  starsContainer.addEventListener("mouseover", function (e) {
    if (e.target.classList.contains("star")) {
      const rating = parseInt(e.target.dataset.rating);
      updateStars(rating);
    }
  });

  // Reset to selected rating on mouse leave
  starsContainer.addEventListener("mouseleave", function () {
    updateStars(selectedRating);
  });
}

function updateStars(rating) {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active");
      star.textContent = "★";
    } else {
      star.classList.remove("active");
      star.textContent = "☆";
    }
  });
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("feedback-name").value;
  const comment = document.getElementById("feedback-comment").value;

  if (selectedRating === 0) {
    alert("Please select a rating!");
    return;
  }

  const feedbackData = {
    customer_name: name,
    rating: selectedRating,
    comment: comment,
  };

  try {
    await api.submitFeedback(feedbackData);

    document.getElementById("feedback-form").style.display = "none";
    document.getElementById("feedback-success").style.display = "block";
  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Failed to submit feedback. Please try again.");
  }
}

if (document.getElementById("feedback-form")) {
  initializeStarRating();
  document
    .getElementById("feedback-form")
    .addEventListener("submit", handleFeedbackSubmit);
}
