const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {format, isValid, parse} = require('date-fns')

app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// Utility validation functions
const isValidStatus = status =>
  ['TO DO', 'IN PROGRESS', 'DONE'].includes(status)

const isValidPriority = priority => ['HIGH', 'MEDIUM', 'LOW'].includes(priority)

const isValidCategory = category =>
  ['WORK', 'HOME', 'LEARNING'].includes(category)

const isValidDueDate = dueDate => {
  const parsedDate = parse(dueDate, 'yyyy-MM-dd', new Date())
  return isValid(parsedDate)
}

const convertTodo = todo => ({
  id: todo.id,
  todo: todo.todo,
  priority: todo.priority,
  status: todo.status,
  category: todo.category,
  dueDate: todo.due_date,
})

// API 1: GET /todos/
app.get('/todos/', async (request, response) => {
  const {search_q = '', status, priority, category} = request.query

  if (status && !isValidStatus(status)) {
    return response.status(400).send('Invalid Todo Status')
  }
  if (priority && !isValidPriority(priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }
  if (category && !isValidCategory(category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  let query = `
    SELECT * FROM todo
    WHERE todo LIKE '%${search_q}%'
  `

  if (status) query += ` AND status = '${status}'`
  if (priority) query += ` AND priority = '${priority}'`
  if (category) query += ` AND category = '${category}'`

  const data = await db.all(query)
  response.send(data.map(convertTodo))
})

// API 2: GET /todos/:todoId/
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todo = await db.get(`SELECT * FROM todo WHERE id = ?`, [todoId])
  response.send(convertTodo(todo))
})

// API 3: GET /agenda/
app.get('/agenda/', async (request, response) => {
  let {date} = request.query
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date())

  if (!isValid(parsedDate)) {
    return response.status(400).send('Invalid Due Date')
  }

  date = format(parsedDate, 'yyyy-MM-dd')
  const todos = await db.all(`SELECT * FROM todo WHERE due_date = ?`, [date])
  response.send(todos.map(convertTodo))
})

// API 4: POST /todos/
app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status, category, dueDate} = request.body

  if (!isValidStatus(status)) {
    return response.status(400).send('Invalid Todo Status')
  }
  if (!isValidPriority(priority)) {
    return response.status(400).send('Invalid Todo Priority')
  }
  if (!isValidCategory(category)) {
    return response.status(400).send('Invalid Todo Category')
  }

  const parsedDate = parse(dueDate, 'yyyy-MM-dd', new Date())
  if (!isValid(parsedDate)) {
    return response.status(400).send('Invalid Due Date')
  }
  dueDate = format(parsedDate, 'yyyy-MM-dd')

  const query = `
    INSERT INTO todo (id, todo, priority, status, category, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  await db.run(query, [id, todo, priority, status, category, dueDate])
  response.send('Todo Successfully Added')
})

// API 5: PUT /todos/:todoId/
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateField = ''
  let updateValue = ''

  const existingTodo = await db.get(`SELECT * FROM todo WHERE id = ?`, [todoId])

  const updatedTodo = {
    todo: requestBody.todo ?? existingTodo.todo,
    status: requestBody.status ?? existingTodo.status,
    priority: requestBody.priority ?? existingTodo.priority,
    category: requestBody.category ?? existingTodo.category,
    due_date: requestBody.dueDate ?? existingTodo.due_date,
  }

  if (requestBody.status !== undefined) {
    if (!isValidStatus(requestBody.status)) {
      return response.status(400).send('Invalid Todo Status')
    }
    updateField = 'Status'
    updateValue = requestBody.status
  } else if (requestBody.priority !== undefined) {
    if (!isValidPriority(requestBody.priority)) {
      return response.status(400).send('Invalid Todo Priority')
    }
    updateField = 'Priority'
    updateValue = requestBody.priority
  } else if (requestBody.todo !== undefined) {
    updateField = 'Todo'
    updateValue = requestBody.todo
  } else if (requestBody.category !== undefined) {
    if (!isValidCategory(requestBody.category)) {
      return response.status(400).send('Invalid Todo Category')
    }
    updateField = 'Category'
    updateValue = requestBody.category
  } else if (requestBody.dueDate !== undefined) {
    const parsedDate = parse(requestBody.dueDate, 'yyyy-MM-dd', new Date())
    if (!isValid(parsedDate)) {
      return response.status(400).send('Invalid Due Date')
    }
    updatedTodo.due_date = format(parsedDate, 'yyyy-MM-dd')
    updateField = 'Due Date'
    updateValue = updatedTodo.due_date
  }

  await db.run(
    `UPDATE todo
     SET todo = ?, status = ?, priority = ?, category = ?, due_date = ?
     WHERE id = ?`,
    [
      updatedTodo.todo,
      updatedTodo.status,
      updatedTodo.priority,
      updatedTodo.category,
      updatedTodo.due_date,
      todoId,
    ],
  )

  response.send(`${updateField} Updated`)
})

// API 6: DELETE /todos/:todoId/
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  await db.run(`DELETE FROM todo WHERE id = ?`, [todoId])
  response.send('Todo Deleted')
})

module.exports = app
