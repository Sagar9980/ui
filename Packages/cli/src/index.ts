import { Command } from "commander";
import { argv } from "process";
const program = new Command();

program.action(() => {
  console.log("Hello!");
});

program.parse(argv);
