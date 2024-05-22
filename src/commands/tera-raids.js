import { SlashCommandBuilder } from "discord.js";
import { fetchTeraRaids } from "../violetScarletEvents.js";
import { botConfig as config } from "../config.js";

const command = config.slashCommands.teraRaids;

export default {
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),
  async execute(interaction) {
    interaction.deferReply();

    try {
      const raids = await fetchTeraRaids();

      if (raids.length === 0) {
        interaction.editReply("There are no upcoming raids at this time :(");
      } else {
        const formatted = raids.map((raid) => {
          return `- **${
            raid.title
          }** (${raid.start.toLocaleDateString()} - ${raid.end.toLocaleDateString()})`;
        });

        interaction.editReply(
          `Here are the upcoming raids!\n${formatted.join("\n")}`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      interaction.editReply("Error occurred, try again later :(");
    }
  },
};
