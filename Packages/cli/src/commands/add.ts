import chalk from "chalk";
import { createWriteStream, existsSync, promises as fs } from "fs";
import ora from "ora";
import decompress from "decompress";
import { Command } from "commander";
import path from "path";
import axios from "axios";
import { execa } from "execa";
import inquirer from "inquirer";

export const add = new Command()
  .name("add")
  .description("add a component to your apps")
  .argument("component", "component name")
  .action(async (component) => {
    try {
      // Spinner for indicating progress
      const spinner = ora("Fetching component registry...").start();

      // Fetch component registry
      const registryUrl =
        "https://raw.githubusercontent.com/Sagar9980/xsite-components/main/registry.json";
      const { data: registry } = await axios.get(registryUrl);
      spinner.succeed("Fetched component registry");

      // Check if component exists in the registry
      const componentInfo = registry[component];
      if (!componentInfo) {
        console.log(chalk.red(`Component ${component} not found in registry.`));
        return;
      }

      // Handle multiple variants
      let selectedVariant;
      if (componentInfo.variants && componentInfo.variants.length > 1) {
        const { variant } = await inquirer.prompt([
          {
            type: "list",
            name: "variant",
            message: `Select a variant for ${component}:`,
            choices: componentInfo.variants.map((v: any) => v.name),
          },
        ]);
        selectedVariant = componentInfo.variants.find(
          (v: any) => v.name === variant
        );
      } else {
        selectedVariant = componentInfo.variants[0];
      }

      // Fetch and save the component
      const componentUrl = selectedVariant.url;
      const componentPath = path.resolve("components", `${component}.tsx`);
      spinner.start(`Fetching component from ${componentUrl}...`);
      const response = await axios.get(componentUrl, {
        responseType: "stream",
      });
      const writer = createWriteStream(componentPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      spinner.succeed(`Component ${component} added successfully!`);

      // Check for additional dependencies and install
      if (selectedVariant.dependencies) {
        spinner.start("Installing dependencies...");
        await execa("npm", ["install", ...selectedVariant.dependencies]);
        spinner.succeed("Dependencies installed successfully!");
      }
    } catch (error: any) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  });
