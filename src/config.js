export const botConfig = {
  links: {
    officialVioletScarletEvents:
      "https://scarletviolet.pokemon.com/en-us/events/",
    howToClaimGift:
      "https://www.nintendo.com/au/support/articles/how-to-receive-a-mystery-gift-pokemon-scarlet-pokemon-violet/",
  },
  colors: {
    teraRaid: "#a1ff4a",
    mysteryGiftExpire: "#ff4dd2",
    communityDay: "#806dfc",
  },
  channelNames: {
    general: "general",
  },
  time: {
    day: 24 * 60 * 60 * 1000,
    giftExpireReminderTime: 3,
  },
  images: {
    mysteryGift:
      "https://www.dexerto.com/cdn-cgi/image/width=3840,quality=60,format=auto/https://editors.dexerto.com/wp-content/uploads/2022/08/17/pokemon-scarlet-violet-mystery-gift-header.jpg",
  },
  slashCommands: {
    giftCodes: {
      name: "gift-codes",
      description: "Returns list of all unexpired Mystery Gift codes.",
    },
    teraRaids: {
      name: "tera-raids",
      description: "Returns list of all upcoming Tera raids.",
    },
  },
};
