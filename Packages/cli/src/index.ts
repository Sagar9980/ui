#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
const program = new Command();

program
  .name("ui")
  .description("A simple ui library for testing!")
  .version("1.0.0");

program
  .command("add")
  .version("0.1.0")
  .argument("<username>", "user to login")
  .argument("[password]", "password for user, if required", "no password given")
  .action((username, password) => {
    console.log("username:", username);
    console.log("password:", password);
  });

program.parse();
