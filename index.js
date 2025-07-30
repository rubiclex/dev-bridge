require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const logger = require('./utils/logger');
const authHandler = require('./handler/authHandler');
const { hasPermission, getPermissionDeniedMessage } = require('./utils/permissionChecker');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Load command handlers
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(`The command at ./commands/${file} is missing a required "data" or "execute" property.`);
  }
}

// Ready
client.once('ready', async () => {
  logger.info(`Logged in as ${client.user.tag}`);
  
  // Initialize backend authentication
  try {
    await authHandler.authenticate();
    logger.info('Backend authentication initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize backend authentication:', error);
  }

  // Initialize the Bull Queue worker (just require it, no need to call any methods)
  require('./handler/discordQueueWorker');
  logger.info('🔄 Discord queue worker initialized');
});

// Slash command handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  // Check permissions before executing command
  if (!hasPermission(interaction, interaction.commandName)) {
    const errorMessage = getPermissionDeniedMessage(interaction.commandName);
    return interaction.reply({ content: errorMessage, ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error('Error executing command:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, clearing authentication tokens');
  authHandler.clearTokens();
  
  // Get the queue and close it properly
  const discordQueue = require('./handler/discordQueueWorker');
  try {
    await discordQueue.close();
    logger.info('Bull Queue closed successfully');
  } catch (error) {
    logger.error('Error closing Bull Queue:', error);
  }
  
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, clearing authentication tokens');
  authHandler.clearTokens();
  
  // Get the queue and close it properly
  const discordQueue = require('./handler/discordQueueWorker');
  try {
    await discordQueue.close();
    logger.info('Bull Queue closed successfully');
  } catch (error) {
    logger.error('Error closing Bull Queue:', error);
  }
  
  client.destroy();
  process.exit(0);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Export the client for use in other modules
module.exports = client;