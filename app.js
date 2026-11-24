// ==========================
// 全域變數
// ==========================

let questions = [];

let currentQuiz = [];

let currentQuestionIndex = 0;

let score = 0;

let currentQuestion = null;


// ==========================
// LocalStorage
// ==========================

const STORAGE_KEYS = {

wrong: "drone_wrong_questions",

favorite: "drone_favorite_questions",

stats: "drone_exam_stats",

history: "drone_exam_history"

};


// ==========================
// 初始化
// ==========================

window.onload = async () => {

await loadQuestions();

updateDashboard();

};


// ==========================
// 載入題庫
// ==========================

async function loadQuestions(){

try{

const response =
await fetch("questions.json");

questions =
await response.json();

document.getElementById(
"questionCount"
).innerText =
`目前題庫 ${questions.length} 題`;

}catch(error){

console.error(error);

alert("題庫載入失敗");

}

}


// ==========================
// 工具
// ==========================

function shuffle(arr){

return [...arr].sort(
()=>Math.random()-0.5
);

}

function save(key,data){

localStorage.setItem(
key,
JSON.stringify(data)
);

}

function load(key){

return JSON.parse(
localStorage.getItem(key)
) || [];

}


// ==========================
// 切換畫面
// ==========================

function hideAllPanels(){

document
.getElementById("quizContainer")
.classList.add("hidden");

document
.getElementById("resultContainer")
.classList.add("hidden");

document
.getElementById("searchContainer")
.classList.add("hidden");

document
.getElementById("favoriteContainer")
.classList.add("hidden");

document
.getElementById("wrongContainer")
.classList.add("hidden");

document
.getElementById("statisticsPanel")
.classList.add("hidden");

}

function backHome(){

hideAllPanels();

window.scrollTo({
top:0,
behavior:"smooth"
});

updateDashboard();

}


// ==========================
// 隨機測驗
// ==========================

function startRandom(count){

currentQuiz =
shuffle(questions)
.slice(0,count);

startQuiz();

}


// ==========================
// 模擬考
// ==========================

function startMockExam(){

currentQuiz =
shuffle(questions)
.slice(0,50);

startQuiz();

}


// ==========================
// 章節練習
// ==========================

function practiceChapter(chapter){

currentQuiz =
questions.filter(q =>
q.chapter.includes(chapter)
);

startQuiz();

}


// ==========================
// 開始測驗
// ==========================

function startQuiz(){

currentQuestionIndex = 0;

score = 0;

hideAllPanels();

document
.getElementById("quizContainer")
.classList.remove("hidden");

showQuestion();

}


// ==========================
// 顯示題目
// ==========================

function showQuestion(){

if(
currentQuestionIndex >=
currentQuiz.length
){

finishQuiz();

return;

}

currentQuestion =
currentQuiz[
currentQuestionIndex
];

document
.getElementById("questionTitle")
.innerText =
currentQuestion.question;


document
.getElementById("progressText")
.innerText =
`第 ${
currentQuestionIndex + 1
} / ${
currentQuiz.length
} 題`;


document
.getElementById("scoreText")
.innerText =
`分數：${score}`;


document
.getElementById("progressBar")
.style.width =
(
currentQuestionIndex
/
currentQuiz.length
*100
)+"%";


const optionsArea =
document.getElementById(
"optionsArea"
);

optionsArea.innerHTML = "";


Object.entries(
currentQuestion.options
).forEach(([key,value])=>{

const btn =
document.createElement(
"button"
);

btn.className =
"option-button";

btn.innerHTML =
`<b>${key}</b>. ${value}`;

btn.onclick =
()=>checkAnswer(key);

optionsArea.appendChild(btn);

});

}


// ==========================
// 判斷答案
// ==========================

function checkAnswer(choice){

const buttons =
document.querySelectorAll(
".option-button"
);

buttons.forEach(
b=>b.disabled=true
);

const answer =
currentQuestion.answer;

buttons.forEach(btn=>{

const text =
btn.innerText.trim();

if(
text.startsWith(answer)
){

btn.classList.add(
"correct"
);

}

});


if(choice===answer){

score++;

}else{

buttons.forEach(btn=>{

if(
btn.innerText.startsWith(choice)
){

btn.classList.add(
"wrong"
);

}

});

saveWrongQuestion(
currentQuestion
);

}

updateStats(
currentQuestion,
choice===answer
);

setTimeout(()=>{

currentQuestionIndex++;

showQuestion();

},1000);

}


// ==========================
// 錯題庫
// ==========================

function saveWrongQuestion(q){

let wrong =
load(STORAGE_KEYS.wrong);

const exists =
wrong.some(
item =>
item.id===q.id &&
item.question===q.question
);

if(!exists){

wrong.push(q);

save(
STORAGE_KEYS.wrong,
wrong
);

}

}


// ==========================
// 收藏
// ==========================

function addFavoriteCurrent(){

if(!currentQuestion)
return;

let favorites =
load(STORAGE_KEYS.favorite);

const exists =
favorites.some(
q =>
q.id===currentQuestion.id
);

if(!exists){

favorites.push(
currentQuestion
);

save(
STORAGE_KEYS.favorite,
favorites
);

alert(
"已加入收藏"
);

}

}


// ==========================
// 顯示收藏
// ==========================

function showFavorites(){

hideAllPanels();

document
.getElementById(
"favoriteContainer"
)
.classList.remove(
"hidden"
);

const list =
load(
STORAGE_KEYS.favorite
);

let html = "";

list.forEach(q=>{

html += `
<div class="card-item">

<b>${q.chapter}</b>

<br><br>

${q.question}

</div>
`;

});

document
.getElementById(
"favoriteList"
)
.innerHTML =
html || "尚無收藏題";

}


// ==========================
// 顯示錯題
// ==========================

function showWrongQuestions(){

hideAllPanels();

document
.getElementById(
"wrongContainer"
)
.classList.remove(
"hidden"
);

const list =
load(
STORAGE_KEYS.wrong
);

let html="";

list.forEach(q=>{

html+=`
<div class="card-item">

<b>${q.chapter}</b>

<br><br>

${q.question}

</div>
`;

});

document
.getElementById(
"wrongList"
)
.innerHTML =
html || "尚無錯題";

}


// ==========================
// 題目搜尋
// ==========================

function searchQuestion(){

const keyword =
document
.getElementById(
"keyword"
)
.value
.trim();

if(!keyword){

alert("請輸入關鍵字");

return;

}

const result =
questions.filter(q =>

q.question.includes(keyword)

||

JSON.stringify(q.options)
.includes(keyword)

||

q.chapter.includes(keyword)

);

hideAllPanels();

document
.getElementById(
"searchContainer"
)
.classList.remove(
"hidden"
);

const container =
document
.getElementById(
"searchList"
);

if(result.length===0){

container.innerHTML =
"找不到符合條件的題目";

return;

}

let html = `
<h3>
找到 ${result.length} 題
</h3>
<br>
`;

result.forEach(q=>{

html += `
<div class="card-item">

<b>${q.chapter}</b>

<br><br>

${q.question}

</div>
`;

});

container.innerHTML = html;

}


// ==========================
// 錯題重練
// ==========================

function practiceWrongQuestions(){

const wrong =
load(STORAGE_KEYS.wrong);

if(wrong.length===0){

alert(
"目前沒有錯題"
);

return;

}

currentQuiz =
shuffle(wrong);

startQuiz();

}


// ==========================
// 清除錯題
// ==========================

function clearWrongQuestions(){

if(
!confirm(
"確定清空錯題庫？"
)
){

return;

}

save(
STORAGE_KEYS.wrong,
[]
);

showWrongQuestions();

updateDashboard();

}


// ==========================
// 統計資料
// ==========================

function getDefaultStats(){

return{

totalAnswered:0,

totalCorrect:0,

chapter:{},

daily:[]
};

}


function getStats(){

const data =
localStorage.getItem(
STORAGE_KEYS.stats
);

if(!data){

return getDefaultStats();

}

return JSON.parse(data);

}


function updateStats(
question,
isCorrect
){

let stats =
getStats();

stats.totalAnswered++;

if(isCorrect){

stats.totalCorrect++;

}

const chapter =
question.chapter;

if(!stats.chapter[chapter]){

stats.chapter[chapter]={

total:0,

correct:0

};

}

stats.chapter[chapter]
.total++;

if(isCorrect){

stats.chapter[chapter]
.correct++;

}

updateDailyHistory(
isCorrect
);

localStorage.setItem(
STORAGE_KEYS.stats,
JSON.stringify(stats)
);

}


// ==========================
// 每日紀錄
// ==========================

function updateDailyHistory(
isCorrect
){

let history =
load(
STORAGE_KEYS.history
);

const today =
new Date()
.toLocaleDateString(
"zh-TW"
);

let day =
history.find(
d => d.date===today
);

if(!day){

day={

date:today,

total:0,

correct:0

};

history.push(day);

}

day.total++;

if(isCorrect){

day.correct++;

}

if(history.length>30){

history.shift();

}

save(
STORAGE_KEYS.history,
history
);

}


// ==========================
// 顯示統計
// ==========================

function showStatistics(){

hideAllPanels();

document
.getElementById(
"statisticsPanel"
)
.classList.remove(
"hidden"
);

updateDashboard();

drawChart();

}


// ==========================
// 更新首頁統計
// ==========================

function updateDashboard(){

const stats =
getStats();

const favorites =
load(
STORAGE_KEYS.favorite
);

const wrong =
load(
STORAGE_KEYS.wrong
);

document
.getElementById(
"totalAnswered"
)
.innerText =
stats.totalAnswered;

let rate = 0;

if(stats.totalAnswered){

rate =
(
stats.totalCorrect
/
stats.totalAnswered
*
100
).toFixed(1);

}

document
.getElementById(
"correctRate"
)
.innerText =
rate + "%";


document
.getElementById(
"favoriteCount"
)
.innerText =
favorites.length;


document
.getElementById(
"wrongCount"
)
.innerText =
wrong.length;

}


// ==========================
// 畫圖
// ==========================

let chartInstance = null;

function drawChart(){

const history =
load(
STORAGE_KEYS.history
);

const last7 =
history.slice(-7);

const labels =
last7.map(
d => d.date.substring(5)
);

const rates =
last7.map(d=>{

if(d.total===0){

return 0;

}

return (
d.correct
/
d.total
*
100
).toFixed(1);

});

const ctx =
document
.getElementById(
"progressChart"
);

if(chartInstance){

chartInstance.destroy();

}

chartInstance =
new Chart(ctx,{

type:"line",

data:{

labels,

datasets:[{

label:"正確率",

data:rates,

borderWidth:3,

fill:false

}]

},

options:{

responsive:true,

plugins:{

legend:{
display:true
}

}

}

});

}


// ==========================
// 測驗結束
// ==========================

function finishQuiz(){

hideAllPanels();

document
.getElementById(
"resultContainer"
)
.classList.remove(
"hidden"
);

const percent =
(
score
/
currentQuiz.length
*
100
)
.toFixed(1);

document
.getElementById(
"finalScore"
)
.innerText =
percent + "%";

let message = "";

if(percent>=90){

message =
"🏆 非常優秀";

}
else if(percent>=80){

message =
"🎉 已接近正式考試水準";

}
else if(percent>=70){

message =
"👍 表現不錯";

}
else if(percent>=60){

message =
"📚 建議多加練習";

}
else{

message =
"💪 建議先完成章節複習";

}

document
.getElementById(
"finalText"
)
.innerHTML =

`
答對 ${score} 題

<br><br>

共 ${currentQuiz.length} 題

<br><br>

${message}
`;

document
.getElementById(
"progressBar"
)
.style.width = "100%";

updateDashboard();

}


// ==========================
// 鍵盤快捷鍵
// ==========================

document.addEventListener(
"keydown",
(e)=>{

if(
document
.getElementById(
"quizContainer"
)
.classList.contains(
"hidden"
)
){

return;

}

if(e.key==="1"){

checkAnswer("A");

}

if(e.key==="2"){

checkAnswer("B");

}

if(e.key==="3"){

checkAnswer("C");

}

if(e.key==="4"){

checkAnswer("D");

}

}
);


// ==========================
// Debug
// ==========================

window.debugStats = ()=>{

console.log(
getStats()
);

};

window.debugWrong = ()=>{

console.log(
load(
STORAGE_KEYS.wrong
)
);

};

window.debugFavorite = ()=>{

console.log(
load(
STORAGE_KEYS.favorite
)
);

};

console.log(
"Drone Exam System Ready 🚁"
);