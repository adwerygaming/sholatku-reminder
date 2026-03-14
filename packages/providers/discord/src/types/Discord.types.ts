import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  Channel,
  ChatInputCommandInteraction,
  Client,
  Guild,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  User,
} from 'discord.js';

export interface SlashCommandLayout {
  metadata: SlashCommandBuilder
  execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface DropdownLayout {
  id: string;
  execute: (client: Client, interaction: AnySelectMenuInteraction, interactionKey: string) => Promise<void>;
}

export interface ButtonLayout {
  id: string;
  execute: (client: Client, interaction: ButtonInteraction, interactionKey: string) => Promise<void>;
}

export interface ModalLayout {
  id: string;
  execute: (client: Client, interaction: ModalSubmitInteraction, interactionKey: string) => Promise<void>;
}

export interface InteractionData {
  action?: "start" | "cancel" | "next" | "custom"
  guild: Guild
  channel: Channel
  user: User
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}
