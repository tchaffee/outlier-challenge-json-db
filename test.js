const tape = require('tape')
const jsonist = require('jsonist')
const fs = require('fs')
const path = require('path')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const server = require('./server')

// Hard-code to localhost to avoid accidentally hitting production endpoints.
const endpoint = `http://localhost:${port}`
const studentId = 'delete-me'
const testStudent = {
  name: 'Test student - can be deleted if found',
  address: {
    street: {
      name: 'Rua Road',
      number: 67
    }
  },
  iAmFalsy: false,
  iAmNull: null,
  iAmNaN: NaN,
  iAmUndefined: undefined
}

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

// PUT endpoints

tape('PUT /:studentId/:propertyName sets a property with data', async function (t) {
  const url = `${endpoint}/${studentId}/address`
  const data = {
    streetName: 'Cool St.',
    streetNumber: 25
  }

  deleteCreateTestStudent()

  jsonist.put(url, data, (err, body, res) => {
    let updatedStudent
    if (err) t.error(err)
    t.equal(res.statusCode, 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.deepEqual(updatedStudent.address, data, 'address should be equal')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName/:propertyName sets a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/foo/bar/baz`
  const data = {
    fizz: 44
  }

  deleteCreateTestStudent()

  jsonist.put(url, data, (err, body, res) => {
    let updatedStudent
    if (err) t.error(err)
    t.equal(res.statusCode, 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.deepEqual(updatedStudent.foo.bar.baz, data, 'nested property data should be equal to data sent')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName creates a property if it does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/age`
  const data = {
    current: 'might change soon'
  }

  deleteCreateTestStudent()

  jsonist.put(url, data, (err, body, res) => {
    let updatedStudent
    if (err) t.error(err)
    t.equal(res.statusCode, 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.deepEqual(updatedStudent.age, data, 'age should be equal to data sent')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName creates a student json file if it does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/grade`
  const data = {
    score: '80% for 100% of the time'
  }

  deleteTestStudentFile()

  jsonist.put(url, data, (err) => {
    if (err) t.error(err)
    t.ok(doesStudentFileExist(), 'student file should exist')
    t.end()
  })
})

// GET endpoints

tape('GET /:studentId/:propertyName retrieves a student property', async function (t) {
  const url = `${endpoint}/${studentId}/address`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200, 'http resonse code should be 200')
    t.deepEqual(body, testStudent.address, 'address should be equal')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist.
tape('GET /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/nopenope`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'http resonse status code should be 404')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist. Which is ok.
tape('GET /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/address`

  deleteTestStudentFile()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'http resonse status code should be 404')
    t.end()
  })
})

tape('GET /:studentId/:propertyName/:propertyName retrieves a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/address/street/name/`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200, 'http resonse code should be 200')
    t.equal(body, testStudent.address.street.name, 'street name should be equal')
    t.end()
  })
})

// GET edge cases to make sure falsy type stuff doesn't break the API.

tape('GET /:studentId/:propertyName/:propertyName retrieves a false property value', async function (t) {
  const url = `${endpoint}/${studentId}/iAmFalsy`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200, 'http resonse code should be 200')
    t.equal(body, false, 'false is retrieved for false property value')
    t.end()
  })
})

tape('GET /:studentId/:propertyName/:propertyName retrieves a null property value', async function (t) {
  const url = `${endpoint}/${studentId}/iAmNull`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200, 'http resonse code should be 200')
    t.equal(body, null, 'null is retrieved for null property value')
    t.end()
  })
})

tape('GET /:studentId/:propertyName/:propertyName retrieves a NaN property value as null', async function (t) {
  const url = `${endpoint}/${studentId}/iAmNaN`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200, 'http resonse code should be 200')
    t.equal(body, null, 'null is retrieved for NaN property value')
    t.end()
  })
})

// JSON.stringify won't store the property in the first place.
tape('GET /:studentId/:propertyName/:propertyName returns 404 for a property with a value of undefined', async function (t) {
  const url = `${endpoint}/${studentId}/iAmUndefined`

  deleteCreateTestStudent()

  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'http resonse code should be 404')
    t.end()
  })
})

// DELETE endpoints

tape('DELETE /:studentId/:propertyName deletes a student property', async function (t) {
  const url = `${endpoint}/${studentId}/address`

  deleteCreateTestStudent()

  jsonist.delete(url, (err, body, res) => {
    let updatedStudent
    if (err) t.error(err)
    t.equal(res.statusCode, 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.notOk(updatedStudent.hasOwnProperty('address'), 'updated student file should not have address property')
    t.end()
  })
})

tape('DELETE /:studentId/:propertyName/:propertyName deletes a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/address/street/number`

  deleteCreateTestStudent()

  jsonist.delete(url, (err, body, res) => {
    let updatedStudent
    if (err) t.error(err)
    t.equal(res.statusCode, 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.notOk(updatedStudent.address.street.hasOwnProperty('number'), 'updated student file should not have deleted street number property')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist. Which is ok.
tape('DELETE /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/nopenope`

  deleteCreateTestStudent()

  jsonist.delete(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'http resonse status code should be 404')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist. Which is ok.
tape('DELETE /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/address`

  deleteTestStudentFile()

  jsonist.delete(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'http resonse status code should be 404')
    t.end()
  })
})

// Support functions

function getTestFileDir () {
  // Hard code the directory for tests. Configurable for the API though.
  // Ensures tests can't be configured to touch production data.
  return path.join(__dirname, './test-data')
}

function getTestFilePath () {
  return `${getTestFileDir()}/${studentId}.json`
}

function deleteCreateTestStudent () {
  deleteTestStudentFile()
  createTestStudentFile()
}

function createTestStudentFile () {
  // Create the directory if needed.
  if (!fs.existsSync(getTestFileDir())) fs.mkdirSync(getTestFileDir())
  fs.writeFileSync(getTestFilePath(), JSON.stringify(testStudent))
}

function doesStudentFileExist () {
  return fs.existsSync(getTestFilePath())
}

function getTestStudentFromFile () {
  const student = JSON.parse(fs.readFileSync(getTestFilePath()))
  return student
}

function deleteTestStudentFile () {
  try {
    fs.unlinkSync(getTestFilePath())
  } catch (err) {
    // File does not exist is fine
    if ((err.errno === -2) && (err.code === 'ENOENT')) return
    throw err
  }
}

// Cleanup

tape('cleanup', function (t) {
  server.close()
  deleteTestStudentFile()
  t.end()
})
