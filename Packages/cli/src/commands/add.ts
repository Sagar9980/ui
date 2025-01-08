import chalk from "chalk";
import { existsSync, promises as fs } from "fs";
import ora from "ora";
import axios from "axios";
import path from "path";
import { Command } from "commander";
import { execa } from "execa";

export const add = new Command()
  .name("add")
  .description("Add components to your app")
  .argument("[components...]", "The components to add")
  .requiredOption("-c, --target <directory>", "Target directory")
  .action(async (components, options) => {
    const targetDir = path.resolve(process.cwd(), options.target);

    try {
      const spinner = ora("Fetching component registry...").start();

      // Fetch the component registry
      const registryUrl = "https://xsite.beeaver.com.np/registry/index.json";
      const { data: registry } = await axios.get(registryUrl);
      spinner.succeed("Fetched component registry");

      // Validate component slugs
      const missingComponents = components.filter(
        (component: any) =>
          !registry.some((entry: any) => entry.slug === component)
      );

      if (missingComponents.length > 0) {
        console.log(
          chalk.red(
            `The following components are not found in the registry: ${missingComponents.join(
              ", "
            )}`
          )
        );
        return;
      }

      // Process each component
      for (const component of components) {
        const componentDetailsUrl = `https://xsite.beeaver.com.np/registry/ui/${component}.json`;
        spinner.start(`Fetching details for component: ${component}...`);

        const { data: componentDetails } = await axios.get(componentDetailsUrl);
        spinner.succeed(`Fetched details for component: ${component}`);

        for (const file of componentDetails.files) {
          const filePath = path.join(targetDir, file.target);
          const fileDir = path.dirname(filePath);

          spinner.start(`Writing file: ${file.target}...`);

          // Ensure the target directory exists
          await fs.mkdir(fileDir, { recursive: true });

          // Write the file content
          await fs.writeFile(filePath, file.content, "utf8");
          spinner.succeed(`Wrote file: ${file.target}`);
        }

        console.log(chalk.green(`Component ${component} added successfully.`));

        // Install dependencies
        try {
          spinner.start("Checking for already installed components...");

          // Filter components that are not already installed
          const componentsToInstall = [];
          for (const component of componentDetails.single_component) {
            const componentPath = path.join(
              targetDir,
              "components",
              "ui",
              `${component}.tsx`
            ); // Adjust path as per your structure

            // Check if the file exists
            if (existsSync(componentPath)) {
              console.log(
                chalk.yellow(
                  `Component "${component}" is already installed. Skipping...`
                )
              );
            } else {
              componentsToInstall.push(component);
            }
          }

          spinner.succeed("Component check completed.");

          if (componentsToInstall.length) {
            spinner.start("Installing dependencies...");

            // Install only the components that are not already installed
            await execa(
              "pnpm",
              ["dlx", "shadcn@latest", "add", ...componentsToInstall],
              {
                cwd: targetDir,
                stdio: "inherit",
              }
            );

            console.log(chalk.green("Dependencies installed successfully."));
          } else {
            console.log(
              chalk.blue("All components are already installed. Nothing to do.")
            );
          }
        } catch (error: any) {
          spinner.fail("An error occurred during installation.");
          console.error(chalk.red("Error:", error.message || error));
        } finally {
          spinner.stop();
        }
      }
    } catch (error: any) {
      ora().fail("An error occurred while adding components.");
      console.error(error.message || error);
    }
  });
