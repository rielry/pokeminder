import { botConfig as config } from "../../config.js";

export default Object.keys(config.slashCommands).map((key) => config.slashCommands[key])