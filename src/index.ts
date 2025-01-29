import {
  Telegent,
  LoggerPlugin,
  SolanaPlugin,
  ImageGenerationPlugin,
  CodexPlugin,
} from "telegent";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";

interface Config {
  TELEGRAM_TOKEN: string;
  CLAUDE_API_KEY: string;
}

function validateConfig(): Config {
  dotenv.config();
  const { TELEGRAM_TOKEN, CLAUDE_API_KEY } = process.env;

  if (!TELEGRAM_TOKEN || !CLAUDE_API_KEY) {
    throw new Error(
      "Missing required environment variables: TELEGRAM_TOKEN or CLAUDE_API_KEY"
    );
  }

  return { TELEGRAM_TOKEN, CLAUDE_API_KEY };
}

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function main() {
  try {
    const config = validateConfig();
    const dataDir = path.join(__dirname, "../data");
    await ensureDirectoryExists(dataDir);

    let bot_config = {
      telegram: { token: config.TELEGRAM_TOKEN },
      ai: {
        provider: "claude" as const,
        claudeApiKey: process.env.CLAUDE_API_KEY,
        deepseekApiKey: "your-deepseek-api-key",
      },
      memory: { path: dataDir },
      openai: { apiKey: process.env.OPENAI_API_KEY },
      codex: { apiKey: process.env.CODEX_API_KEY },
    };

    const bot = new Telegent(bot_config);

    process.once("SIGINT", () => void bot.stop());
    process.once("SIGTERM", () => void bot.stop());

    await bot.registerPlugin(new LoggerPlugin());
    await bot.registerPlugin(new SolanaPlugin({ dataPath: dataDir }));
    await bot.registerPlugin(new ImageGenerationPlugin(bot_config));
    await bot.registerPlugin(new CodexPlugin(bot_config));
    await bot.start();
    console.log("Bot started successfully");
  } catch (error) {
    console.error(
      "Failed to start bot:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
