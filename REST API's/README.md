## 📘 REST API in Node.js – Complete Theory with Examples

### ✅ What is a REST API?

A **REST API (Representational State Transfer API)** is a web service that follows REST architectural principles. It allows interaction between a client and server through standard **HTTP methods** (GET, POST, PUT, DELETE). REST APIs treat everything as a **resource** that can be created, read, updated, or deleted (commonly known as CRUD operations).

---

### 🛠 Why Use Node.js for REST APIs?

Node.js is built on Chrome’s V8 engine and uses **non-blocking I/O** operations, making it ideal for building scalable and fast RESTful services. The most common framework used is **Express.js**, which simplifies routing and middleware handling.

---

### 🌐 Key Concepts

- **Resource**: Any data entity, e.g., user, product, task.
- **Endpoint**: A specific URL pattern used to interact with a resource.
- **Statelessness**: Each API call is independent and carries all necessary information.
- **JSON**: Data format used for request and response.

---

### 📡 Common HTTP Methods and Examples

| Method  | Description             | Example Route          | Example Functionality                   |
|---------|-------------------------|------------------------|------------------------------------------|
| GET     | Fetch data              | `/api/users`           | Get list of all users                    |
| GET     | Fetch specific data     | `/api/users/:id`       | Get a user by ID                         |
| POST    | Create new data         | `/api/users`           | Add a new user                           |
| PUT     | Update existing data    | `/api/users/:id`       | Update user info by ID                   |
| DELETE  | Delete data             | `/api/users/:id`       | Remove a user                            |

---

### 🧪 Example: Building a Simple REST API in Node.js

```js
const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// GET all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  res.json(user || { error: 'User not found' });
});

// POST create new user
app.post('/api/users', (req, res) => {
  const newUser = { id: users.length + 1, name: req.body.name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    user.name = req.body.name;
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```
📦 Folder Structure (Recommended)

project/
│
├── routes/             # All route definitions
├── controllers/        # Business logic
├── models/             # Data structure (optional with DB)
├── middleware/         # Auth, logging, error handling
├── app.js              # Entry point
└── package.json        # Project metadata
