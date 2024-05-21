import dotenv from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import schedule from "node-schedule";
import { getUpcomingCommunityDays } from "./community-days.js";

dotenv.config();

const ONE_DAY = 24 * 60 * 60 * 1000;
const today = new Date();

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.login(process.env.CLIENT_TOKEN);

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const guilds = client.guilds.cache;
  const keys = guilds.keys();

  for (const key of keys) {
    const guild = guilds.get(key);
    const channel = guild.channels.cache.find((d) => d.name === "general");
    channel.send({ content: "online" });
  }

  schedule.scheduleJob("30 9 * * *", async () => {
    sendCommunityDayReminder();
  });
});


const sendCommunityDayReminder = async () => {
  const communityDays = await getUpcomingCommunityDays();
  const upcomingTomorrow = communityDays.find(
    (d) => d.date.valueOf() - today.valueOf() === ONE_DAY
  );

  if (upcomingTomorrow) {
    const messageContent = `\n**Reminder**: ${upcomingTomorrow.pokemon} Community Day is tomorrow!\n${upcomingTomorrow.dateAndTime}\n\n${upcomingTomorrow.url}`;

    const guilds = client.guilds.cache;
    const keys = guilds.keys();

    for (const key of keys) {
      const guild = guilds.get(key);
      const channel = guild.channels.cache.find((d) => d.name === "general");
      channel.send({ content: messageContent });
    }
  }
};
