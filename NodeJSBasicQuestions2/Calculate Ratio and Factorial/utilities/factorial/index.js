function factorialOfNumber(num) {
  let factorial = 1
  while (num !== 0) {
    factorial *= num--
  }
  return factorial
}

module.exports = factorialOfNumber
