import chalk from "chalk";
import { existsSync, promises as fs } from "fs";
import ora from "ora";
import decompress from "decompress";
import { Command } from "commander";
import path from "path";

export const create = new Command()
  .name("create-app <directory>")
  .description("add a starter kit for next js")
  .action(async (directory) => {
    try {
      const zipPath = path.resolve(__dirname, "/starter-kit/next-starter.zip");
      if (existsSync(directory)) {
        console.error(
          chalk.red(
            `The directory "${directory}" already exists. Please choose a different directory name.`
          )
        );

        process.exit(1);
      } else {
        fs.mkdir(directory, { recursive: true });
      }

      if (!existsSync(zipPath)) {
        console.log(chalk.red("The zip file does not exists"));
        process.exit(1);
      }
      const spinner = ora("Initializing Project").start();
      await decompress(zipPath, directory);
      spinner.stop();
      console.log(chalk.green("Project initialized successfuly"));
    } catch (error) {
      console.log(chalk.red(error));
    }
  });
