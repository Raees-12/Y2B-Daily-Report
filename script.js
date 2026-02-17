// ================= ELEMENTS =================
const form = document.getElementById("reportForm");
const successMsg = document.getElementById("successMsg");
const loader = document.getElementById("loader");
const btn = document.getElementById("submitBtn");
const popup = document.getElementById("sharePopup");
const whatsappBtn = document.getElementById("whatsappShare");
const summaryPopup = document.getElementById("summaryPopup");
const summaryTable = document.getElementById("summaryTable");
const shareSummaryBtn = document.getElementById("shareSummary");


const doneContainer = document.getElementById("doneVisitsContainer");
const scheduledContainer = document.getElementById("scheduledVisitsContainer");

const addDoneBtn = document.getElementById("addDoneVisit");
const addScheduledBtn = document.getElementById("addScheduledVisit");


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
  const numericFields = ["leads", "calls", "positive", "scheduled", "done", "tokens"];

  for (let field of numericFields) {
    const value = Number(formData.get(field));
    if (isNaN(value) || value < 0) {
      alert("Please enter valid positive numbers in all fields.");
      return false;
    }
  }

  return true;
}


// ================= DYNAMIC VISIT ROWS =================

// Create DONE visit row
function createDoneRow() {
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="visit-row">
      <input type="text" placeholder="Client Name" class="doneName" />
      <input type="time" class="doneTime" />
    </div>
    <div class="remove-link">Remove</div>
  `;

  div.querySelector(".remove-link").onclick = () => div.remove();

  doneContainer.appendChild(div);
}



// Create SCHEDULED visit row
function createScheduledRow() {
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="visit-row">
      <input type="text" placeholder="Client Name" class="schName" />
      <input type="date" class="schDate" />
    </div>
    <div class="remove-link">Remove</div>
  `;

  div.querySelector(".remove-link").onclick = () => div.remove();

  scheduledContainer.appendChild(div);
}



// Initial one row each
createDoneRow();
createScheduledRow();

addDoneBtn.onclick = createDoneRow;
addScheduledBtn.onclick = createScheduledRow;


// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  successMsg.style.display = "none";

  const formData = new FormData(form);

  if (!validateNumbers(formData)) return;

  // ===== Collect DONE visits =====
  const doneNames = [...document.querySelectorAll(".doneName")].map(i => i.value);
  const doneTimes = [...document.querySelectorAll(".doneTime")].map(i => i.value);

  formData.append("doneVisitNames", JSON.stringify(doneNames));
  formData.append("doneVisitTimes", JSON.stringify(doneTimes));

  // ===== Collect SCHEDULED visits =====
  const schNames = [...document.querySelectorAll(".schName")].map(i => i.value);
  const schDates = [...document.querySelectorAll(".schDate")].map(i => i.value);

  formData.append("scheduledVisitNames", JSON.stringify(schNames));
  formData.append("scheduledVisitDates", JSON.stringify(schDates));

  startLoading();

  try {
    // ===== Build JSON payload =====
    const payload = {
      date: new Date().toISOString(),
      name: formData.get("name"),
      leads: formData.get("leads"),
      calls: formData.get("calls"),
      positive: formData.get("positive"),
      scheduled: formData.get("scheduled"),
      done: formData.get("done"),
      tokens: formData.get("tokens"),

      doneVisits: doneNames.map((n, i) => ({
        site: n,
        time: doneTimes[i]
      })),

      scheduledVisits: schNames.map((n, i) => ({
        site: n,
        date: schDates[i]
      }))
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


    /* ===== WhatsApp share from summary ===== */
    shareSummaryBtn.onclick = () => {
      const msg = createWhatsAppText(data, name);
      window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");

      summaryPopup.style.display = "none";
      form.reset();
    };


    // ===== Format date =====
    const formattedDate = today.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // ===== DONE visits text =====
    let doneText = doneNames
      .map((name, i) => name ? `• ${name} (${doneTimes[i] || "-"})` : "")
      .filter(Boolean)
      .join("\n");

    if (!doneText) doneText = "-";

    // ===== SCHEDULED visits text =====
    let schText = schNames
      .map((name, i) => name ? `• ${name} (${schDates[i] || "-"})` : "")
      .filter(Boolean)
      .join("\n");

    if (!schText) schText = "-";

    // ===== WhatsApp message =====
    const reportText =
      `*Daily Sales Report*
*Date:* ${formattedDate}
*Name:* ${formData.get("name")}

*Leads:* ${formData.get("leads")}
*Calls:* ${formData.get("calls")}
*Positive:* ${formData.get("positive")}
*Scheduled Count:* ${formData.get("scheduled")}
*Done Count:* ${formData.get("done")}
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
      doneContainer.innerHTML = "";
      scheduledContainer.innerHTML = "";
      createDoneRow();
      createScheduledRow();
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
      <strong>Today Done Visit</strong>
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
