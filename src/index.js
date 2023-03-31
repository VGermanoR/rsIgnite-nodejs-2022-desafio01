const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  if (!users.some((user) => user.username === username)) {
    return response.status(404).json({ error: "User not found" });
  }
  request.username = username;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists" });
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
  const { username } = request;

  const todos = users.find((user) => user.username === username).todos;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  users.find((user) => user.username === username).todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;
  const { title, deadline } = request.body;

  const todo = users
    .find((user) => user.username === username)
    .todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const todo = users
    .find((user) => user.username === username)
    .todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not found" });

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
