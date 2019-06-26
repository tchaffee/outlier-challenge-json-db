const students = require('./students')

module.exports = {
  getHealth,
  setStudentProperty,
  getStudentProperty,
  deleteStudentProperty
}

async function getHealth (req, res, next) {
  res.json({ success: true })
}

async function getStudentProperty (req, res, next) {
  const studentId = req.params.studentId
  const propertyPath = propertyPathFromReq(req)

  let result = await students.getProperty(studentId, propertyPath)

  if (!result.isFound) return next()

  // JSON can now be simple values, so no need to wrap in curly brackets.
  // See https://stackoverflow.com/questions/5034444/can-json-start-with
  res.json(result.value)
}

async function setStudentProperty (req, res, next) {
  const studentId = req.params.studentId
  const propertyPath = propertyPathFromReq(req)

  const propertyValue = req.body

  await students.setProperty(studentId, propertyPath, propertyValue)

  res.sendStatus(204)
}

async function deleteStudentProperty (req, res, next) {
  const studentId = req.params.studentId
  const propertyPath = propertyPathFromReq(req)

  const result = await students.deleteProperty(studentId, propertyPath)

  if (!result.isFound) return next()

  res.sendStatus(204)
}

function propertyPathFromReq (req) {
  return req.params.propertyName + req.params[0].replace(/\//g, '.')
}
