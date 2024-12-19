const doc = window.document;
const displayExpression = doc.querySelector(".display");
const buttons = Array.from(doc.getElementsByClassName("button"));

buttons.map((button) => {
  button.addEventListener("click", (el) => {
    const value = el.target.innerText;
    const currentExpression = displayExpression.value;

    // Сброс выражения
    if (value === "AC") {
      displayExpression.value = "";
    }
    // Удаление последнего символа
    else if (value === "←") {
      displayExpression.value = currentExpression.slice(0, -1);
    }
    // Если выражение пустое и вводится оператор или степень
    else if (!currentExpression && ("+*/%)".includes(value) || el.target.classList.contains("button--exponent"))) {
      // Ничего не делаем
      return;
    }
    else if (currentExpression === '-' && ("+*/%-)".includes(value) || el.target.classList.contains("button--exponent"))) {
      // Ничего не делаем
      return;
    }
    // Добавление степени "**"
    else if (el.target.classList.contains("button--exponent") || value === 'xⁿ') {
      displayExpression.value += "**";
    }
    // Вычисление выражения
    else if (value === "=") {
      calculate();
    }
    // Если в начале 0 и вводится число, заменяем 0
    else if (currentExpression === "0" && !isNaN(value)) {
      displayExpression.value = value;
    }
    // Добавление символа в выражение
    else {
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
      if (expression[i] === "-" && (i === 0 || "+-*/%(".includes(expression[i - 1]))) {
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
        ((operators[token].associativity === "L" && operators[token].precedence <= operators[operatorStack[operatorStack.length - 1]].precedence) ||
          (operators[token].associativity === "R" && operators[token].precedence < operators[operatorStack[operatorStack.length - 1]].precedence))
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
