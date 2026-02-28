/* eslint-disable @typescript-eslint/no-misused-promises */
import { Client, Events } from 'discord.js';
import tags from "sholatku-reminder-shared/utils/Tags.js";
import client from './Client.js';
import { CommandHandler } from './CommandHandler.js';
import { DiscordListener } from './Listener.js';

console.log(`[${tags.Discord}] Loaded Discord Index Script.`) 

const commandHandler = new CommandHandler();
const listener = new DiscordListener();

client.on(Events.ClientReady, async (bot: Client) => {
  // loads commands
  await commandHandler.loadCommands();
  await commandHandler.loadDropdowns();
  await commandHandler.loadButtons();
  await commandHandler.loadModals();

  // register commands to discord
  await commandHandler.registerCommands();

  console.log('');
  console.log(`[${tags.Discord}] Connected to Discord API.`);
  console.log(`[${tags.Discord}] Bot Information:`);
  console.log(`[${tags.Discord}] ID           : ${bot?.user?.id ?? '-'}`);
  console.log(`[${tags.Discord}] Username     : ${bot?.user?.username ?? '-'}`);
  console.log(`[${tags.Discord}] Display Name : ${bot?.user?.displayName ?? '-'}`);
  console.log(`[${tags.Discord}] Tags         : ${bot?.user?.discriminator ?? '-'}`);
  console.log(`[${tags.Discord}] Servers      : ${bot?.guilds.cache.size ?? '-'} Server${bot?.guilds?.cache?.size > 1 ? 's' : ''}`);
  console.log('');

  listener.listen();
});

client.on(Events.InteractionCreate, async interaction => {
  await commandHandler.handleInteraction(interaction);
});
