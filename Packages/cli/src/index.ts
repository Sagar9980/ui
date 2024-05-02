import { Command } from "commander";
const program = new Command();

program
  .name("ui")
  .description("A simple ui library for testing!")
  .version("1.0.0");

program
  .command("add")
  .description("Add two number provided from user")
  .argument("<firstNumber>", "first number")
  .argument("<secondNumber>", "second number")
  .action((firstNumber, secondNumber) => {
    console.log("First Number:", firstNumber);
    console.log("secondNumber: ", secondNumber);
    console.log("Sum", firstNumber + secondNumber);
  });
program.option(
  "-c, --cheese <type>",
  "add the specified type of cheese",
  "blue"
);

program.parse();
