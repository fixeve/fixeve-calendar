const daysContainer = document.querySelector(".calendar-days");
const monthYear = document.getElementById("month-year");
const modal = document.getElementById("event-modal");
const modalDate = document.getElementById("modal-date");
const eventText = document.getElementById("event-text");
const saveEventBtn = document.getElementById("save-event");
const closeModalBtn = document.getElementById("close-modal");
const eventList = document.getElementById("event-list");
const viewSelect = document.getElementById("view-select");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let currentView = "month";

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  daysContainer.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYear.textContent = `${year}年 ${month + 1}月`;

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  weekDays.forEach(d => {
    const div = document.createElement("div");
    div.classList.add("day-header");
    div.textContent = d;
    daysContainer.appendChild(div);
  });

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("day");
    daysContainer.appendChild(empty);
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const dateKey = `${year}-${month + 1}-${i}`;
    const div = document.createElement("div");
    div.classList.add("day");
    if (isToday(date, today)) div.classList.add("today");

    div.innerHTML = `<strong>${i}</strong>`;
    if (events[dateKey]) {
      events[dateKey].forEach((text, idx) => {
        const ev = document.createElement("div");
        ev.classList.add("event");
        ev.textContent = text;
        ev.draggable = true;
        ev.dataset.date = dateKey;
        ev.dataset.index = idx;
        ev.addEventListener("dragstart", onDragStart);
        div.appendChild(ev);
      });
    }

    div.addEventListener("click", () => openModal(dateKey, date));
    div.addEventListener("dragover", e => e.preventDefault());
    div.addEventListener("drop", e => onDrop(e, dateKey));

    daysContainer.appendChild(div);
  }

  // ビュー切替処理
  if (currentView === "week") filterToWeek();
  else if (currentView === "day") filterToDay();
}

function isToday(date, today) {
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function openModal(dateKey, date) {
  modal.style.display = "flex";
  modalDate.textContent = `${date.getMonth() + 1}月${date.getDate()}日`;
  eventText.value = "";
  renderEventList(dateKey);
  saveEventBtn.onclick = () => saveEvent(dateKey);
}

function renderEventList(dateKey) {
  eventList.innerHTML = "";
  const evts = events[dateKey] || [];
  evts.forEach((t, i) => {
    const div = document.createElement("div");
    div.classList.add("event-item");
    div.innerHTML = `<span>${t}</span><button>削除</button>`;
    div.querySelector("button").onclick = () => {
      evts.splice(i, 1);
      if (evts.length === 0) delete events[dateKey];
      localStorage.setItem("calendarEvents", JSON.stringify(events));
      renderEventList(dateKey);
      renderCalendar();
    };
    eventList.appendChild(div);
  });
}

function closeModal() {
  modal.style.display = "none";
  eventText.value = "";
}

function saveEvent(dateKey) {
  const text = eventText.value.trim();
  if (text) {
    if (!events[dateKey]) events[dateKey] = [];
    events[dateKey].push(text);
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }
  eventText.value = "";
  renderEventList(dateKey);
  renderCalendar();
}

function onDragStart(e) {
  e.dataTransfer.setData("text/plain", JSON.stringify({
    fromDate: e.target.dataset.date,
    index: e.target.dataset.index
  }));
}

function onDrop(e, toDate) {
  const data = JSON.parse(e.dataTransfer.getData("text/plain"));
  const fromDate = data.fromDate;
  const index = data.index;
  const movedEvent = events[fromDate][index];

  // 移動
  if (!events[toDate]) events[toDate] = [];
  events[toDate].push(movedEvent);
  events[fromDate].splice(index, 1);
  if (events[fromDate].length === 0) delete events[fromDate];

  localStorage.setItem("calendarEvents", JSON.stringify(events));
  renderCalendar();
}

function filterToWeek() {
  const now = new Date(currentDate);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const allDays = document.querySelectorAll(".day");
  allDays.forEach(day => {
    const strong = day.querySelector("strong");
    if (!strong) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), strong.textContent);
    day.style.display = (date >= startOfWeek && date <= endOfWeek) ? "block" : "none";
  });
}

function filterToDay() {
  const allDays = document.querySelectorAll(".day");
  allDays.forEach(day => {
    const strong = day.querySelector("strong");
    if (!strong) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), strong.textContent);
    const today = new Date(currentDate);
    day.style.display = date.getDate() === today.getDate() ? "block" : "none";
  });
}

// ナビゲーション
document.getElementById("prev").onclick = () => {
  if (currentView === "month") currentDate.setMonth(currentDate.getMonth() - 1);
  else currentDate.setDate(currentDate.getDate() - 7);
  renderCalendar();
};
document.getElementById("next").onclick = () => {
  if (currentView === "month") currentDate.setMonth(currentDate.getMonth() + 1);
  else currentDate.setDate(currentDate.getDate() + 7);
  renderCalendar();
};
document.getElementById("today-btn").onclick = () => {
  currentDate = new Date();
  renderCalendar();
};
closeModalBtn.onclick = closeModal;
viewSelect.onchange = e => {
  currentView = e.target.value;
  renderCalendar();
};

renderCalendar();
