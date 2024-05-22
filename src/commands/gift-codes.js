import { SlashCommandBuilder } from "discord.js";
import { fetchMysteryGifts } from "../violetScarletEvents.js";
import { botConfig as config } from "../config.js";

const command = config.slashCommands.giftCodes;

export default {
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),
  async execute(interaction) {
    console.log(`Received request for ${command.name}`);
    await interaction.deferReply();

    try {
      const gifts = await fetchMysteryGifts();

      if (gifts.length === 0) {
        interaction.editReply("There are no gifts codes at this time :(");
      } else {
        const formatted = gifts.map((d) => {
          return `- **${d.gift}** - expires ${
            d.expires?.toLocaleDateString() || "N/A"
          }\n  ${d.code}`;
        });

        interaction.editReply(
          `Here is a list of all unexpired gift codes.\n${formatted.join("\n")}`
        );
      }
    } catch (e) {
      console.error(e);
      interaction.editReply("Error occurred, try again later :(");
    }
  },
};
