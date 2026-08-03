import * as readline from "readline";

type LogVariant = "info" | "success" | "warning" | "error";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
};

const variants: Record<LogVariant, { color: string; icon: string }> = {
  info: { color: colors.cyan, icon: "i" },
  success: { color: colors.green, icon: "+" },
  warning: { color: colors.yellow, icon: "!" },
  error: { color: colors.red, icon: "x" },
};

function log(variant: LogVariant, message: string): void {
  const { color, icon } = variants[variant];
  console.log(`${color}${colors.bold}${icon}${colors.reset} ${message}`);
}

export const cli = {
  title(title: string): void {
    console.log(`\n${colors.cyan}${colors.bold}${title}${colors.reset}`);
    console.log(`${colors.dim}${"-".repeat(title.length)}${colors.reset}\n`);
  },
  info(message: string): void {
    log("info", message);
  },
  success(message: string): void {
    log("success", message);
  },
  warning(message: string): void {
    log("warning", message);
  },
  error(message: string): void {
    log("error", message);
  },
  detail(label: string, value: string | number): void {
    console.log(`  ${colors.dim}${label}:${colors.reset} ${value}`);
  },
  list(title: string, items: string[]): void {
    console.log(`\n${colors.bold}${title}${colors.reset}`);
    items.forEach((item, index) => {
      console.log(`  ${colors.cyan}${index + 1}.${colors.reset} ${item}`);
    });
  },
  prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(
        `${colors.yellow}${colors.bold}?${colors.reset} ${question} `,
        (answer) => {
          rl.close();
          resolve(answer.trim());
        },
      );
    });
  },
};
