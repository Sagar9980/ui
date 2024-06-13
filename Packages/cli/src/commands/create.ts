import chalk from "chalk";
import { createWriteStream, existsSync, promises as fs } from "fs";
import ora from "ora";
import decompress from "decompress";
import { Command } from "commander";
import path from "path";
import axios from "axios";
import { execa } from "execa";

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
        console.log(chalk.green("Project initialized successfuly"));
        process.chdir(directory);
        console.log(`Changed directory to ${directory}`);

        spinner.text = "Installing dependencies...";

        await execa("pnpm", ["install"], { stdio: "inherit" });

        console.log(chalk.green("Dependencies installed successfully."));
        spinner.stop();

        console.log("You can run project using following commands:");
        console.log(`cd ${directory}`);
        console.log("pnpm dev");
      });

      writer.on("error", (err) => {
        console.log(chalk.red("Error initializing project", err));
      });
    } catch (error) {
      console.log(chalk.red(error));
    }
  });
