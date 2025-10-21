const daysContainer = document.querySelector(".calendar-days");
const monthYear = document.getElementById("month-year");
const modal = document.getElementById("event-modal");
const modalDate = document.getElementById("modal-date");
const eventText = document.getElementById("event-text");
const saveEventBtn = document.getElementById("save-event");
const deleteEventBtn = document.getElementById("delete-event");
const closeModalBtn = document.getElementById("close-modal");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYear.textContent = `${year}年 ${month + 1}月`;
  daysContainer.innerHTML = "";

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // 曜日ヘッダー
  const weekDays = ["日","月","火","水","木","金","土"];
  weekDays.forEach(d => {
    const div = document.createElement("div");
    div.classList.add("day-header");
    div.textContent = d;
    daysContainer.appendChild(div);
  });

  // 空白
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("day");
    empty.classList.add("empty");
    daysContainer.appendChild(empty);
  }

  // 日付セル
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const div = document.createElement("div");
    div.classList.add("day");
    if (isToday(date)) div.classList.add("today");

    const dateKey = `${year}-${month + 1}-${i}`;
    div.innerHTML = `<strong>${i}</strong>`;
    
    if (events[dateKey]) {
      const eventEl = document.createElement("span");
      eventEl.classList.add("event");
      eventEl.textContent = events[dateKey];
      div.appendChild(eventEl);
    }

    div.addEventListener("click", () => openModal(dateKey, date));
    daysContainer.appendChild(div);
  }
}

function isToday(date) {
  const now = new Date();
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
}

function openModal(dateKey, date) {
  modal.style.display = "flex";
  modalDate.textContent = `${date.getMonth() + 1}月${date.getDate()}日`;
  eventText.value = events[dateKey] || "";
  saveEventBtn.onclick = () => saveEvent(dateKey);
  deleteEventBtn.onclick = () => deleteEvent(dateKey);
}

function closeModal() {
  modal.style.display = "none";
  eventText.value = "";
}

function saveEvent(dateKey) {
  const text = eventText.value.trim();
  if (text) {
    events[dateKey] = text;
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }
  closeModal();
  renderCalendar();
}

function deleteEvent(dateKey) {
  delete events[dateKey];
  localStorage.setItem("calendarEvents", JSON.stringify(events));
  closeModal();
  renderCalendar();
}

document.getElementById("prev-month").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};
document.getElementById("next-month").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};
document.getElementById("today-btn").onclick = () => {
  currentDate = new Date();
  renderCalendar();
};
closeModalBtn.onclick = closeModal;
window.onclick = e => { if (e.target === modal) closeModal(); };

renderCalendar();
