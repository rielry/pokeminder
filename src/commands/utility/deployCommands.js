import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import commands from "./commands.js";

dotenv.config();

const rest = new REST().setToken(process.env.CLIENT_TOKEN);
const clientId = process.env.CLIENT_ID;
const serverId = process.env.SERVER_ID;

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, serverId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();