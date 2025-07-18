import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import "dotenv/config";
import { notifyAboutLastUserMatch } from "./utils";
import { setupDb } from "./db";
import people from "../people.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const ritoToken = process.env.RIOT_TOKEN ?? "";
const channelId = process.env.CHANNEL_ID ?? "";
client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user?.tag}`);
  const channel = await client.channels.fetch(channelId);
  const db = await setupDb();

  if (channel && channel instanceof TextChannel) {
    for (const user of people) {
      if (user.game === "lol") {
        await notifyAboutLastUserMatch(user.username, user.tag, ritoToken, channel);
      }
    }

    process.exit(0);
  }
});

client.login(process.env.DISCORD_TOKEN);
