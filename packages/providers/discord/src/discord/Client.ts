import { Client, GatewayIntentBits } from 'discord.js';
import tags from 'sholatku-reminder-shared/utils/Tags.js';
import { env } from '../utils/EnvManager.js';

const BotToken = env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

function login(): void {   
    client.login(BotToken).catch((e) => {
        console.log(`[${tags.Error}] Discord Login Failed: ${e}`)

        setTimeout(() => {
            login()
        }, 3000);
    });
}

login()

export default client;