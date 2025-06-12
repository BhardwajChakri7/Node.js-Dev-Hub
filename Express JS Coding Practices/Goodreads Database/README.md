# 📚 Goodreads Book API

This is a simple RESTful API built using **Node.js**, **Express.js**, and **SQLite** that manages a collection of books and authors, inspired by Goodreads. It supports basic CRUD operations on books and querying books by author.

---

## 🚀 Features

- Add a new book
- View all books
- View a specific book by ID
- Update book details
- Delete a book
- Get all books by a specific author

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- SQLite
- `sqlite3` and `sqlite` npm packages

---

## 📁 Project Structure

```
project/
│
├── goodreads.db          # SQLite database file
├── index.js              # Main server file
├── package.json
└── README.md             # You're here!
```

---

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/goodreads-api.git
cd goodreads-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Ensure `goodreads.db` exists**

Make sure the `goodreads.db` file is in the same directory as `index.js`. This file should have a table called `book` with columns like `book_id`, `title`, `author_id`, `rating`, etc.

4. **Run the server**

```bash
node index.js
```

Server will start at:  
📍 `http://localhost:3000/`

---

## 📚 API Endpoints

### 🔍 Get All Books

**GET** `/books/`

Returns all books from the database.

---

### 🔍 Get Book by ID

**GET** `/books/:bookId/`

Returns details of a specific book.

---

### ➕ Add New Book

**POST** `/books/`

**Request Body:**

```json
{
  "title": "Sample Book",
  "authorId": 1,
  "rating": 4.5,
  "ratingCount": 100,
  "reviewCount": 25,
  "description": "Book description",
  "pages": 300,
  "dateOfPublication": "2023-10-12",
  "editionLanguage": "English",
  "price": 499,
  "onlineStores": "Amazon, Flipkart"
}
```

**Response:**

```
book_id:1
```

---

### ✏️ Update Book

**PUT** `/books/:bookId/`

Updates the book with the given `bookId`.

**Request Body:** Same as POST `/books/`

**Response:**

```
Book Updated Successfully
```

---

### ❌ Delete Book

**DELETE** `/books/:bookId/`

Deletes the book with the given `bookId`.

**Response:**

```
Book Deleted Successfully
```

---

### 👤 Get All Books by Author

**GET** `/authors/:authorsId/books/`

Returns all books written by the author with the given `authorsId`.

---

## ⚠️ Notes

- Avoid using string interpolation in SQL queries in production. Use parameterized queries to prevent SQL injection.
- The database should contain a table named `book` with appropriate schema.

---

## 📬 License

This project is open-source and available under the MIT License.
