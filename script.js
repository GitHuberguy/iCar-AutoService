const STORAGE_KEY = "icar_appointments_v1";

// Storage

function loadAppointments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAppointments(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return "A-" + Date.now();
}

// Booking Page

function initBookingPage() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const msg = document.getElementById("message");

  // Auto select service from Services page
  const params = new URLSearchParams(window.location.search);
  const serviceFromUrl = params.get("service");
  if (serviceFromUrl) {
    document.getElementById("serviceType").value = serviceFromUrl;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const appointment = {
      id: generateId(),
      fullName: document.getElementById("fullName").value.trim(),
      carModel: document.getElementById("carModel").value.trim(),
      serviceType: document.getElementById("serviceType").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    if (
      !appointment.fullName ||
      !appointment.carModel ||
      !appointment.serviceType ||
      !appointment.date ||
      !appointment.time
    ) {
      msg.textContent = "Please fill all fields.";
      msg.style.color = "#ffb3b3";
      return;
    }

    const list = loadAppointments();
    list.push(appointment);
    saveAppointments(list);

    msg.textContent = "Appointment booked successfully!";
    msg.style.color = "#9be29b";
    form.reset();
  });
}

// Admin Page

function initAdminPage() {
  const rows = document.getElementById("rows");
  if (!rows) return;

  function render() {
    const list = loadAppointments()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    rows.innerHTML = "";

    if (list.length === 0) {
      rows.innerHTML = `<tr><td colspan="6">No appointments yet.</td></tr>`;
      return;
    }

    list.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.fullName}</td>
        <td>${a.carModel}</td>
        <td>${a.serviceType}</td>
        <td>${a.date} ${a.time}</td>
        <td><strong>${a.status}</strong></td>
        <td>
          <button data-id="${a.id}" data-action="confirm">Confirm</button>
          <button data-id="${a.id}" data-action="cancel">Cancel</button>
        </td>
      `;
      rows.appendChild(tr);
    });
  }

  rows.addEventListener("click", (e) => {
    const btn = e.target;
    if (!btn.dataset.id) return;

    const list = loadAppointments();
    const item = list.find(a => a.id === btn.dataset.id);
    if (!item) return;

    if (btn.dataset.action === "confirm") item.status = "Confirmed";
    if (btn.dataset.action === "cancel") item.status = "Cancelled";

    saveAppointments(list);
    render();
  });

  render();
}



document.addEventListener("DOMContentLoaded", () => {
  initBookingPage();
  initAdminPage();
});
