const {
  tokenizer,
  parser,
  evaluate
} = require("./index");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function ask() {
  rl.question("enter a arithmetic expression> ", (answer) => {
    const tokens = tokenizer(answer);
    const ast = parser(tokens);
    const result = evaluate(ast);
    console.log(result);
    ask();
  });
}

ask();