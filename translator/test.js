const {
  tokenizer,
  parser,
  codegen
} = require("./index");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function ask() {
  rl.question('entr a List Call Function expression> ', (answer) => {
    // (add 23 (subtract 42 2))
    const tokens = tokenizer(answer);
    const ast = parser(tokens);
    const code = codegen(ast);
    console.log(`transform to C: \n${code.split("\n").map(line => "    " + line).join("\n")}`);
    ask();
  });
}

ask();