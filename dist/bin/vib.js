#!/usr/bin/env node
import chalk from "chalk";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import path from "path";
import prompts from "prompts";
import { ciWorkflow } from "./templates/ci-workflow.js";
import { getEnvExample, getEnvFile, getEnvLocal, } from "./templates/env-files.js";
import { getVibStarterPage } from "./templates/vib-starter-page.js";
function showLogo() {
    console.log(chalk.cyan(`
██╗   ██╗██╗██████╗
██║   ██║██║██╔══██╗
██║   ██║██║██████╔╝
╚██╗ ██╔╝██║██╔══██╗
 ╚████╔╝ ██║██████╔╝
  ╚═══╝  ╚═╝╚═════╝

Vibe Coding Scaffold
`));
}
async function ensurePnpmAvailable() {
    try {
        await execa("pnpm", ["--version"]);
    }
    catch {
        throw new Error("pnpm is not available. Install it from https://pnpm.io/installation");
    }
}
function ensureProjectDirAvailable(projectDir) {
    if (fs.existsSync(projectDir)) {
        throw new Error(`Directory already exists: ${projectDir}`);
    }
}
function logCommandError(error) {
    const { stderr = "", shortMessage = "" } = typeof error === "object" && error !== null ? error : {};
    const message = stderr || shortMessage;
    if (typeof message === "string" && message.trim()) {
        console.error(chalk.red(`\n${message.trim()}\n`));
    }
}
async function run() {
    showLogo();
    try {
        await ensurePnpmAvailable();
        const response = (await prompts([
            {
                type: "text",
                name: "projectName",
                message: "Project name",
                initial: "my-app",
            },
            {
                type: "multiselect",
                name: "features",
                message: "Select features",
                instructions: false,
                choices: [
                    { title: "Convex backend", value: "convex", selected: true },
                    { title: "Clerk authentication", value: "clerk", selected: true },
                    { title: "AI SDK (OpenAI)", value: "ai", selected: true },
                    { title: "Sentry monitoring", value: "sentry", selected: false },
                    { title: "shadcn UI", value: "shadcn", selected: true },
                    { title: "CI workflow", value: "ci", selected: true },
                ],
            },
        ]));
        const { projectName, features = [] } = response ?? {};
        if (!projectName) {
            console.log(chalk.red("No project name provided."));
            process.exit(1);
        }
        const projectDir = path.join(process.cwd(), projectName);
        ensureProjectDirAvailable(projectDir);
        const createSpinner = ora("Creating Next.js project").start();
        try {
            createSpinner.stop();
            await execa("pnpm", [
                "create",
                "next-app",
                projectName,
                "--ts",
                "--tailwind",
                "--eslint",
                "--app",
                "--src-dir",
                "--import-alias",
                "@/*",
                "--use-pnpm",
            ], { stdio: "inherit" });
            createSpinner.succeed("Next.js project created");
        }
        catch (error) {
            createSpinner.fail("Next.js project failed");
            logCommandError(error);
            throw error;
        }
        try {
            const starterPagePath = path.join(projectDir, "src/app/page.tsx");
            await fs.writeFile(starterPagePath, getVibStarterPage(features));
        }
        catch (error) {
            logCommandError(error);
            throw error;
        }
        if (features.length > 0) {
            const deps = [];
            if (features.includes("convex")) {
                deps.push("convex");
            }
            if (features.includes("clerk")) {
                deps.push("@clerk/nextjs");
            }
            if (features.includes("ai")) {
                deps.push("ai", "@ai-sdk/openai");
            }
            if (features.includes("sentry")) {
                deps.push("@sentry/nextjs");
            }
            if (deps.length > 0) {
                const depSpinner = ora("Installing dependencies").start();
                try {
                    await execa("pnpm", ["add", ...deps], {
                        cwd: projectDir,
                        stdout: "ignore",
                        stderr: "pipe",
                    });
                    depSpinner.succeed("Dependencies installed");
                }
                catch (error) {
                    depSpinner.fail("Dependency install failed");
                    logCommandError(error);
                    throw error;
                }
            }
        }
        if (features.includes("shadcn")) {
            const shadcnSpinner = ora("Setting up shadcn UI").start();
            try {
                shadcnSpinner.stop();
                await execa("pnpm", ["dlx", "shadcn@latest", "init", "-y"], {
                    cwd: projectDir,
                    stdio: "inherit",
                });
                await execa("pnpm", [
                    "dlx",
                    "shadcn@latest",
                    "add",
                    "button",
                    "input",
                    "card",
                    "dialog",
                    "dropdown-menu",
                ], {
                    cwd: projectDir,
                    stdio: "inherit",
                });
                shadcnSpinner.succeed("shadcn UI installed");
            }
            catch (error) {
                shadcnSpinner.fail("shadcn setup failed");
                logCommandError(error);
                throw error;
            }
        }
        const generateSpinner = ora("Generating project helpers").start();
        try {
            const envExampleLines = [];
            const envLines = [];
            const envLocalLines = [];
            if (features.includes("convex")) {
                envExampleLines.push("NEXT_PUBLIC_CONVEX_URL=", "CONVEX_DEPLOYMENT=", "");
                envLines.push("NEXT_PUBLIC_CONVEX_URL=", "CONVEX_DEPLOYMENT=", "");
                envLocalLines.push("CONVEX_DEPLOYMENT=", "", "NEXT_PUBLIC_CONVEX_URL=", "");
            }
            if (features.includes("clerk")) {
                envExampleLines.push("CLERK_SECRET_KEY=", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=", "");
                envLines.push("CLERK_SECRET_KEY=", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=", "");
            }
            if (features.includes("ai")) {
                envExampleLines.push("OPENAI_API_KEY=", "");
                envLines.push("OPENAI_API_KEY=", "");
                envLocalLines.push("OPENAI_API_KEY=", "");
            }
            if (features.includes("sentry")) {
                envExampleLines.push("SENTRY_DSN=", "");
                envLines.push("SENTRY_DSN=", "");
            }
            if (envExampleLines.length > 0) {
                await fs.writeFile(path.join(projectDir, ".env.example"), getEnvExample(envExampleLines));
                await fs.writeFile(path.join(projectDir, ".env"), getEnvFile(envLines));
                if (envLocalLines.length > 0) {
                    await fs.writeFile(path.join(projectDir, ".env.local"), getEnvLocal(envLocalLines));
                }
            }
            const agentSections = [
                "Architecture",
                "",
                "Frontend",
                "- Next.js App Router",
                "- Tailwind",
            ];
            if (features.includes("shadcn")) {
                agentSections.push("- shadcn UI");
            }
            if (features.includes("convex")) {
                agentSections.push("", "Backend", "- Convex functions");
            }
            if (features.includes("clerk")) {
                agentSections.push("", "Auth", "- Clerk");
            }
            if (features.includes("ai")) {
                agentSections.push("", "AI", "- OpenAI via AI SDK");
            }
            agentSections.push("", "Rules");
            if (features.includes("convex")) {
                agentSections.push("- Convex queries = reads", "- Convex mutations = writes");
            }
            agentSections.push("- Do not put server logic inside React components");
            await fs.writeFile(path.join(projectDir, "AGENTS.md"), `${agentSections.join("\n")}\n`);
            if (features.includes("ai")) {
                await fs.ensureDir(path.join(projectDir, "src/lib/ai"));
                await fs.writeFile(path.join(projectDir, "src/lib/ai/client.ts"), `import { openai } from "@ai-sdk/openai"

export const model = openai("gpt-4o")
`);
            }
            if (features.includes("ci")) {
                const workflowDir = path.join(projectDir, ".github/workflows");
                await fs.ensureDir(workflowDir);
                await fs.writeFile(path.join(workflowDir, "ci.yaml"), ciWorkflow);
            }
            generateSpinner.succeed("Project helpers generated");
        }
        catch (error) {
            generateSpinner.fail("Project helper generation failed");
            logCommandError(error);
            throw error;
        }
        console.log(chalk.cyan("\nProject ready!\n"));
        const nextSteps = [`cd ${projectName}`, "pnpm dev"];
        if (features.includes("convex")) {
            nextSteps.push("pnpm dlx convex@latest dev");
        }
        console.log(`
Next steps:

${nextSteps.join("\n")}
`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        console.error(chalk.red(`\n${message}\n`));
        process.exit(1);
    }
}
void run();
