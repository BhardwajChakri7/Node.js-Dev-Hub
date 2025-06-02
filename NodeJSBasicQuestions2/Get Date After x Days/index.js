const {addDays} = require('date-fns')
let currentDate = new Date(2020, 7, 22)
function dateafterxdays(days) {
  let result = addDays(currentDate, days)
  return `${result.getDate()}-${result.getMonth() + 1}-${result.getFullYear()}`
}
module.exports = dateafterxdays
