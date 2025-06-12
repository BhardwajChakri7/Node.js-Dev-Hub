const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'goodreads.db')
app.use(express.json())
let db = null
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('The server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDatabaseAndServer()
app.get('/books/', async (request, response) => {
  const getAllBooksQuery = `SELECT *
  FROM book ORDER BY book_id;`
  const booksArray = await db.all(getAllBooksQuery)
  response.send(booksArray)
})

app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const getBookQuery = `
  SELECT *
  FROM book
  WHERE book_id = ${bookId};
  `
  const book = await db.get(getBookQuery)
  response.send(book)
})

app.post('/books/', async (request, response) => {
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`
  const dbresponse = await db.run(addBookQuery)
  const bookId = dbresponse.lastID
  response.send(`book_id:${bookId}`)
})

app.put('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`

  await db.run(updateBookQuery)
  response.send('Book Updated SucessFully')
})
app.delete('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`
  await db.run(deleteBookQuery)
  response.send('Book Deleted SucessFully')
})

app.get('/authors/:authorsId/books/', async (request, response) => {
  const {authorsId} = request.params
  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authorsId};`
  const booksArray = await db.all(getAuthorBooksQuery)
  response.send(booksArray)
})
