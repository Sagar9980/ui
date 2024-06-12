#!/usr/bin/env node
import { Command } from "commander";
import { create } from "@/src/commands/create";
const program = new Command();

async function main() {
  const program = new Command()
    .name("xsite")
    .description("xsite -> a convinient way for building website!!")
    .version("1.0.0", "-v, --version", "display the version number");

  program.addCommand(create);

  program.parse();
}

main();
