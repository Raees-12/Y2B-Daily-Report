* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

/* ===== Background ===== */
body {
  background: #f5f7fb; /* soft white-blue background */
  min-height: 100vh;
  padding: 0;
}

/* ===== Main Layout ===== */
.ios-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff; /* pure white card */
  border-radius: 0;
  padding: 24px 18px 32px;
}

/* ===== Header ===== */
.ios-header {
  text-align: center;
  margin-bottom: 20px;
}

.ios-logo {
  width: 200px;
  max-width: 85%;
  margin: 8px auto 14px;
  display: block;
}

.ios-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a; /* deep navy text */
  letter-spacing: -0.2px;
}

/* ===== Form Groups ===== */
.ios-group {
  margin-bottom: 14px;
}

.ios-group label {
  display: block;
  font-size: 12px;
  color: #64748b; /* subtle grey text */
  margin-bottom: 6px;
  font-weight: 500;
}

/* ===== Inputs & Select ===== */
.ios-group input,
.ios-group select {
  width: 100%;
  padding: 16px 14px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc; /* very light blue-white */
  font-size: 16px;
  color: #0f172a;
  transition: all 0.18s ease;
}

/* Focus glow */
.ios-group input:focus,
.ios-group select:focus {
  outline: none;
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* Remove number arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* ===== Date Picker Icon ===== */
input[type="date"] {
  position: relative;
  appearance: none;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 12px;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.ios-group input[type="date"] {
  background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='12' height='11' rx='2'/%3E%3Cline x1='3' y1='8' x2='15' y2='8'/%3E%3C/svg%3E") no-repeat right 14px center;
  background-size: 18px;
}

/* ===== Grid Layout ===== */
.ios-group-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ===== Button ===== */
.ios-button {
  width: 100%;
  margin-top: 26px;
  padding: 18px;
  border-radius: 22px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8); /* premium blue */
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
  transition: all 0.15s ease;
}

.ios-button:active {
  transform: scale(0.97);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
}

.ios-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Loader ===== */
.ios-loader {
  display: none;
  margin: 14px auto 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2563eb;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Success Message ===== */
.ios-success {
  display: none;
  text-align: center;
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
}

/* ===== Popup Overlay ===== */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* ===== Popup Box ===== */
.popup-box {
  width: 90%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 22px;
  padding: 22px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: popupIn 0.25s ease;
}

@keyframes popupIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.popup-box h3 {
  font-size: 18px;
  margin-bottom: 6px;
  color: #0f172a;
}

.popup-box p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

/* ===== Visit header with right-side add ===== */
.visit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

/* Small + Add more link */
.add-link {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.add-link:active {
  opacity: 0.6;
}

/* Each visit row */
.visit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 6px;
}

/* Small remove text */
.remove-link {
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
  cursor: pointer;
  text-align: right;
}

.remove-link:active {
  opacity: 0.6;
}

/* ===== Excel-style summary table ===== */
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 13px;
}

.summary-table th,
.summary-table td {
  border: 1px solid #9ca3af;   /* full grid lines */
  padding: 6px 8px;
}

.summary-table th {
  font-weight: 600;
  background: #f3f4f6;
  text-align: center;
}

.summary-table td:first-child {
  text-align: left;
  font-weight: 500;
}

.summary-table td:not(:first-child) {
  text-align: center;
}


/* ===== Scheduled details Excel style ===== */
.scheduled-details {
  border: 1px solid #9ca3af;
  border-top: none;
  padding: 12px 14px;
  font-size: 13px;
  text-align: left;        /* LEFT ALIGN FIX */
  line-height: 1.6;
}

.scheduled-details strong {
  display: block;
  margin-bottom: 6px;
}

/* Bullet list spacing like Excel */
.scheduled-details ul {
  padding-left: 18px;
  margin: 0;
}

.scheduled-details li {
  margin-bottom: 2px;
}

/* Prevent date from breaking into two lines */
.summary-table th:nth-child(2) {
  white-space: nowrap;
}
