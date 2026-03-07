/* ================================
STORAGE SETTINGS
================================ */

let workDuration = (localStorage.getItem("workDuration") || 25) * 60;
let shortBreak = (localStorage.getItem("shortBreak") || 5) * 60;
let longBreak = (localStorage.getItem("longBreak") || 15) * 60;

let gifUrl = localStorage.getItem("motivationGif") || "";
let isMuted = localStorage.getItem("muted") === "true";
let currentTheme = localStorage.getItem("theme") || "pastel";
let currentFont = localStorage.getItem("font") || "default";

/* ================================
MOTIVATION MESSAGES
================================ */

const focusMessages = [
"Training arc activated.",
"Just 25 minutes. You got this.",
"One step closer to mastery.",
"Stay calm and keep coding.",
"Future you will thank you.",
"Focus mode: ON.",
"Let's build something awesome."
];

const breakMessages = [
"Nice work! Take a breath.",
"Stretch your shoulders.",
"Drink some water.",
"Rest your eyes.",
"You earned this break."
];

/* ================================
TIMER STATE
================================ */

const cyclePattern = ["work","short","work","short","work","short","work","long"];

let sessionIndex = 0;
let time = workDuration;
let interval = null;
let isRunning = false;

/* ================================
AUDIO
================================ */

let audioCtx = null;

function initAudio(){
if(!audioCtx){
audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

if(audioCtx.state === "suspended"){
audioCtx.resume();
}
}

function playTing(){
if(!audioCtx || isMuted) return;

const now = audioCtx.currentTime;

const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

osc.type="triangle";
osc.frequency.setValueAtTime(800,now);
osc.frequency.exponentialRampToValueAtTime(1200,now+0.3);

osc.connect(gain);
gain.connect(audioCtx.destination);

gain.gain.setValueAtTime(0.6,now);
gain.gain.exponentialRampToValueAtTime(0.001,now+0.8);

osc.start(now);
osc.stop(now+0.8);
}

function playSoftClick(){
if(!audioCtx || isMuted) return;

const now = audioCtx.currentTime;

const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

osc.type="sine";
osc.frequency.setValueAtTime(900,now);
osc.frequency.exponentialRampToValueAtTime(300,now+0.08);

osc.connect(gain);
gain.connect(audioCtx.destination);

gain.gain.setValueAtTime(0.6,now);
gain.gain.exponentialRampToValueAtTime(0.001,now+0.12);

osc.start(now);
osc.stop(now+0.12);
}

/* ================================
THEMES
================================ */

function applyTheme(theme){

document.body.classList.remove(
"pastel",
"night",
"dark",
"training",
"sakura",
"ocean",
"matcha",
"sunset",
"galaxy",
"cyberpunk",
"snow"
);

document.body.classList.add(theme);

localStorage.setItem("theme",theme);

currentTheme = theme;

}

/* ================================
FONTS
================================ */

function applyFont(font){

document.body.classList.remove(
"default",
"pixel",
"retro",
"typewriter",
"cute",
"soft"
);

document.body.classList.add(font);

localStorage.setItem("font",font);

currentFont = font;

}

/* ================================
DAILY STATS
================================ */

function getTodayDateString(){
return new Date().toISOString().split("T")[0];
}

let todayKey = "daily_" + getTodayDateString();

let dailyData = JSON.parse(localStorage.getItem(todayKey)) || {
pomodoros:0,
focusMinutes:0
};

function saveDailyData(){
localStorage.setItem(todayKey, JSON.stringify(dailyData));
}

function updateDailyUI(){
document.getElementById("todayCount").innerText = dailyData.pomodoros;
document.getElementById("todayMinutes").innerText = dailyData.focusMinutes;
}

/* ================================
MESSAGES
================================ */

function showRandomMessage(type){

let messages;

if(type === "work"){
messages = focusMessages;
}else{
messages = breakMessages;
}

const message = messages[Math.floor(Math.random()*messages.length)];

document.getElementById("motivationMessage").innerText = message;

}

/* ================================
TIMER
================================ */

function startTimer(){

if(isRunning) return;

isRunning = true;

clearInterval(interval);

interval = setInterval(()=>{

time--;

updateDisplay();

if(time <= 0){
completeSession();
}

},1000);

}

function pauseTimer(){
clearInterval(interval);
isRunning = false;
}

function resetTimer(){
clearInterval(interval);
isRunning = false;
sessionIndex = 0;
loadSession();
}

function skipSession(){
clearInterval(interval);
isRunning = false;
sessionIndex = (sessionIndex+1) % cyclePattern.length;
loadSession();
}

function completeSession(){

clearInterval(interval);
isRunning = false;

playTing();

if(cyclePattern[sessionIndex] === "work"){

dailyData.pomodoros++;

dailyData.focusMinutes += workDuration/60;

saveDailyData();

updateDailyUI();

}

sessionIndex = (sessionIndex+1) % cyclePattern.length;

loadSession();

startTimer();

}

/* ================================
SESSION LOADING
================================ */

function loadSession(){

const type = cyclePattern[sessionIndex];

const status = document.getElementById("status");

if(type === "work"){
time = workDuration;
status.innerText = "Focus Time";
showRandomMessage("work");
}

if(type === "short"){
time = shortBreak;
status.innerText = "Short Break";
showRandomMessage("break");
}

if(type === "long"){
time = longBreak;
status.innerText = "Long Break";
showRandomMessage("break");
}

updateDisplay();

}

function updateDisplay(){

let m = Math.floor(time/60);
let s = time % 60;

document.getElementById("timer").innerText =
`${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

}

/* ================================
MINI MODE
================================ */

function toggleMiniMode(){

window.electronAPI.toggleMiniMode();

document.body.classList.toggle("mini-mode");

}

/* ================================
GIF
================================ */

function loadGif(){

const img = document.getElementById("motivationGif");

if(gifUrl){
img.src = gifUrl;
img.style.display = "block";
}else{
img.style.display = "none";
}

}

/* ================================
SETTINGS
================================ */

function openSettings(){

document.getElementById("settingsModal").style.display = "flex";

document.getElementById("workInput").value = workDuration/60;
document.getElementById("shortInput").value = shortBreak/60;
document.getElementById("longInput").value = longBreak/60;

document.getElementById("gifInput").value = gifUrl;

document.getElementById("themeSelect").value = currentTheme;

document.getElementById("fontSelect").value = currentFont;

document.getElementById("muteToggle").checked = isMuted;

}

function closeSettings(){

document.getElementById("settingsModal").style.display = "none";

}

function saveSettings(){

const work = parseInt(document.getElementById("workInput").value);

const shortB = parseInt(document.getElementById("shortInput").value);

const longB = parseInt(document.getElementById("longInput").value);

const gif = document.getElementById("gifInput").value;

const selectedTheme = document.getElementById("themeSelect").value;

const selectedFont = document.getElementById("fontSelect").value;

const mute = document.getElementById("muteToggle").checked;

if(work > 0) workDuration = work*60;

if(shortB > 0) shortBreak = shortB*60;

if(longB > 0) longBreak = longB*60;

gifUrl = gif;

isMuted = mute;

applyTheme(selectedTheme);

applyFont(selectedFont);

localStorage.setItem("workDuration",work);
localStorage.setItem("shortBreak",shortB);
localStorage.setItem("longBreak",longB);
localStorage.setItem("motivationGif",gif);
localStorage.setItem("muted",mute);

loadGif();

if(!isRunning) loadSession();

closeSettings();

}

/* ================================
IDLE FADE
================================ */

let fadeTimer;

const appElement = document.querySelector(".app");

appElement.addEventListener("mouseenter",()=>{

clearTimeout(fadeTimer);

appElement.classList.remove("idle");

});

appElement.addEventListener("mouseleave",()=>{

fadeTimer = setTimeout(()=>{

appElement.classList.add("idle");

},1500);

});

/* ================================
INIT
================================ */

document.addEventListener("DOMContentLoaded",()=>{

updateDisplay();

updateDailyUI();

loadSession();

loadGif();

applyTheme(currentTheme);

applyFont(currentFont);

appElement.classList.add("idle");

document.querySelectorAll("button").forEach(btn=>{

btn.addEventListener("click",()=>{

initAudio();

playSoftClick();

});

});

});
