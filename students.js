const fs = require('fs').promises
const path = require('path')
const _has = require('lodash.has')
const _get = require('lodash.get')
const _set = require('lodash.set')
const _unset = require('lodash.unset')

module.exports = {
  getProperty,
  setProperty,
  deleteProperty
}

async function getProperty (studentId, propertyPath) {
  const studentFile = getStudentFileName(studentId)
  let student
  let returnValue

  try {
    student = JSON.parse(await fs.readFile(studentFile))
  } catch (err) {
    // Re-throw any errors other than file not found
    if ((err.errno === -2) && (err.code === 'ENOENT')) return { isFound: false }
    throw err
  }

  // Make sure property exists so we can safely use undefined as default
  if (!_has(student, propertyPath)) return { isFound: false }
  returnValue = _get(student, propertyPath, undefined)

  return { isFound: true, value: returnValue }
}

async function setProperty (studentId, propertyPath, value) {
  const studentFile = getStudentFileName(studentId)
  let student

  try {
    student = JSON.parse(await fs.readFile(studentFile))
  } catch (err) {
    // Continue if file not found, throw error otherwise.
    if ((err.errno !== -2) || (err.code !== 'ENOENT')) throw err
  }

  _set(student, propertyPath, value)

  return fs.writeFile(studentFile, JSON.stringify(student))
}

async function deleteProperty (studentId, propertyPath) {
  const studentFile = getStudentFileName(studentId)
  let student

  try {
    student = JSON.parse(await fs.readFile(studentFile))
  } catch (err) {
    if ((err.errno === -2) && (err.code === 'ENOENT')) return { isFound: false }
    throw err
  }

  if (!_has(student, propertyPath)) return { isFound: false }

  // Tried to use lodash.omit, but it does not like a string property path.
  _unset(student, propertyPath)
  await fs.writeFile(studentFile, JSON.stringify(student))
  return { isFound: true }
}

function getStudentFileName (studentId) {
  const dataDir = process.env.DATA_DIR || './'
  return path.join(__dirname, `${dataDir}/${studentId}.json`)
}
