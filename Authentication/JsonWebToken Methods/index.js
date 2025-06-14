const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
app.get('/books/', (request, response) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid Access Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token')
      } else {
        const getBooksQuery = `
            SELECT
              *
            FROM
             book
            ORDER BY
              book_id;`
        const booksArray = await db.all(getBooksQuery)
        response.send(booksArray)
      }
    })
  }
})
// Get Books API
// app.get('/books/', async (request, response) => {
//   let jwtToken
//   const authHeaders = request.headers['authorization']
//   if (authHeaders !== undefined) {
//     jwtToken = authHeaders.split(' ')[1]
//   }
//   if (jwtToken === undefined) {
//     response.status(401)
//     response.send('Invalid Access Token')
//   } else {
//     jwt.verify(jwtToken, 'My_lock', async (error, payload) => {
//       if (error) {
//         response.status(401)
//         response.send('Invalid Access Token')
//       } else {
//         const getBooksQuery = `
//         SELECT
//           *
//         FROM
//           book
//         ORDER BY
//           book_id;`
//         const booksArray = await db.all(getBooksQuery)
//         response.send(booksArray)
//       }
//     })
//   }
// })

// User Register API
app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `
    SELECT 
      * 
    FROM 
      user 
    WHERE 
      username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    const createUserQuery = `
     INSERT INTO
      user (username, name, password, gender, location)
     VALUES
      (
       '${username}',
       '${name}',
       '${hashedPassword}',
       '${gender}',
       '${location}'  
      );`
    await db.run(createUserQuery)
    response.send('User created successfully')
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

// User Login API
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `
    SELECT
      *
    FROM
      user
    WHERE 
      username = '${username}';`
  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid User')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(payload, 'My_Lock')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})
