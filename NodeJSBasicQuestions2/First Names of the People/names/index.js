let namesList = require('../country/state/city/index.js')
let getFirstNames = require('../utilities/utils/index.js')
function getPeopleInCity(namesList) {
  return getFirstNames(namesList)
}
module.exports = getPeopleInCity
