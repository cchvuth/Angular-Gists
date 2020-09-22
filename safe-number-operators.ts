function mult(a?, b?) {
  if (a === undefined || b === undefined) {
    return undefined;
  } else if (a == null && b == null) {
    return null;
  }
  return Number(a) * Number(b);
}

function divide(a?, b?) {
  if (a === undefined || b === undefined) {
    return undefined;
  } else if (a == null && b == null) {
    return null;
  }
  return Number(a) / Number(b);
}

function add(...numbers) {
  let sum = null;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] != null) {
      sum += Number(numbers[i]);
    }
  }
  return sum;
}

function sub(a = null, b = null) {
  if (a == null && b == null) {
    return null;
  }
  return Number(a) - Number(b);
}

export { mult, divide, add, sub };
