import { Client, GatewayIntentBits } from 'discord.js';
import { env } from '../../ts-discord-bot-starter/src/utils/EnvManager.js';

const BotToken = env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

void client.login(BotToken);

export default client;