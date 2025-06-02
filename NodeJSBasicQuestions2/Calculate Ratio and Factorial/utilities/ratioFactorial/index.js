const factOfNumber = require('../factorial/index')
const ratioOfNumbers = require('../ratio/index')

function ratioAndFactorial(a, b, c) {
  return {
    ratio: ratioOfNumbers(a, b),
    factorial: factOfNumber(c),
  }
}
module.exports = ratioAndFactorial

//----------------------------------------------------------------------------------------------
//                                            or
//----------------------------------------------------------------------------------------------

// const ratioOfTwoNUmbers = require('../ratio/index.js')
// const factorialOFtwoNumbers = require('../factorial/index.js')
// const ratioAndFactorial = (num1, num2, num3) => {
//   const ratio = ratioOfTwoNUmbers(num1, num2)
//   const factorial = factorialOFtwoNumbers(num3)
//   return {ratio, factorial}
// }
// module.exports = ratioAndFactorial
