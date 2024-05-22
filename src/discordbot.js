import dotenv from "dotenv";
import { Client, IntentsBitField, EmbedBuilder, Partials } from "discord.js";
import schedule from "node-schedule";
import { getUpcomingCommunityDays } from "./community-days.js";
import { fetchMysteryGifts, fetchTeraRaids } from "./violetScarletEvents.js";

dotenv.config();

const config = {
  links: {
    officialVioletScarletEvents: "https://scarletviolet.pokemon.com/en-us/events/",
    howToClaimGift: "https://www.nintendo.com/au/support/articles/how-to-receive-a-mystery-gift-pokemon-scarlet-pokemon-violet/"
  },
  colors: {
    teraRaid: "#a1ff4a",
    mysteryGiftExpire: "#ff4dd2",
    communityDay: "#806dfc"
  },
  channelNames: {
    general: "general"
  },
  time: {
    day: 24 * 60 * 60 * 1000,
    giftExpireReminderTime: 3
  },
  images: {
    mysteryGift: "https://www.dexerto.com/cdn-cgi/image/width=3840,quality=60,format=auto/https://editors.dexerto.com/wp-content/uploads/2022/08/17/pokemon-scarlet-violet-mystery-gift-header.jpg"
  },
  commands: {
    listMysteryGifts: "gift codes"
  }
}

const today = new Date("2025-02-25 00:00:00");

const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

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
  if(botMentioned(message) && message.content.toLocaleLowerCase().includes(config.commands.listMysteryGifts)) {

    sendUnexpiredGiftCodes(message);
  }
});

const botMentioned = (message) => {
  return Array.from(message.mentions.users.keys()).includes(client.user.id);
}

const sendUnexpiredGiftCodes = async (message) => {
  const gifts = await fetchMysteryGifts();

  const formatted = gifts.map(d => {
    return `- **${d.gift}** - expires ${d.expires?.toLocaleDateString() || "N/A"}\n  ${d.code}`
  });

  message.reply(`Hey <@${message.author.id}>, here is a list of all unexpired gift codes!\n${formatted.join("\n")}`)
}

const sendCommunityDayReminder = async () => {
  const communityDays = await getUpcomingCommunityDays();
  const upcomingTomorrow = communityDays.find(d => isNearingExpire(config.time.day, d.date));

  if (upcomingTomorrow) {

    const embed = new EmbedBuilder()
    .setTitle(`\Reminder: ${upcomingTomorrow.pokemon} Community Day is tomorrow!`)
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
      {name: "Start", value: raid.start.toLocaleDateString(), inline: true},
      {name: "End", value: raid.end.toLocaleDateString(), inline: true},
    )
    .setImage(raid.imgsrc)
    .setURL(config.links.officialVioletScarletEvents)
    .setColor(config.colors.communityDay);
    
    sendEmbedToChannel(config.channelNames.general, embed);
  
}

const sendExpiringGiftCodeReminder = async () => {
  const giftCodes = await fetchMysteryGifts();

  const timeFrame = config.time.giftExpireReminderTime * config.time.day;

  const expiresSoon = giftCodes.find(codes => codes.expires && isNearingExpire(timeFrame, codes.expires));

  if(expiresSoon) {
    const embed = new EmbedBuilder()
      .setTitle(`Expiring soon! Mystery Gift: ${expiresSoon.gift}`)
      .setDescription(`Claim using code: ${expiresSoon.code}`)
      .addFields(
        {name: "Expires on", value: expiresSoon.expires.toLocaleDateString()}
      )
      .setImage(config.images.mysteryGift)
      .setColor(config.colors.mysteryGiftExpire);

      sendEmbedToChannel(config.channelNames.general, embed);
  }
}

const isNearingExpire = (expireTimeFrame, expireTime) => {
  return expireTime.valueOf() - today.valueOf() === expireTimeFrame;
}

const sendEmbedToChannel = (channelName, embed) => {
  const guilds = client.guilds.cache;
  const keys = guilds.keys();

  for (const key of keys) {
    const guild = guilds.get(key);
    const channel = guild.channels.cache.find((d) => d.name === channelName);
    channel.send({embeds: [embed]});
  }
}

const sendMessageToChannel = (channelName, message) => {
  const guilds = client.guilds.cache;
  const keys = guilds.keys();

  for (const key of keys) {
    const guild = guilds.get(key);
    const channel = guild.channels.cache.find((d) => d.name === channelName);
    channel.send({content: message});
  }
}