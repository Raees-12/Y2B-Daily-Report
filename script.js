// ================= ELEMENTS =================
const form = document.getElementById("reportForm");
const successMsg = document.getElementById("successMsg");
const loader = document.getElementById("loader");
const btn = document.getElementById("submitBtn");
const popup = document.getElementById("sharePopup");
const whatsappBtn = document.getElementById("whatsappShare");
const summaryPopup = document.getElementById("summaryPopup");
const summaryTable = document.getElementById("summaryTable");
const manualScheduledContainer = document.getElementById("scheduledVisitsContainer");
const visitScheduledCount = document.getElementById("visitScheduledCount");
const futureVisitDoneCount = document.getElementById("futureVisitDoneCount");
const futureVisitDoneContainer = document.getElementById("futureVisitDoneContainer");

let futureVisitsData = [];       // all future visits from backend
let futureVisitSelections = [];  // selected dropdown rows


let scheduledLocked = false;
const todayActionContainer =
  document.getElementById("todayVisitsContainer") || {
    innerHTML: "",
    appendChild: () => { }
  };

// ===== OPEN SCHEDULE ROWS + SAVE BUTTON =====
visitScheduledCount.addEventListener("input", (e) => {

  const count = Number(e.target.value) || 0;
  manualScheduledContainer.innerHTML = "";

  if (!count) return;

  for (let i = 0; i < count; i++) {

    const div = document.createElement("div");
    div.className = "visit-row future-row";

    const minDate = getTodayDate();

    div.innerHTML = `
  <input type="text" placeholder="Client Name" class="schName" required />
  <input type="date" class="schDate" min="${minDate}" required />
`;

    manualScheduledContainer.appendChild(div);
  }

  // Add Save Button
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "ios-button";
  saveBtn.textContent = "Save Scheduled Visits";
  saveBtn.style.marginTop = "12px";

  manualScheduledContainer.appendChild(saveBtn);

  saveBtn.addEventListener("click", saveScheduledVisits);

});

futureVisitDoneCount.addEventListener("input", async (e) => {

  const count = Number(e.target.value) || 0;
  futureVisitDoneContainer.innerHTML = "";
  futureVisitSelections = [];

  if (!count) return;

  const name = form.querySelector('[name="name"]').value;
  if (!name) {
    alert("Select employee name first");
    futureVisitDoneCount.value = "";
    return;
  }

  try {
    const res = await fetch(
      `${scriptURL}?action=futureVisits&name=${encodeURIComponent(name)}`
    );

    const data = await res.json();

    if (!data.visits || !data.visits.length) {
      futureVisitDoneContainer.innerHTML =
        "<p style='font-size:13px;color:#64748b'>No future visits available</p>";
      return;
    }

    futureVisitsData = data.visits; // must be sorted from backend

    for (let i = 0; i < count; i++) {
      renderFutureVisitRow();
    }

  } catch (err) {
    console.error("Future visit fetch error:", err);
    alert("Failed to load future visits");
  }

});



// ================= AUTO DATE =================
const dateInput = document.getElementById("autoDate");

const today = new Date();

dateInput.value = today.toLocaleDateString("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});


// ================= APPS SCRIPT URL =================
const scriptURL =
  "https://script.google.com/macros/s/AKfycbyI-h3RLydGwyBIJdDLGs5JUnKP0M77W_DbofKz21kVUnLkLWvAqrFfiPm098kb58jKbQ/exec";

const nameSelect = form.querySelector('[name="name"]');

nameSelect.addEventListener("change", async () => {
  const name = nameSelect.value;

  todayVisitActions = [];   // ⭐ RESET STORED ACTIONS
  todayActionContainer.innerHTML = "Loading...";
  if (!scheduledLocked) {
    manualScheduledContainer.innerHTML = "";
    visitScheduledCount.value = "";
  }


  if (!name) {
    todayActionContainer.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(
      `${scriptURL}?action=todayVisits&name=${encodeURIComponent(name)}`
    );
    const data = await res.json();

    if (!data.visits || !data.visits.length) {
      todayActionContainer.innerHTML =
        "<p style='font-size:13px;color:#64748b'>No visits today</p>";
      return;
    }

    todayActionContainer.innerHTML = "";
    data.visits.forEach(v => renderVisitRow(v, name));

  } catch (err) {
    console.error("Today visits fetch error:", err);
    todayActionContainer.innerHTML =
      "<p style='font-size:13px;color:red'>Failed to load visits</p>";
  }
});


// ================= LOADING HELPERS =================
function startLoading() {
  loader.style.display = "block";
  btn.disabled = true;
  btn.textContent = "Submitting...";
}

function stopLoading() {
  loader.style.display = "none";
  btn.disabled = false;
  btn.textContent = "Submit Report";
}


// ================= VALIDATION =================
function validateNumbers(formData) {
  const numericFields = ["leads", "calls", "positive", "scheduled", "tokens"];

  for (let field of numericFields) {
    const value = Number(formData.get(field));
    if (isNaN(value) || value < 0) {
      alert("Please enter valid positive numbers in all fields.");
      return false;
    }
  }

  return true;
}

function formatFutureDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });
}



// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {

  if (!form.checkValidity()) {
    return; // Let browser show native validation
  }

  e.preventDefault();

  successMsg.style.display = "none";

  const formData = new FormData(form);

  if (!validateNumbers(formData)) return;

  // ===== Collect SCHEDULED visits (manual inputs) =====
  const schNames = [...document.querySelectorAll(".schName")].map(i => i.value);
  const schDates = [...document.querySelectorAll(".schDate")].map(i => i.value);

  startLoading();

  // ===== Collect today's visit actions =====
  const visitUpdates = todayVisitActions.map(v => {
    const type = v.div.querySelector(".visitAction")?.value;
    if (!type) return null;

    let obj = {
      row: v.visit.row,
      site: v.visit.site,
      name: v.name,
      type
    };

    if (type === "done") {
      obj.time = v.div.querySelector(".timeInput")?.value || "";
    }

    if (type === "reschedule") {
      obj.newDate = v.div.querySelector(".dateInput")?.value || "";
    }

    if (type === "cancel") {
      obj.reason = v.div.querySelector(".reasonInput")?.value || "";
    }

    return obj;
  }).filter(Boolean);

  for (let v of visitUpdates) {
    if (v.type === "done" && !v.time) {
      alert(`Enter time for ${v.site}`);
      stopLoading();
      return;
    }

    if (v.type === "reschedule" && !v.newDate) {
      alert(`Select new date for ${v.site}`);
      stopLoading();
      return;
    }

    if (v.type === "cancel" && !v.reason) {
      alert(`Enter cancel reason for ${v.site}`);
      stopLoading();
      return;
    }
  }

  // ===== Collect future visit done (native validation already handles required) =====
  const futureDoneVisits = futureVisitSelections.map(v => ({
    row: v.select.value,
    time: v.timeInput.value
  }));


  try {
    // ===== Build JSON payload =====
    const payload = {
      date: new Date().toISOString(),
      name: formData.get("name"),
      leads: formData.get("leads"),
      calls: formData.get("calls"),
      positive: formData.get("positive"),
      scheduled: formData.get("scheduled"),
      tokens: formData.get("tokens"),
      done: visitUpdates.filter(v => v.type === "done").length
        + futureDoneVisits.length,

      visitUpdates,
      futureDoneVisits
    };


    // ===== Send correctly to Apps Script =====
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "data=" + encodeURIComponent(JSON.stringify(payload))
    });


    if (!response.ok) throw new Error("Network response failed");

    /* ===== Fetch summary from Apps Script ===== */
    const name = formData.get("name");

    const res = await fetch(scriptURL + "?name=" + encodeURIComponent(name));
    const data = await res.json();

    // ===== HANDLE GET ERROR SAFELY =====
    if (data.status === "error") {
      console.error("Summary load error:", data.message);

      alert("Report saved successfully, but summary failed to load.");

      form.reset();
      stopLoading();
      return; // stop further JS execution
    }


    /* ===== Build summary table ===== */
    summaryTable.innerHTML = createSummaryHTML(data, name);

    /* ===== Show summary popup ===== */
    summaryPopup.style.display = "flex";

    stopLoading();   // ✅ CORRECT PLACE


    // ===== Format date =====
    const formattedDate = today.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let doneText = data.todayVisits?.length
      ? data.todayVisits.map(v => `• ${v.site} (${v.time || "-"})`).join("\n")
      : "-";

    let schText = data.scheduledDetails?.length
      ? data.scheduledDetails.map(v => `• ${v.site}`).join("\n")
      : "-";

    // ===== WhatsApp message =====
    const reportText =
      `*Daily Sales Report*
*Date:* ${formattedDate}
*Name:* ${formData.get("name")}

*Leads:* ${formData.get("leads")}
*Calls:* ${formData.get("calls")}
*Positive:* ${formData.get("positive")}
*Scheduled Count:* ${formData.get("scheduled")}
*Done Count:* ${visitUpdates.filter(v => v.type === "done").length}
*Tokens:* ${formData.get("tokens")}

*Visits Done*
${doneText}

*Visits Scheduled*
${schText}`;

    // ===== Share button =====
    whatsappBtn.onclick = () => {
      window.open("https://wa.me/?text=" + encodeURIComponent(reportText), "_blank");
      popup.style.display = "none";
      form.reset();

      // Reset dynamic rows
      todayActionContainer.innerHTML = "";
      manualScheduledContainer.innerHTML = "";
    };

  } catch (error) {
    console.error("Submission Error:", error);
    stopLoading();
    alert("Submission failed. Please try again.");
  }
});

function createSummaryHTML(data, name) {
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });

  // ===== helper to safely format TIME =====
  function formatTime(t) {
    if (!t) return "-";

    const d = new Date(t);

    if (!isNaN(d)) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    return t; // already plain text
  }


  // ===== helper to safely format DATE =====
  function formatDateSafe(v) {
    if (!v) return "-";

    // if already dd/MM/yyyy text → convert manually
    if (typeof v === "string" && v.includes("/")) {
      const [day, month, year] = v.split("/");
      const d = new Date(`${year}-${month}-${day}`);
      if (!isNaN(d)) {
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit"
        });
      }
      return v;
    }

    // normal Date / ISO string
    const d = new Date(v);
    if (isNaN(d)) return "-";

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });
  }


  return `
  <div style="font-weight:600; margin-bottom:10px;">
    Name: ${name}
  </div>


    
    <table class="summary-table">
      <tr>
        <th>Particulars</th>
        <th>${todayDate}</th>
        <th>MTD</th>
      </tr>

      ${row("Fresh Leads Received", data.today.leads, data.mtd.leads)}
      ${row("Calls Made", data.today.calls, data.mtd.calls)}
      ${row("Meaningful Conversations Done", data.today.positive, data.mtd.positive)}
      ${row("Site Visit Scheduled for the month", data.today.scheduled, data.mtd.scheduled)}
      ${row("Site Visit Done", data.today.done, data.mtd.done)}
      ${row("Bookings", data.today.tokens, data.mtd.tokens)}
      ${row("Site Visit Conversion %", data.today.siteVisitConversion, data.mtd.siteVisitConversion)}
      ${row("Closure Conversion%", data.today.closureConversion, data.mtd.closureConversion)}
    </table>

    <div class="scheduled-details">
      <strong>Today's Visit Done</strong>
      ${data.todayVisits && data.todayVisits.length
      ? `<ul>
              ${data.todayVisits
        .map(v => `<li>${v.site} – ${formatTime(v.time)}</li>`)
        .join("")}
            </ul>`
      : "<p>-</p>"
    }

      <strong>Site Visit Scheduled Details</strong>
      ${data.scheduledDetails && data.scheduledDetails.length
      ? `<ul>
              ${data.scheduledDetails
        .map(v => `<li>${v.site} – ${formatDateSafe(v.date)}</li>`)
        .join("")}
            </ul>`
      : "<p>-</p>"
    }
    </div>
  `;
}




function row(title, today, mtd) {
  return `<tr>
    <td>${title}</td>
    <td>${today}</td>
    <td>${mtd}</td>
  </tr>`;
}

function createWhatsAppText(data, name) {
  return `*Performance Summary*
*Name:* ${name}

Leads: ${data.today.leads} (MTD ${data.mtd.leads})
Calls: ${data.today.calls} (MTD ${data.mtd.calls})
Positive: ${data.today.positive} (MTD ${data.mtd.positive})
Visits Done: ${data.today.done} (MTD ${data.mtd.done})
Bookings: ${data.today.tokens} (MTD ${data.mtd.tokens})

Visit Conversion: ${data.today.siteVisitConversion}
Closure Conversion: ${data.today.closureConversion}`;
}

async function saveScheduledVisits() {

  const name = form.querySelector('[name="name"]').value;

  if (!name) {
    alert("Select employee name first");
    return;
  }

  const schNames = [...document.querySelectorAll(".schName")];
  const schDates = [...document.querySelectorAll(".schDate")];

  const visits = schNames.map((input, i) => ({
    client: input.value.trim(),
    date: schDates[i].value
  }));

  if (visits.some(v => !v.client || !v.date)) {
    alert("Fill all scheduled visit fields");
    return;
  }

  try {

    const saveBtn = manualScheduledContainer.querySelector(".ios-button");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body:
        "action=addScheduledVisits&data=" +
        encodeURIComponent(JSON.stringify({ name, visits }))
    });

    saveBtn.textContent = "Saved ✓";
    saveBtn.style.background = "#16a34a";

    // 🔒 Make count readOnly (not disabled)
    visitScheduledCount.readOnly = true;

    // 🔒 Make all scheduled fields readOnly
    document.querySelectorAll(".schName, .schDate").forEach(input => {
      input.readOnly = true;
    });

    // 🔒 Disable save button (but keep visible if you want)
    saveBtn.disabled = true;

    // Mark locked
    scheduledLocked = true;
    // 🔥 REFRESH TODAY VISITS
    nameSelect.dispatchEvent(new Event("change"));

  } catch (err) {
    alert("Failed to save scheduled visits");
  }
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // YYYY-MM-DD format
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

// ===== STORE TODAY VISIT ACTIONS =====
let todayVisitActions = [];


function renderVisitRow(visit, name) {
  const div = document.createElement("div");

  div.innerHTML = `
    <div style="margin-bottom:10px;font-weight:600">${visit.site}</div>

    <select class="visitAction ios-input" required>
      <option value="">Select Action</option>
      <option value="done">Done</option>
      <option value="reschedule">Reschedule</option>
      <option value="cancel">Cancel</option>
    </select>

    <div class="actionInput" style="margin-top:8px"></div>

    <hr style="margin:14px 0;border:none;border-top:1px solid #e2e8f0">
  `;

  const actionSelect = div.querySelector(".visitAction");
  const inputBox = div.querySelector(".actionInput");

  // Change input based on action
  actionSelect.addEventListener("change", () => {
    const val = actionSelect.value;

    if (val === "done") {
      const maxTime = getCurrentTimeHHMM();
      inputBox.innerHTML = `
    <input 
      type="time" 
      class="timeInput" 
      max="${maxTime}" 
      required>
  `;
    } else if (val === "reschedule") {
      const minDate = getTomorrowDate();
      inputBox.innerHTML = `
    <input 
      type="date" 
      class="dateInput" 
      min="${minDate}" 
      required>
  `;
    } else if (val === "cancel") {
      inputBox.innerHTML =
        `<input type="text" class="reasonInput" placeholder="Reason to cancel" required>`;
    } else {
      inputBox.innerHTML = "";
    }
  });


  todayActionContainer.appendChild(div);
  todayVisitActions.push({ div, visit, name });

}

function renderFutureVisitRow() {

  const div = document.createElement("div");
  div.className = "visit-row future-row";

  const select = document.createElement("select");
  select.className = "futureVisitSelect";
  select.required = true;   // ✅ REQUIRED
  select.innerHTML = `<option value="" disabled selected>Select Visit</option>`;

  futureVisitsData.forEach(v => {
    const option = document.createElement("option");
    option.value = v.row;
    option.textContent = `${v.client} - ${formatFutureDate(v.date)}`;
    select.appendChild(option);
  });

  const timeInput = document.createElement("input");
  timeInput.type = "time";
  timeInput.className = "futureVisitTime";
  timeInput.required = true;  // ✅ REQUIRED
  timeInput.max = getCurrentTimeHHMM();

  div.appendChild(select);
  div.appendChild(timeInput);

  futureVisitDoneContainer.appendChild(div);

  futureVisitSelections.push({ select, timeInput });

  select.addEventListener("change", updateFutureDropdowns);
}

function updateFutureDropdowns() {

  const selectedValues = futureVisitSelections
    .map(v => v.select.value)
    .filter(v => v);

  futureVisitSelections.forEach(v => {

    [...v.select.options].forEach(option => {

      if (!option.value) return;

      option.disabled =
        selectedValues.includes(option.value) &&
        option.value !== v.select.value;

    });

  });
}
