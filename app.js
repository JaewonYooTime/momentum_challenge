import config from './apikey.js'

// Get references to DOM elements
const clockElement = document.getElementById('clock');
const weatherElement = document.getElementById('weather');
const locationElement = document.getElementById('location');
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
setInterval(showClock, 1000);

// Random background image from a list of predefined images
const backgroundImages = [
  'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg',  // Nature 1
  'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg', // Nature 2
  'https://images.pexels.com/photos/301640/pexels-photo-301640.jpeg',  // City 1
  'https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg',  // Beach
  'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg'  // Mountains
];

const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
backgroundImageElement.src = randomImage;

// Weather and location
function getWeather(lat, lon) {
  const apiKey = config.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const temp = data.main.temp;
      const weather = data.weather[0].description;
      const location = data.name;  // Get location name (city)
      weatherElement.innerText = `Temperature: ${temp}°C, ${weather}`;
      locationElement.innerText = `Location: ${location}`;  // Display the city name
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
