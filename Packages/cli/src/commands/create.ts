import { Command } from "commander";
import path from "path";

export const create = new Command()
  .name("create-app <directory>")
  .description("add a starter kit for next js")
  .action(async (directory) => {
    const zipPath = path.resolve(__dirname, "starter-file.zip");
  });
