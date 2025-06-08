const express = require('express')
const app = express()

app.get('/gadgets', (request, response) => {
  response.sendFile('./gadgets.html', {root: __dirname})
})

app.listen(3000, () => {
  console.log('Server is runnig at http://localhost:3000')
})
module.exports = app
