import { SlashCommandBuilder } from "discord.js";
import { fetchMysteryGifts } from "../violetScarletEvents.js";
import { botConfig as config } from "../config.js";

const command = config.slashCommands.giftCodes;

export default {
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),
  async execute(interaction) {
    const gifts = await fetchMysteryGifts();

    if (gifts.length === 0) {
      interaction.reply("There are no gifts codes at this time :(");
    } else {
      const formatted = gifts.map((d) => {
        return `- **${d.gift}** - expires ${
          d.expires?.toLocaleDateString() || "N/A"
        }\n  ${d.code}`;
      });

      interaction.reply(
        `Here is a list of all unexpired gift codes.\n${formatted.join("\n")}`
      );
    }
  },
};
