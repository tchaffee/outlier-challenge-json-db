const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

// PUT endpoints

tape('PUT /:studentId/:propertyName sets a property', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('PUT /:studentId/:propertyName/:propertyName sets a nested property', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('PUT /:studentId/:propertyName creates a property if it does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('PUT /:studentId/:propertyName creates a student json file if it does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

// GET endpoints

tape('GET /:studentId/:propertyName retrieves a student property', async function (t) {
  const url = `${endpoint}/rn1abu8/address`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.fail('not implemented')
    t.end()
  })
})

tape('GET /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('GET /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('GET /:studentId/:propertyName/:propertyName retrieves a nested property', async function (t) {
  t.fail('not implemented')
  t.end()
})

// DELETE endpoints

tape('DELETE /:studentId/:propertyName deletes a student property', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('DELETE /:studentId/:propertyName/:propertyName deletes a nested property', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('DELETE /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

tape('DELETE /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  t.fail('not implemented')
  t.end()
})

// Cleanup

tape('cleanup', function (t) {
  server.close()
  t.end()
})
