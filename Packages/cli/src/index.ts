#!/usr/bin/env node
import { Command } from "commander";
import { create } from "@/src/commands/create";
import { add } from "@/src/commands/add";

async function main() {
  const program = new Command()
    .name("xsite")
    .description("xsite -> a convinient way for building website!!")
    .version("1.0.0", "-v, --version", "display the version number");

  program.addCommand(create);
  program.addCommand(add);

  program.parse();
}

main();
