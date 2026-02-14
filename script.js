// ===== Elements =====
const form = document.getElementById("reportForm");
const successMsg = document.getElementById("successMsg");
const loader = document.getElementById("loader");
const btn = document.getElementById("submitBtn");
const popup = document.getElementById("sharePopup");
const whatsappBtn = document.getElementById("whatsappShare");


// ===== Auto Set Today's Date =====
const dateInput = document.getElementById("autoDate");

const today = new Date();

const formattedToday = today.toLocaleDateString("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

dateInput.value = formattedToday;



// ===== Google Apps Script URL =====
const scriptURL =
  "https://script.google.com/macros/s/AKfycbz1bexWuHiV7fpLuPMY3Hlj1n7wZhOXYu381tTP3BzV3tUtKXUNyZ_HfSAULBgo9mGq9g/exec";

// ===== Helper: Show Loading =====
function startLoading() {
  loader.style.display = "block";
  btn.disabled = true;
  btn.textContent = "Submitting...";
}

// ===== Helper: Stop Loading =====
function stopLoading() {
  loader.style.display = "none";
  btn.disabled = false;
  btn.textContent = "Submit Report";
}

// ===== Helper: Validate Numbers =====
function validateNumbers(formData) {
  const numericFields = [
    "leads",
    "calls",
    "positive",
    "scheduled",
    "done",
    "tokens",
  ];

  for (let field of numericFields) {
    const value = Number(formData.get(field));

    if (isNaN(value) || value < 0) {
      alert("Please enter valid positive numbers in all fields.");
      return false;
    }
  }

  return true;
}

// ===== Submit Handler =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  successMsg.style.display = "none";

  const formData = new FormData(form);

  // Validate numeric inputs
  if (!validateNumbers(formData)) return;

  startLoading();

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Network response failed");

    // ===== Success UI =====
    // ===== Success UI =====
stopLoading();

// Show WhatsApp popup
popup.style.display = "flex";

// ===== Format date like: Sat, 14 Feb 2026 =====
const rawDate = new Date(formData.get("date"));

const formattedDate = rawDate.toLocaleDateString("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// ===== WhatsApp message (final format) =====
const reportText =
`*Daily Sales Report*
*Date: ${formattedDate}*
*Name: ${formData.get("name")}*

Leads: ${formData.get("leads")}
Calls: ${formData.get("calls")}
Positive: ${formData.get("positive")}
Scheduled: ${formData.get("scheduled")}
Visits Done: ${formData.get("done")}
Tokens: ${formData.get("tokens")}`;


// ===== WhatsApp Share Click =====
whatsappBtn.onclick = () => {
  const url =
    "https://wa.me/?text=" + encodeURIComponent(reportText);

  window.open(url, "_blank");

  popup.style.display = "none";
  form.reset();
};


  } catch (error) {
    console.error("Submission Error:", error);
    stopLoading();
    alert("Submission failed. Please try again.");
  }
});
