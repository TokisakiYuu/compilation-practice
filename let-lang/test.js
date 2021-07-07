const {
  tokenizer,
  parser,
  executor,
  prettyError
} = require("./index");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(variables) {
  rl.question("let-lang> ", (source) => {
    const printError = prettyError(source);
    try {
      const tokens = tokenizer(source);
      const ast = parser(tokens);
      const result = executor(ast, variables);
      if(result) {
        console.log(`> ${result}`);
      }
    } catch (error) {
      printError(error);
    }
    ask(variables);
  });
}

ask(new Map());