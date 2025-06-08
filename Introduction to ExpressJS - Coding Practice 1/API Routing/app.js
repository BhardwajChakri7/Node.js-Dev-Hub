const express = require('express')
const app = express()

app.get('/', (request, response) => {
  response.send('Home Page')
})
app.get('/about', (request, response) => {
  response.send('About Page')
})

app.listen(3000)
module.exports = app
