const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const emptyHint = document.getElementById('empty-hint');
const clearCompletedButton = document.getElementById('clear-completed');

const STORAGE_KEY = 'lab18-todos';

// Кожна справа має унікальний id, текст та ознаку виконання.
let todos = loadTodos();

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos !== null) {
      const parsedTodos = JSON.parse(savedTodos);
      if (Array.isArray(parsedTodos)) return parsedTodos;
    }
  } catch (error) {
    console.error('Не вдалося завантажити список справ:', error);
  }

  // Початкові приклади відображаються лише під час першого запуску.
  return [
    { id: 1, title: 'Вивчити HTML', completed: true },
    { id: 2, title: 'Вивчити CSS', completed: true },
    { id: 3, title: 'Вивчити JavaScript', completed: false }
  ];
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

// Створює HTML-рядок для однієї справи.
function renderTodo(todo) {
  const checked = todo.completed ? 'checked' : '';
  const completedClass = todo.completed ? 'completed' : '';

  return `
    <li class="list-group-item todo-item" data-id="${todo.id}">
      <input
        class="form-check-input todo-check"
        type="checkbox"
        id="todo-${todo.id}"
        data-action="check"
        ${checked}
        aria-label="Позначити справу виконаною"
      >
      <label class="todo-text ${completedClass}" for="todo-${todo.id}">
        ${escapeHtml(todo.title)}
      </label>
      <button class="btn btn-sm delete-btn" type="button" data-action="delete">
        Видалити
      </button>
    </li>
  `;
}

// Відображає весь масив справ та оновлює лічильники.
function render(todosArray) {
  list.innerHTML = todosArray.map(renderTodo).join('');
  emptyHint.hidden = todosArray.length !== 0;
  updateCounter();
}

// Оновлює загальну кількість та кількість незавершених справ.
function updateCounter() {
  itemCountSpan.textContent = todos.length;
  uncheckedCountSpan.textContent = todos.filter(todo => !todo.completed).length;
}

// Додає нову справу до масиву.
function newTodo() {
  const title = todoInput.value.trim();
  if (!title) {
    todoInput.focus();
    return;
  }

  todos.push({
    id: Date.now(),
    title,
    completed: false
  });

  saveTodos();
  render(todos);
  todoForm.reset();
  todoInput.focus();
}

// Видаляє справу за її id.
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  render(todos);
}

// Змінює статус виконання справи.
function checkTodo(id, isCompleted) {
  const todo = todos.find(item => item.id === id);
  if (!todo) return;

  todo.completed = isCompleted;
  saveTodos();
  render(todos);
}

// Обробка додавання справи.
todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  newTodo();
});

// Обробка позначення та видалення через делегування подій.
list.addEventListener('change', (event) => {
  if (event.target.matches('[data-action="check"]')) {
    const item = event.target.closest('[data-id]');
    checkTodo(Number(item.dataset.id), event.target.checked);
  }
});

list.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (deleteButton) {
    const item = deleteButton.closest('[data-id]');
    deleteTodo(Number(item.dataset.id));
  }
});

// Видаляє всі виконані справи.
clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render(todos);
});

// Початкове відображення даних.
render(todos);
