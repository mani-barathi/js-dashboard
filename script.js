const clock = document.querySelector(".clock");
const mainText = document.querySelector(".main-text");
const quote = document.querySelector(".quote");
const weather = document.querySelector(".weather");
const city = document.querySelector(".city");
const bg = document.querySelector(".bg");

const taskContainer = document.querySelector(".task-container");
const taskInput = document.querySelector(".task-input");
const taskForm = document.querySelector(".task-form");
const noTaskElement = document.querySelector(".no-task-found");

const userName = "Mani";
const WEATHER_API_KEY = ""; // get API key from  https://openweathermap.org/
const UNSPLASH_API_KEY = ""; // get API key from https://unsplash.com/oauth/applications
const cityName = "Chennai";
let tasks = [];

function setupClock() {
  const dateObj = new Date();
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();

  if (hours <= 9) {
    hours = `0${hours}`;
  }

  if (minutes <= 9) {
    minutes = `0${minutes}`;
  }

  let time = `${hours}:${minutes}`;
  clock.textContent = time;

  if (hours >= 5 && hours < 12) {
    mainText.textContent = `Good Morning, ${userName}`;
  } else if (hours >= 12 && hours < 17) {
    mainText.textContent = `Good Afternoon, ${userName}`;
  } else if (hours >= 17 && hours < 20) {
    mainText.textContent = `Good Evening, ${userName}`;
  } else {
    mainText.textContent = `Good Night, ${userName}`;
  }
}

async function getQuote() {
  try {
    const url = "https://api.quotable.io/random";
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.content);
    quote.textContent = data.content;
  } catch (e) {
    console.log("error", e);
  }
}

async function getWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    let temp = data.main.temp;
    const description = data.weather[0].description;
    temp = Math.floor(temp);
    city.textContent = cityName;
    weather.textContent = `${temp}c, ${description}`;
    console.log("weather", data);
  } catch (e) {
    console.log("error", e);
  }
}

async function getImage() {
  try {
    const query = "wallpapers";
    const url = `https://api.unsplash.com/photos/random/?orientation=landscape&count=1&client_id=${UNSPLASH_API_KEY}&query=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    const imageUrl = data[0].urls.regular;
    bg.style.backgroundImage = `url("${imageUrl}")`;
    saveLocalStorage("imageUrl", imageUrl);
    saveLocalStorage("time", new Date());
    console.log("image", data);
  } catch (e) {
    console.log("error", e);
  }
}

function saveLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

function toggleTaskCompletion(event) {
  console.log("xyz toggle Fnction");
  const p = event.target;
  const id = p.id;
  console.log("p id", id);
  console.log("tasks", tasks);

  tasks = tasks.map((task) => {
    if (task.id === id) {
      console.log("task.id, id", task.id, id);
      task.completed = !task.completed;
    }
    return task;
  });

  p.classList.toggle("completed");
  saveLocalStorage("tasks", tasks);
}

function removeTask(event) {
  console.log("xyz remove Fnction");
  const id = event.target.id;
  tasks = tasks.filter((task) => task.id !== id);
  const parent = event.target.parentElement;
  parent.remove();

  if (tasks.length === 0) noTaskElement.style.display = "block";
  saveLocalStorage("tasks", tasks);
}

function createTask(task) {
  const div = document.createElement("div");
  const p = document.createElement("p");
  const button = document.createElement("button");
  div.classList.add("task");

  p.textContent = task.title;
  p.id = task.id;
  button.id = task.id;
  button.innerHTML = "&minus;";

  p.onclick = toggleTaskCompletion;

  if (task.completed) {
    p.classList.add("completed");
  }

  button.addEventListener("click", removeTask);

  div.append(p, button);
  taskContainer.append(div);
}

function handleTaskSubmission(event) {
  event.preventDefault();

  const text = taskInput.value;
  if (text === "") return;

  const task = {
    id: crypto.randomUUID(),
    title: text,
    completed: false,
  };

  tasks.push(task);
  createTask(task);

  saveLocalStorage("tasks", tasks);

  taskInput.value = "";
  noTaskElement.style.display = "none";
}

function main() {
  taskForm.addEventListener("submit", handleTaskSubmission);

  const imageUrl = getLocalStorage("imageUrl");
  const prevTime = getLocalStorage("time");

  if (prevTime) {
    const retrivedDateTime = new Date(prevTime);
    const currentDateTime = new Date();

    const currentDateTimeInMilliSecs = currentDateTime.getTime();
    const retrivedDateTimeInMilliSecs = retrivedDateTime.getTime();

    const timeDiff = currentDateTimeInMilliSecs - retrivedDateTimeInMilliSecs;
    const timeDiffInSecs = Math.abs(timeDiff / 1000);
    const timeDiffInMins = Math.abs(timeDiffInSecs / 60);

    if (timeDiffInMins > 10) {
      getImage();
    } else {
      bg.style.backgroundImage = `url("${imageUrl}")`;
    }
  } else {
    getImage();
  }

  const retrivedTasks = getLocalStorage("tasks");
  if (retrivedTasks && retrivedTasks.length > 0) {
    tasks = retrivedTasks;
    retrivedTasks.forEach((task) => {
      createTask(task);
    });
  } else {
    noTaskElement.style.display = "block";
  }

  setupClock();
  setInterval(setupClock, 1000 * 60);
  // getImage();
  getQuote();
  getWeather();
}

main();
