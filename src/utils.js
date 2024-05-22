import jsdom from "jsdom";

export const getDocumentFromUrl = async (url) => {
  return (await jsdom.JSDOM.fromURL(url)).window.document;
};

export const isNearingExpire = (expireTimeFrame, expireTime) => {
  return expireTime.valueOf() - today.valueOf() === expireTimeFrame;
};

export const botMentioned = (message, client) => {
  return Array.from(message.mentions.users.keys()).includes(client.user.id);
};
