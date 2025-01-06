import { Telegent } from "telegent/dist/index";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

if (!TELEGRAM_TOKEN || !CLAUDE_API_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const bot = new Telegent({
  telegram: {
    token: TELEGRAM_TOKEN,
  },
  claude: {
    apiKey: CLAUDE_API_KEY,
  },
  memory: {
    path: path.join(__dirname, "../data/vectordb"),
  },
});

// Handle graceful shutdown
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot
  .start()
  .then(() => {
    console.log("Bot started successfully");
  })
  .catch((error: any) => {
    console.error("Failed to start bot:", error);
    process.exit(1);
  });
