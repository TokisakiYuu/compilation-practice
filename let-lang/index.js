/**
 * 词法分析器
 * @param {string} source 源码
 */
function tokenizer(source) {
  let i = 0;
  const tokens = [];
  while(i < source.length) {
    if(source.substr(i, 4) === "let ") {
      tokens.push({
        type: "keyword",
        value: "let",
        offset: i,
        length: 3
      });
      i = i + 3;
      continue;
    }
    if(source[i] === "=") {
      tokens.push({
        type: "keyword",
        value: "=",
        offset: i,
        length: 1
      });
      i += 1;
      continue;
    }
    if(source.substr(i, 6) === "print ") {
      tokens.push({
        type: "keyword",
        value: "print",
        offset: i,
        length: 5
      });
      i = i + 5;
      continue;
    }
    // 忽略空格、结束符、换行符等冗余字符
    if(source[i] === " " || source[i] === ";" || source[i] === "\n") {
      let raw = "";
      while(i < source.length && (source[i] === " " || source[i] === ";" || source[i] === "\n")) {
        raw += source[i];
        i++;
      }
      // tokens.push({
      //   type: "redundancy",
      //   raw
      // });
      continue;
    }
    // 其余的都不是关键字，是字面量，语法规定value只能是数字，所以value也算作字面量
    let literal = "";
    const offset = i;
    while(i < source.length && source[i] !== " " && source[i] !== "\n" && source[i] !== ";" && source[i] !== "=") {
      literal += source[i];
      i++;
    }
    tokens.push({
      type: "literal",
      value: literal,
      offset,
      length: literal.length
    });
  }
  return tokens;
}


// console.log(tokenizer(`let x = 44; print x;`));


/**
 * 语法分析器
 * @param {any[]} source tokens 
 */
function parser(source) {
  const walker = makeWalker(source);
  const expressions = [];
  while(walker.count() > 0) {
    expressions.push(Expression(walker));
  }
  return {
    type: "Program",
    expressions
  }
}

function makeWalker(source) {
  const tokens = [...source];
  const stack = [];
  return {
    nextToken() {
      const token = tokens.shift();
      stack.unshift(token);
      return token;
    },
    rollback() {
      const token = stack.shift();
      tokens.unshift(token);
    },
    count() {
      return tokens.length;
    }
  }
}

function Assignment(walker) {
  const { nextToken, rollback } = walker;
  const declare = Declare(walker);
  if(declare) {
    const equalToken = nextToken();
    if(!equalToken) {
      return declare;
    }
    if(!(equalToken.type === "keyword" && equalToken.value === "=")) {
      rollback();
      return declare;
    }
    const numToken = nextToken();
    if(numToken.type === "literal" && isVariableValue(numToken.value)) {
      return {
        type: "DeclareAssignmentStatement",
        declare: declare.declare,
        value: {
          source: numToken.value,
          offset: numToken.offset,
          length: numToken.length
        }
      }
    }
    return error(numToken.offset, "此处应该为一个整数");
  }

  const nameToken = nextToken();
  if(nameToken.type === "literal" && isVarableName(nameToken.value)) {
    const equalToken = nextToken();
    if(equalToken.type === "keyword" && equalToken.value === "=") {
      const token = nextToken();
      if(token.type !== "literal") return error(token.offset, "此处应该为一个整数或者另一个变量");
      if(isVariableValue(token.value)) {
        return {
          type: "AssignmentStatement",
          name: {
            source: nameToken.value,
            offset: nameToken.offset,
            length: nameToken.length
          },
          value: {
            source: token.value,
            offset: token.offset,
            length: token.length
          }
        }
      }
      if(isVarableName(token.value)) {
        return {
          type: "TransferStatement",
          to: {
            source: nameToken.value,
            offset: nameToken.offset,
            length: nameToken.length
          },
          from: {
            source: token.value,
            offset: token.offset,
            length: token.length
          }
        }
      }
      return error(token.offset, "非法的变量值");
    }
  }
  return error(nameToken.offset, "此处应该为一个变量名");
}

function Declare(walker) {
  const { nextToken, rollback } = walker;
  const letToken = nextToken();
  if(letToken.type === "keyword" && letToken.value === "let") {
    const nameToken = nextToken();
    if(nameToken.type === "literal" && isVarableName(nameToken.value)) {
      return {
        type: "DeclareStatement",
        declare: {
          source: nameToken.value,
          offset: nameToken.offset,
          length: nameToken.length
        }
      }
    }
    return error(nameToken.offset, "非法变量名");
  }
  rollback();
}

function Print(walker) {
  const { nextToken, rollback } = walker;
  const printToken = nextToken();
  if(printToken.type === "keyword" && printToken.value === "print") {
    const nameToken = nextToken();
    if(nameToken.type === "literal" && isVarableName(nameToken.value)) {
      return {
        type: "PrintStatement",
        target: {
          source: nameToken.value,
          offset: nameToken.offset,
          length: nameToken.length
        }
      }
    }
    return error(nameToken.offset, "非法变量名");
  }
  rollback();
}

function Expression(walker) {
  const print = Print(walker);
  if(print) return print;
  const assignment = Assignment(walker);
  if(assignment) return assignment;
}

function isVarableName(source) {
  return typeof source === "string" && (/^[a-zA-Z_]+$/g).test(source);
}

function isVariableValue(source) {
  return typeof source === "string" && (/^[0-9]+$/g).test(source);
}

function error(offset, message) {
  throw {
    offset,
    message
  };
}


function executor(source, localVariables) {
  if(source.type === "Program") {
    source.expressions.forEach(expression => executor(expression, localVariables));
    return;
  }
  if(source.type === "DeclareAssignmentStatement") {
    localVariables.set(source.declare.source, {
      offset: source.declare.offset,
      length: source.declare.length,
      inited: true,
      value: source.value.source
    });
    return;
  }
  if(source.type === "DeclareStatement") {
    localVariables.set(source.declare.source, {
      offset: source.declare.offset,
      length: source.declare.length,
      inited: false,
      value: undefined
    });
    return;
  }
  if(source.type === "AssignmentStatement") {
    if(!localVariables.has(source.name.source)) {
      return error(source.name.offset, `未声明变量 ${source.name.source}`);
    }
    const variable = localVariables.get(source.name.source);
    variable.inited = true;
    variable.value = Number(source.value.source);
  }
  if(source.type === "TransferStatement") {
    if(!localVariables.has(source.to.source)) {
      return error(source.to.offset, `未声明变量 ${source.to.source}`);
    }
    if(!localVariables.has(source.from.source)) {
      return error(source.from.offset, `未声明变量 ${source.from.source}`);
    }
    const variable = localVariables.get(source.to.source);
    variable.inited = true;
    variable.value = localVariables.get(source.from.source).value;
  }
  if(source.type === "PrintStatement") {
    if(!localVariables.has(source.target.source)) {
      return error(source.target.offset, `未声明变量 ${source.target.source}`);
    }
    const variable = localVariables.get(source.target.source);
    console.log(variable.value);
  }
}

function prettyError(source) {
  return function printError(error) {
    console.log(
      `${source}\n`,
      `${repeat(" ", error.offset - 1)}^\n`,
      `${repeat(" ", error.offset - 1)}${error.message}`
    );
  }
}

function repeat(str, count) {
  if(count === 0) return "";
  return str + repeat(str, count - 1);
}

// const tokens = tokenizer(`let x = 3;y = 4; x = yy;`);
// const ast = parser(tokens);
// executor(ast, new Map());
// console.log(JSON.stringify(ast, null, 4));


module.exports = {
  tokenizer,
  parser,
  executor,
  prettyError
}