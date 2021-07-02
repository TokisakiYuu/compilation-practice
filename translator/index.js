/**
 * 输入示例：
 * (add 2 (subtract 4 2))
 * (concat "hello" "world")
 */


/**
 * 词法分析器
 * @param {string} input 输入代码
 */
function tokenizer(input) {
  // 存放当前读取到的位置
  let current = 0;
  // 存放解析好的token
  let tokens = [];

  // 遍历每一个字符
  while(current < input.length) {
    // 当前字符
    let char = input[current];

    if(char === "(") {
      tokens.push({
        type: "quote-left",
        value: "("
      })
      // 去下一个字符
      current++;
      continue;
    }

    if(char === ")") {
      tokens.push({
        type: "quote-right",
        value: ")"
      })
      // 去下一个字符
      current++;
      continue;
    }

    let WHITESPACE = /\s/;
    if(WHITESPACE.test(char)) {
      current++;
      continue;
    }

    let NUMBER = /[0-9]/;
    if(NUMBER.test(char)) {
      // 数字可能不止一位，所以要继续往后查找，直到找出一个完整数字
      let value = "";
      while(NUMBER.test(char)) {
        value += char;
        char = input[++current];
      }
      // 数字查找完了
      tokens.push({
        type: "number",
        value
      })
      continue;
    }

    if(char === '"') {
      // 如果来到这里，说明接下来是一个字符串，直到查找到第二个 " 符号结束
      let value = "";
      char = input[++current];
      while(char !== '"') {
        value += char;
        char = input[++current]; 
      }
      // 查找完字符串内容后
      tokens.push({
        type: "string",
        value
      })
      // 这里要跳过第二个 " 符号再退出，不然会出错
      current++;
      continue;
    }

    let LETTERS = /[a-z]/i;
    if(LETTERS.test(char)) {
      // 类似的，这里是变量名
      let value = "";
      while(LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      // 查找完了
      tokens.push({
        type: "name",
        value
      })
      continue;
    }

    // 其余的字符不认识，抛错
    throw new Error("未知符号: " + char);
  }
  return tokens;
}


/**
 * 语法分析器
 * 输入示例：
 *[
    { type: 'quote-left', value: '(' },
    { type: 'name', value: 'add' },
    { type: 'number', value: '23' },
    { type: 'quote-left', value: '(' },
    { type: 'name', value: 'subtract' },
    { type: 'number', value: '42' },
    { type: 'number', value: '2' },
    { type: 'quote-right', value: ')' },
    { type: 'quote-right', value: ')' }
  ]
  @param {Array} input tokens
 */
function parser(input) {
  let current = 0;
  let token = input[current];

  function NumberLiteral() {
    if(token.type === "number") {
      let node = {type: "NumberLiteral", value: token.value};
      token = input[++current];
      return node
    }
  }

  function StringLiteral() {
    if(token.type === "string") {
      let node = {type: "StringLiteral", value: token.value};
      token = input[++current];
      return node;
    }
  }

  function CallExpression() {
    if(token.type === "quote-left") {
      let node = {type: "CallExpression"};
      token = input[++current];
      if(token.type === "name") {
        node.name = token.value;
      } else {
        return Expression();
      }
      // 从这里开始就是函数参数列表了，遍历它
      token = input[++current];
      node.params = [];
      while(token.type !== "quote-right") {
        node.params.push(Expression());
      }
      token = input[++current];
      return node;
    }
  }

  function Expression() {
    let node;
    node = NumberLiteral();
    if(node) return node;
    node = StringLiteral();
    if(node) return node;
    node = CallExpression();
    if(node) return node;
    console.log(current);
    throw new Error("语法错误");
  }

  let root = {type: "Program"}
  root.expressions = [];
  while(current < input.length) {
    root.expressions.push(Expression());
  }

  return root;
}

/**
 * 代码生成器
 */
function codegen(input) {
  if(input.type === "Program") {
    return input.expressions.map(exp => codegen(exp)).join(";\n") + ";";
  }
  if(input.type === "CallExpression") {
    return input.name + "(" + input.params.map(exp => codegen(exp)).join(", ") + ")";
  }
  if(input.type === "NumberLiteral") {
    return input.value;
  }
}


module.exports = {
  tokenizer,
  parser,
  codegen
}