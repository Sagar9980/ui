import chalk from "chalk";
import { createWriteStream, existsSync } from "fs";
import { promises as fs } from "fs";
import ora from "ora";
import decompress from "decompress";
import { Command } from "commander";
import path from "path";
import axios from "axios";

export const create = new Command()
  .name("create-app")
  .description("add a starter kit for Next.js")
  .argument("directory", "app name")
  .action(async (directory) => {
    const url = "https://xui.beeaver.com.np/xsite-template/template-1.zip";

    try {
      if (existsSync(directory)) {
        console.error(
          chalk.red(
            `The directory "${directory}" already exists. Please choose a different directory name.`
          )
        );
        process.exit(1);
      } else {
        await fs.mkdir(directory, { recursive: true });
      }

      const spinner = ora("Initializing Project...").start();
      const zipPath = path.join(directory, "template.zip");

      // Download the zip file
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = createWriteStream(zipPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      spinner.text = "Extracting project files...";

      // Extract the zip file
      await decompress(zipPath, directory);

      // Delete the downloaded zip file
      await fs.unlink(zipPath);

      // Check if the extraction resulted in a nested folder
      const extractedItems = await fs.readdir(directory);
      if (extractedItems.length === 1) {
        const extractedPath = path.join(directory, extractedItems[0]);

        // Check if the extracted item is a directory
        const stat = await fs.stat(extractedPath);
        if (stat.isDirectory()) {
          const innerItems = await fs.readdir(extractedPath);

          // Move files from the nested directory to the root directory
          for (const item of innerItems) {
            const sourcePath = path.join(extractedPath, item);
            const destPath = path.join(directory, item);
            await fs.rename(sourcePath, destPath);
          }

          // Remove the now-empty nested directory
          await fs.rmdir(extractedPath);
        }
      }

      spinner.succeed("Project initialized successfully!");

      console.log("You can run the project using the following commands:");
      console.log(chalk.green(`cd ${directory}`));
      console.log(chalk.green("pnpm install"));
      console.log(chalk.green("pnpm dev"));
    } catch (error: any) {
      console.error(chalk.red("An error occurred: "), error.message || error);
    }
  });
