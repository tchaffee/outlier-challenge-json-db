const tape = require('tape')
const jsonist = require('jsonist')
const fs = require('fs')
const path = require('path')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const server = require('./server')

// Hard-code to localhost to avoid accidentally hitting production endpoints.
const endpoint = `http://localhost:${port}`
const dataDir = path.join(__dirname, './test-data')
const studentId = 'delete-me'
const jsonFile = `${dataDir}/${studentId}.json`
const testStudent = {
  name: 'Test student - can be deleted if found',
  address: {
    streetName: 'Rua Road',
    streetNumber: 67
  }
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

tape('PUT /:studentId/:propertyName sets a property', async function (t) {
  const url = `${endpoint}/${studentId}/address`
  const streetName = 'Cool St.'
  const streetNumber = 25
  const data = {
    streetName: streetName,
    streetNumber: streetNumber
  }

  createTestStudentFile()

  jsonist.put(url, data, (err, body, resp) => {
    let updatedStudent
    if (err) t.error(err)
    t.ok(resp.statusCode === 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.ok(updatedStudent.address.streetName === streetName, 'street name should be equal')
    t.ok(updatedStudent.address.streetNumber === streetNumber, 'street number should be equal')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName/:propertyName sets a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/address/streetNumber`
  const data = 26

  createTestStudentFile()

  jsonist.put(url, data, (err, body, resp) => {
    let updatedStudent
    if (err) t.error(err)
    t.ok(resp.statusCode === 204, 'http resonse status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.ok(updatedStudent.address.streetNumber === data, 'street number should be equal to data sent')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName creates a property if it does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/age`
  const data = 'might change soon'

  createTestStudentFile()

  jsonist.put(url, data, (err, body, resp) => {
    let updatedStudent
    if (err) t.error(err)
    t.ok(resp.statusCode === 204, 'http response status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.ok(updatedStudent.age === data, 'age should be equal to data sent')
    t.end()
  })
})

tape('PUT /:studentId/:propertyName creates a student json file if it does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/grade`
  const data = '80% for 100% of the time'

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
  createTestStudentFile()
  jsonist.get(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 200, 'http response code should be 200')
    t.ok(body && body.streetNumber === testStudent.address.streetNumber, 'street number should be equal')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist.
tape('GET /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/nopenope`
  createTestStudentFile()
  jsonist.get(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 404, 'http response status code should be 404')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist.
tape('GET /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/address`
  deleteTestStudentFile()
  jsonist.get(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 404, 'http response status code should be 404')
    t.end()
  })
})

tape('GET /:studentId/:propertyName/:propertyName retrieves a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/address/streetName`
  createTestStudentFile()
  jsonist.get(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 200, 'http response code should be 200')
    t.ok(body === testStudent.address.streetName, 'street name should be equal')
    t.end()
  })
})

// DELETE endpoints

tape('DELETE /:studentId/:propertyName deletes a student property', async function (t) {
  const url = `${endpoint}/${studentId}/address`

  createTestStudentFile()

  jsonist.delete(url, (err, body, resp) => {
    let updatedStudent
    if (err) t.error(err)
    t.ok(resp.statusCode === 204, 'http response status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.notOk(updatedStudent.hasOwnProperty('address'), 'updated student file should not have address property')
    t.end()
  })
})

tape('DELETE /:studentId/:propertyName/:propertyName deletes a nested property', async function (t) {
  const url = `${endpoint}/${studentId}/address/streetNumber`

  createTestStudentFile()

  jsonist.delete(url, (err, body, resp) => {
    let updatedStudent
    if (err) t.error(err)
    t.ok(resp.statusCode === 204, 'http response status code should be 204')
    updatedStudent = getTestStudentFromFile()
    t.notOk(updatedStudent.address.hasOwnProperty('streetNumber'), 'updated student file should not have deleted street number property')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist.
tape('DELETE /:studentId/:propertyName returns 404 if the property does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/nopenope`
  createTestStudentFile()
  jsonist.delete(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 404, 'http response status code should be 404')
    t.end()
  })
})

// NOTE: The test will pass even when the endpoint does not exist.
tape('DELETE /:studentId/:propertyName returns 404 if the student file does not exist', async function (t) {
  const url = `${endpoint}/${studentId}/address`
  deleteTestStudentFile()
  jsonist.delete(url, (err, body, resp) => {
    if (err) t.error(err)
    t.ok(resp.statusCode === 404, 'http response status code should be 404')
    t.end()
  })
})

// Support functions

function createTestStudentFile () {
  deleteTestStudentFile()
  fs.writeFileSync(jsonFile, JSON.stringify(testStudent))
}

function doesStudentFileExist () {
  return fs.existsSync(jsonFile)
}

function getTestStudentFromFile () {
  const student = JSON.parse(fs.readFileSync(jsonFile))
  return student
}

function deleteTestStudentFile () {
  try {
    fs.unlinkSync(jsonFile)
  } catch (err) {
    // File does not exist is fine
    if ((err.errno !== -2) || (err.code !== 'ENOENT')) throw err
  }
}

// Cleanup

tape('cleanup', function (t) {
  server.close()
  t.end()
})
