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
let dragData = null;

function renderCalendar() {
  daysContainer.innerHTML = "";
  monthYear.textContent = getTitle();

  if (currentView === "month") renderMonthView();
  else if (currentView === "week") renderWeekView();
  else renderDayView();
}

function getTitle() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  if (currentView === "month") return `${year}年 ${month}月`;
  if (currentView === "week") {
    const start = getWeekStart(currentDate);
    const end = getWeekEnd(currentDate);
    return `${start.getMonth()+1}/${start.getDate()} - ${end.getMonth()+1}/${end.getDate()}`;
  }
  return `${currentDate.getMonth()+1}月${currentDate.getDate()}日`;
}

function renderMonthView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  renderWeekDays();

  // 空白
  for (let i=0;i<firstDay.getDay();i++) createEmptyDay();

  for (let i=1;i<=lastDay.getDate();i++){
    const date = new Date(year, month, i);
    const dateKey = dateKeyString(date);
    createDayCell(date, dateKey);
  }
}

function renderWeekView() {
  renderWeekDays();
  const start = getWeekStart(currentDate);
  for (let i=0;i<7;i++){
    const date = new Date(start);
    date.setDate(start.getDate()+i);
    const dateKey = dateKeyString(date);
    createDayCell(date, dateKey);
  }
}

function renderDayView() {
  const dateKey = dateKeyString(currentDate);
  createDayCell(currentDate, dateKey, true);
}

function renderWeekDays() {
  const weekDays = ["日","月","火","水","木","金","土"];
  weekDays.forEach(d=>{
    const div = document.createElement("div");
    div.classList.add("day-header");
    div.textContent = d;
    daysContainer.appendChild(div);
  });
}

function createEmptyDay(){
  const div = document.createElement("div");
  div.classList.add("day");
  daysContainer.appendChild(div);
}

function createDayCell(date, dateKey, single=false){
  const div = document.createElement("div");
  div.classList.add("day");
  if (isToday(date)) div.classList.add("today");

  if (!single) div.innerHTML = `<strong>${date.getDate()}</strong>`;
  else div.innerHTML = `<strong>${date.getDate()}</strong>`;

  // イベント
  if (events[dateKey]){
    events[dateKey].forEach((text, idx)=>{
      const ev = document.createElement("div");
      ev.classList.add("event");
      ev.textContent = text;
      ev.draggable = true;
      ev.dataset.date = dateKey;
      ev.dataset.index = idx;
      ev.addEventListener("dragstart", e=> dragData = e.target);
      div.appendChild(ev);
    });
  }

  div.addEventListener("click",()=> openModal(dateKey, date));
  div.addEventListener("dragover", e=> e.preventDefault());
  div.addEventListener("drop", e=>{
    if (dragData){
      const fromDate = dragData.dataset.date;
      const idx = dragData.dataset.index;
      if (!events[dateKey]) events[dateKey]=[];
      events[dateKey].push(events[fromDate][idx]);
      events[fromDate].splice(idx,1);
      if (events[fromDate].length===0) delete events[fromDate];
      localStorage.setItem("calendarEvents", JSON.stringify(events));
      dragData=null;
      renderCalendar();
    }
  });

  daysContainer.appendChild(div);
}

function dateKeyString(date){
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function isToday(date){
  const now = new Date();
  return date.getFullYear()===now.getFullYear() &&
         date.getMonth()===now.getMonth() &&
         date.getDate()===now.getDate();
}

// 週開始・終了
function getWeekStart(date){
  const d = new Date(date);
  d.setDate(d.getDate()-d.getDay());
  return d;
}
function getWeekEnd(date){
  const d = new Date(getWeekStart(date));
  d.setDate(d.getDate()+6);
  return d;
}

function openModal(dateKey,date){
  modal.style.display="flex";
  modalDate.textContent=`${date.getMonth()+1}月${date.getDate()}日`;
  eventText.value="";
  renderEventList(dateKey);
  saveEventBtn.onclick = ()=> saveEvent(dateKey);
}

function renderEventList(dateKey){
  eventList.innerHTML="";
  const evts = events[dateKey] || [];
  evts.forEach((t,i)=>{
    const div = document.createElement("div");
    div.classList.add("event-item");
    div.innerHTML = `<span>${t}</span><button>削除</button>`;
    div.querySelector("button").onclick = ()=>{
      evts.splice(i,1);
      if (evts.length===0) delete events[dateKey];
      localStorage.setItem("calendarEvents", JSON.stringify(events));
      renderEventList(dateKey);
      renderCalendar();
    };
    eventList.appendChild(div);
  });
}

function closeModal(){modal.style.display="none";eventText.value="";}
function saveEvent(dateKey){
  const text = eventText.value.trim();
  if (!text) return;
  if (!events[dateKey]) events[dateKey]=[];
  events[dateKey].push(text);
  localStorage.setItem("calendarEvents", JSON.stringify(events));
  renderEventList(dateKey);
  renderCalendar();
}

document.getElementById("prev").onclick = ()=>{
  if (currentView==="month") currentDate.setMonth(currentDate.getMonth()-1);
  else currentDate.setDate(currentDate.getDate()-7);
  renderCalendar();
};
document.getElementById("next").onclick = ()=>{
  if (currentView==="month") currentDate.setMonth(currentDate.getMonth()+1);
  else currentDate.setDate(currentDate.getDate()+7);
  renderCalendar();
};
document.getElementById("today-btn").onclick=()=>{
  currentDate=new Date();
  renderCalendar();
};
closeModalBtn.onclick = closeModal;
viewSelect.onchange = e=>{
  currentView=e.target.value;
  renderCalendar();
};

renderCalendar();
