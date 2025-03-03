const doc = window.document;
const displayExpression = doc.querySelector(".display");
const buttons = Array.from(doc.getElementsByClassName("button"));

const operators = ["+", "-", "*", "/", "%"];

buttons.map((button) => {
  button.addEventListener("click", (el) => {
    const value = el.target.innerText;
    const currentExpression = displayExpression.value;

    if (value === "AC") {
      displayExpression.value = "";
    } else if (value === "←") {
      displayExpression.value = currentExpression.slice(0, -1);
    } else if (currentExpression === "" && value === "-") {
      displayExpression.value += value;
    } else if (
      currentExpression === "-" &&
      (operators.includes(value) ||
        el.target.classList.contains("button--exponent"))
    ) {
      return;
    } else if (
      !currentExpression &&
      (operators.includes(value) ||
        el.target.classList.contains("button--exponent"))
    ) {
      return;
    } else if (
      operators.includes(value) &&
      operators.includes(currentExpression[currentExpression.length - 1])
    ) {
      return;
    } else if (el.target.classList.contains("button--exponent")) {
      if (
        currentExpression.slice(-2) === "**" ||
        operators.includes(currentExpression[currentExpression.length - 1])
      ) {
        return;
      } else {
        displayExpression.value += "**";
      }
    } else if (value === ".") {
      if (
        operators.includes(currentExpression[currentExpression.length - 1]) ||
        currentExpression.endsWith("**")
      ) {
        return;
      }
      const lastNumber = currentExpression.split(/[\+\-\*\/\%]/).pop();
      if (lastNumber.includes(".")) {
        return;
      } else {
        displayExpression.value += value;
      }
    } else if (value === "=") {
      calculate();
    } else if (currentExpression === "0" && !isNaN(value)) {
      displayExpression.value = value;
    } else {
      displayExpression.value += value;
    }
  });
});

function calculate() {
  try {
    displayExpression.value = evaluateExpression(displayExpression.value);
  } catch (error) {
    displayExpression.value = "Error!";
  }
}

function evaluateExpression(expression) {
  const outputQueue = [];
  const operatorStack = [];
  const operators = {
    "+": { precedence: 1, associativity: "L" },
    "-": { precedence: 1, associativity: "L" },
    "*": { precedence: 2, associativity: "L" },
    "/": { precedence: 2, associativity: "L" },
    "%": { precedence: 2, associativity: "L" },
    "**": { precedence: 3, associativity: "R" },
  };

  const tokens = [];
  let i = 0;

  while (i < expression.length) {
    if (expression[i] === "*" && expression[i + 1] === "*") {
      tokens.push("**");
      i += 2;
    } else if ("+-*/%()".includes(expression[i])) {
      if (
        expression[i] === "-" &&
        (i === 0 || "+-*/%(".includes(expression[i - 1]))
      ) {
        let number = "-";
        i++;
        while (i < expression.length && /\d|\./.test(expression[i])) {
          number += expression[i];
          i++;
        }
        tokens.push(number);
      } else {
        tokens.push(expression[i]);
        i++;
      }
    } else if (/\d/.test(expression[i])) {
      let number = "";
      while (i < expression.length && /\d|\./.test(expression[i])) {
        number += expression[i];
        i++;
      }
      tokens.push(number);
    } else {
      i++;
    }
  }

  tokens.forEach((token) => {
    if (isNumeric(token)) {
      outputQueue.push(parseFloat(token));
    } else if (operators[token]) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "(" &&
        ((operators[token].associativity === "L" &&
          operators[token].precedence <=
            operators[operatorStack[operatorStack.length - 1]].precedence) ||
          (operators[token].associativity === "R" &&
            operators[token].precedence <
              operators[operatorStack[operatorStack.length - 1]].precedence))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.pop();
    }
  });

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  const resultStack = [];
  outputQueue.forEach((token) => {
    if (isNumeric(token)) {
      resultStack.push(token);
    } else if (operators[token]) {
      const b = resultStack.pop();
      const a = resultStack.pop();
      switch (token) {
        case "+":
          resultStack.push(a + b);
          break;
        case "-":
          resultStack.push(a - b);
          break;
        case "*":
          resultStack.push(a * b);
          break;
        case "/":
          resultStack.push(a / b);
          break;
        case "%":
          resultStack.push(a % b);
          break;
        case "**":
          resultStack.push(a ** b);
          break;
      }
    }
  });

  if (resultStack.length !== 1) {
    throw new Error("Invalid expression");
  }

  return resultStack.pop();
}

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
