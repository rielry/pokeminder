import dotenv from "dotenv";
import {
  Client,
  IntentsBitField,
  EmbedBuilder,
  Partials,
  Collection,
  Events
} from "discord.js";
import schedule from "node-schedule";
import { getUpcomingCommunityDays } from "./communityDays.js";
import { fetchMysteryGifts, fetchTeraRaids } from "./violetScarletEvents.js";
import { isNearingExpire, botMentioned } from "./utils.js";
import giftCodes from "./commands/gift-codes.js";
import {botConfig as config} from "./config.js";

dotenv.config();

const today = new Date("2025-02-25 00:00:00");

const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.commands = new Collection();
client.commands.set(config.slashCommands.giftCodes, giftCodes);

client.login(process.env.CLIENT_TOKEN);

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  schedule.scheduleJob("30 9 * * *", async () => {
    sendCommunityDayReminder();
    sendTeraRaidNotification();
    sendExpiringGiftCodeReminder();
  });
});

client.on("messageCreate", (message) => {
  if (
    botMentioned(message, client) &&
    message.content
      .toLocaleLowerCase()
      .includes(config.slashCommands.listMysteryGifts)
  ) {
    sendUnexpiredGiftCodes(message);
  }
});

client.on(Events.InteractionCreate, (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    command.execute(interaction);
  }
});

const sendCommunityDayReminder = async () => {
  const communityDays = await getUpcomingCommunityDays();
  const upcomingTomorrow = communityDays.find((d) =>
    isNearingExpire(config.time.day, d.date)
  );

  if (upcomingTomorrow) {
    const embed = new EmbedBuilder()
      .setTitle(
        `\Reminder: ${upcomingTomorrow.pokemon} Community Day is tomorrow!`
      )
      .setDescription(upcomingTomorrow.dateAndTime)
      .setURL(upcomingTomorrow.url)
      .setImage(upcomingTomorrow.image)
      .setColor(config.colors.teraRaid);

    sendEmbedToChannel(config.channelNames.general, embed);
  }
};

const sendTeraRaidNotification = async () => {
  const upcomingRaids = await fetchTeraRaids();
  const raid = upcomingRaids[0];

  const embed = new EmbedBuilder()
    .setTitle(raid.title)
    .setDescription(raid.description)
    .addFields(
      { name: "Start", value: raid.start.toLocaleDateString(), inline: true },
      { name: "End", value: raid.end.toLocaleDateString(), inline: true }
    )
    .setImage(raid.imgsrc)
    .setURL(config.links.officialVioletScarletEvents)
    .setColor(config.colors.communityDay);

  sendEmbedToChannel(config.channelNames.general, embed);
};

const sendExpiringGiftCodeReminder = async () => {
  const giftCodes = await fetchMysteryGifts();

  const timeFrame = config.time.giftExpireReminderTime * config.time.day;

  const expiresSoon = giftCodes.find(
    (codes) => codes.expires && isNearingExpire(timeFrame, codes.expires)
  );

  if (expiresSoon) {
    const embed = new EmbedBuilder()
      .setTitle(`Expiring soon! Mystery Gift: ${expiresSoon.gift}`)
      .setDescription(`Claim using code: ${expiresSoon.code}`)
      .addFields({
        name: "Expires on",
        value: expiresSoon.expires.toLocaleDateString(),
      })
      .setImage(config.images.mysteryGift)
      .setColor(config.colors.mysteryGiftExpire);

    sendEmbedToChannel(config.channelNames.general, embed);
  }
};

const sendEmbedToChannel = (channelName, embed) => {
  const guilds = client.guilds.cache;
  const keys = guilds.keys();

  for (const key of keys) {
    const guild = guilds.get(key);
    const channel = guild.channels.cache.find((d) => d.name === channelName);
    channel.send({ embeds: [embed] });
  }
};

const sendMessageToChannel = (channelName, message) => {
  const guilds = client.guilds.cache;
  const keys = guilds.keys();

  for (const key of keys) {
    const guild = guilds.get(key);
    const channel = guild.channels.cache.find((d) => d.name === channelName);
    channel.send({ content: message });
  }
};
