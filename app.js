import config from "./apikey.js"

// Get references to DOM elements
const clockElement = document.getElementById('clock');
const weatherElement = document.getElementById('weather');
const backgroundImageElement = document.getElementById('background-image');
const loginContainer = document.getElementById('login-container');
const todoContainer = document.getElementById('todo-container');
const greetingElement = document.getElementById('greeting');
const todoListElement = document.getElementById('todo-list');

// Helper function to show the current time
function showClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockElement.innerText = `${hours}:${minutes}:${seconds}`;
}

// Update the clock every second
showClock();
setInterval(showClock, 1000);

// Random background image from a list of predefined images
const backgroundImages = [
  'https://plus.unsplash.com/premium_photo-1678566111481-8e275550b700?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1623520333087-62b8793e3d23?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1623520527569-fee1da87f598?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1623479322729-28b25c16b011?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
backgroundImageElement.src = randomImage;

// Weather and location
function getWeather(lat, lon) {
  const apiKey = config.API_KEY; // Replace with your OpenWeather API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const temp = data.main.temp;
      const weather = data.weather[0].description;
      weatherElement.innerText = `Temperature: ${temp}°C, ${weather}`;
    })
    .catch(error => console.error('Error fetching weather:', error));
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      getWeather(latitude, longitude);
    });
  } else {
    weatherElement.innerText = "Geolocation is not supported by this browser.";
  }
}

getLocation();

// LocalStorage-based login
const savedUsername = localStorage.getItem('username');

if (savedUsername) {
  showTodoApp(savedUsername);
} else {
  loginContainer.style.display = 'block';
}

document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  localStorage.setItem('username', username);
  showTodoApp(username);
});

function showTodoApp(username) {
  loginContainer.style.display = 'none';
  todoContainer.style.display = 'block';
  greetingElement.innerText = `Hello, ${username}`;
  loadTodos();
}

// LocalStorage-based Todo List
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  todoListElement.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" data-index="${index}" ${todo.completed ? 'checked' : ''}>
            <span class="${todo.completed ? 'completed' : ''}">${index + 1}. ${todo.text}</span>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
    todoListElement.appendChild(li);
  });
}

// Add new todo and save it to localStorage
document.getElementById('todo-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const todoInput = document.getElementById('todo-input');
  const todoText = todoInput.value;
  todoInput.value = '';

  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos.push({ text: todoText, completed: false });
  localStorage.setItem('todos', JSON.stringify(todos));

  loadTodos();
});

// Delete or complete a todo item
todoListElement.addEventListener('click', function (event) {
  const todos = JSON.parse(localStorage.getItem('todos')) || [];

  // Delete functionality
  if (event.target.classList.contains('delete-btn')) {
    const index = event.target.getAttribute('data-index');
    todos.splice(index, 1);  // Remove the selected item
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();  // Refresh the todo list
  }

  // Checkbox complete functionality
  if (event.target.classList.contains('todo-checkbox')) {
    const index = event.target.getAttribute('data-index');
    todos[index].completed = event.target.checked;  // Mark the item as completed or not
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();  // Refresh the todo list
  }
});
