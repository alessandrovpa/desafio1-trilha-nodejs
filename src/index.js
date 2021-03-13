const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(400).json({ error: "Usuário não encontrato" });
  }
  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const veirfyUserAlreadyExist = users.find(
    (user) => user.username === username
  );
  if (veirfyUserAlreadyExist) {
    return response.status(400).json({ error: "Usuário já cadastrado" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Essa tarefa não existe" });
  }
  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;
  return response.json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Essa tarefa não existe" });
  }
  user.todos[todoIndex].done = true;
  return response.json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (!user.todos[todoIndex]) {
    return response.status(404).json({ error: "Essa tarefa não existe" });
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;
