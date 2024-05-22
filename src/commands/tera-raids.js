import { SlashCommandBuilder } from "discord.js";
import { fetchMysteryGifts } from "../violetScarletEvents.js"; 
import commands from "./utility/commands.js";

const metadata = commands.find(d => d.name === "tera-raids");

export default {
	data: new SlashCommandBuilder()
		.setName(metadata.name)
		.setDescription(metadata.description),
	async execute(interaction) {
		const gifts = await fetchMysteryGifts();
  
		const formatted = gifts.map((d) => {
		  return `- **${d.gift}** - expires ${
			d.expires?.toLocaleDateString() || "N/A"
		  }\n  ${d.code}`;
		});
	  
		interaction.reply(
		  `Here is a list of all unexpired gift codes.\n${formatted.join("\n")}`
		);
	},
};