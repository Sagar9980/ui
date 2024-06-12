import chalk from "chalk";
import { createWriteStream, existsSync, promises as fs } from "fs";
import ora from "ora";
import decompress from "decompress";
import { Command } from "commander";
import path from "path";
import axios from "axios";

export const create = new Command()
  .name("create-app")
  .description("add a starter kit for next js")
  .argument("directory", "app name")
  .action(async (directory) => {
    const url =
      "https://raw.githubusercontent.com/Sagar9980/next-starter/main/next-starter.zip";
    try {
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

      const spinner = ora("Initializing Project").start();
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });
      const zipPath = path.join(directory, "next-starter.zip");
      const writer = createWriteStream(zipPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await decompress(zipPath, directory);
        await fs.unlink(zipPath);
        spinner.stop();
        console.log(chalk.green("Project initialized successfuly"));
      });

      writer.on("error", (err) => {
        console.log(chalk.red("Error initializing project", err));
      });
    } catch (error) {
      console.log(chalk.red(error));
    }
  });
