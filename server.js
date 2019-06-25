const express = require('express')
const bodyParser = require('body-parser')

const api = require('./api')
const middleware = require('./middleware')

const PORT = process.env.PORT || 1337

const app = express()

app.use(bodyParser.json())

app.get('/health', api.getHealth)

// TODO: Want to use '+' for one or more :propertyName, but only splat is working.
// Might be looking at more recent docs for path-to-regexp than Express uses?
app.route('/:studentId/:propertyName*')
  .get(api.getStudentProperty)
  .put(api.setStudentProperty)
  .delete(api.deleteStudentProperty)

app.use(middleware.handleError)
app.use(middleware.notFound)

const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
)

if (require.main !== module) {
  module.exports = server
}
