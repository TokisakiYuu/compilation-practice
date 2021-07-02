const sample = `((7 + 2) / 3) * 4`;
// 2 * 6 / 4     Atom => (Atom)
// 12 / 4        Rank1 => Atom * Rank1
// 3             Rnak1 => Atom / Rank1
// console.log(`sample: ${sample}`);


function tokenizer(source) {
  return source.replace(/\s/g, "").split("");
}

function isNumber(source) {
  return "0123456789".includes(source);
}

function repeat(str, num) {
  if(num === 0) return "";
  return str + repeat(str, num - 1);
}

/**
 * @param {string[]} tokens 
 */
function parser(tokens) {
  let i = 0,
      queue = [...tokens],
      stack = [];

  function error(index, msg) {
    console.log("error:");
    console.error([
      repeat(" ", 4) + tokens.join(""),
      repeat(" ", 4) + `${repeat(" ", index)}^`,
      msg
    ].join("\n"));
    process.exit();
  }
  
  function eat() {
    const token = queue.shift();
    stack.unshift(token);
    return {
      token: token,
      index: i++
    };
  }

  function rollback() {
    const token = stack.shift();
    i -= 1;
    queue.unshift(token);
  }

  function Atom() {
    const { token, index } = eat();
    if(isNumber(token)) {
      return {
        type: "number",
        value: token
      }
    }
    if(token === "(") {
      const exp = Exp();
      const { token } = eat();
      if(token === ")") {
        return {
          type: "expression",
          expression: exp
        }
      }
    }
    return error(index, "期望是一个数字或者括号表达式")
  }

  function MulExp() {
    const atom = Atom();
    const { token, index } = eat();
    if(token === "*") {
      const mul = MulExp();
      return {
        type: "mul",
        left: atom,
        right: mul
      }
    }
    if(token === "/") {
      const mul = MulExp();
      return {
        type: "div",
        left: atom,
        right: mul
      }
    }
    rollback();
    return atom;
  }
    
  function AddExp() {
    const mul = MulExp();
    const { token, index } = eat();
    if(token === "+") {
      const add = AddExp();
      return {
        type: "add",
        left: mul,
        right: add
      }
    }
    if(token === "-") {
      const add = AddExp();
      return {
        type: "sub",
        left: mul,
        right: add
      }
    }
    rollback();
    return mul;
  }

  function Exp() {
    return AddExp();
  }
  

  return {
    type: "Program",
    expression: Exp()
  };
}

function evaluate(node) {
  const { type } = node;
  if(type === "Program" || type === "expression") {
    return evaluate(node.expression);
  }
  if(type === "add") {
    return evaluate(node.left) + evaluate(node.right);
  }
  if(type === "sub") {
    return evaluate(node.left) - evaluate(node.right);
  }
  if(type === "mul") {
    return evaluate(node.left) * evaluate(node.right);
  }
  if(type === "div") {
    return evaluate(node.left) / evaluate(node.right);
  }
  if(type === "number") {
    return Number(node.value)
  }
}

module.exports = {
  tokenizer,
  parser,
  evaluate
}