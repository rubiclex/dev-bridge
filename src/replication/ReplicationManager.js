const { Client, Collection, AttachmentBuilder, GatewayIntentBits } = require('discord.js');
const CommunicationBridge = require('../contracts/CommunicationBridge.js');
const { replaceVariables } = require('../contracts/helperFunctions.js');
const messageToImage = require('../contracts/messageToImage.js');
const MessageHandler = require('./handlers/MessageHandler.js');
const StateHandler = require('./handlers/StateHandler.js');
const CommandHandler = require('./CommandHandler.js');
const config = require('#root/config.js').getConfig();
const Logger = require('../Logger.js');
const { kill } = require('node:process');
const path = require('node:path');
const fs = require('fs');

class ReplicationManager extends CommunicationBridge {
    constructor(app) {
        super();

        this.app = app;

        this.stateHandler = new StateHandler(this);
        this.messageHandler = new MessageHandler(this);
        this.commandHandler = new CommandHandler(this);
    }

    async connect() {
        if (!config.replication.enabled) {
            return;
        }
        global.replication_client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
        });

        this.client = replication_client;

        this.client.on('ready', () => this.stateHandler.onReady());
        this.client.on('messageCreate', (message) => this.messageHandler.onMessage(message));

        this.client.login(config.replication.token).catch((error) => {
            Logger.errorMessage(error);
        });

        replication_client.commands = new Collection();
        const commandFiles = fs.readdirSync('src/replication/commands').filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            replication_client.commands.set(command.name, command);
        }

        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            event.once
                ? replication_client.once(event.name, (...args) => event.execute(...args))
                : replication_client.on(event.name, (...args) => event.execute(...args));
        }

        process.on('SIGINT', async () => {
            await this.stateHandler.onClose();

            process.kill(process.pid, 'SIGTERM');
        });
    }

    async getWebhook(discord, type) {
        const channel = await this.stateHandler.getChannel(type);
        const webhooks = await channel.fetchWebhooks();

        if (webhooks.size === 0) {
            channel.createWebhook({
                name: 'Hypixel Chat Bridge',
                avatar: 'https://imgur.com/tgwQJTX.png'
            });

            await this.getWebhook(discord, type);
        }

        return webhooks.first();
    }

    async onBroadcast({ fullMessage, chat, chatType, username, rank, guildRank, message, color = 8421504 }) {
        try{
            if (chat == 'Guild/InterDiscord') {
                chat = 'Guild'; // Inter Discord Communication Support
                guildRank = 'Inter-Discord';
            }
    
            if (chat == 'Officer/InterDiscord') {
                chat = 'Officer'; // Inter Discord Communication Support
                guildRank = 'Inter-Discord';
            }
    
            if (chat == 'Debug') {
                return;
            }
    
            if (
                (chat === undefined && chatType !== 'debugChannel') ||
                ((username === undefined || message === undefined) && chat !== 'debugChannel')
            ) {
                return;
            }
    
            const mode = chat === 'debugChannel' ? 'minecraft' : config.bot.other.messageMode.toLowerCase();
            message = chat === 'debugChannel' ? fullMessage : message;
    
            // ? custom message format (config.discord.other.messageFormat)
            if (config.bot.other.messageMode === 'minecraft' && chat !== 'debugChannel') {
                message = replaceVariables(config.discord.other.messageFormat, {
                    chatType,
                    username,
                    rank,
                    guildRank,
                    message
                });
            }
    
            const channel = await this.stateHandler.getChannel(chat || 'Guild');
            if (channel === undefined) {
                if ((chat = 'debugChannel')) {
                    return;
                }
                return;
            }
    
            if (chat == 'Officer') {
                channel
                    .send({
                        content: `[OFFICER]|@|${username}|@|${message}`
                    })
                    .then(
                        (message_officer) => {
                            message_officer.delete();
                        },
                        () => {}
                    );
            }
    
            switch (mode) {
                case 'bot':
                    await channel.send({
                        embeds: [
                            {
                                description: message,
                                color: this.hexToDec(color),
                                timestamp: new Date(),
                                footer: {
                                    text: guildRank
                                },
                                author: {
                                    name: username,
                                    icon_url: `https://www.mc-heads.net/avatar/${username}`
                                }
                            }
                        ]
                    });
    
                    if (message.includes('https://')) {
                        try {
                            const links = message.match(/https?:\/\/[^\s]+/g).join('\n');
    
                            channel.send(links);
                        } catch (e) {
                            // Failed to embed links, noone cares about this, right?
                        }
                    }
    
                    break;
    
                case 'webhook':
                    message = this.cleanMessage(message);
                    if (message.length === 0) {
                        return;
                    }
    
                    this.app.discord.webhook = await this.getWebhook(this.app.discord, chatType);
                    this.app.discord.webhook.send({
                        content: message,
                        username: username,
                        avatarURL: `https://www.mc-heads.net/avatar/${username}`
                    });
                    break;
    
                case 'minecraft':
                    if (fullMessage.length === 0) {
                        return;
                    }
    
                    await channel.send({
                        files: [
                            new AttachmentBuilder(await messageToImage(message, username), {
                                name: `${username}.png`
                            })
                        ]
                    });
    
                    break;
    
                default:
                    throw new Error('Invalid message mode: must be bot, webhook or minecraft');
            }
        }
        catch(e){
            Logger.warnMessage(e);
        }
    }

    async onBroadcastCleanEmbed({ message, color, channel }) {
        channel = await this.stateHandler.getChannel(channel);
        if (channel == undefined) {
            return;
        }
        channel.send({
            embeds: [
                {
                    color: color,
                    description: message
                }
            ]
        });
    }

    async onBroadcastHeadedEmbed({ message, title, icon, color, channel }) {
        channel = await this.stateHandler.getChannel(channel);
        if (channel == undefined) {
            return;
        }
        channel.send({
            embeds: [
                {
                    color: color,
                    author: {
                        name: title,
                        icon_url: icon
                    },
                    description: message
                }
            ]
        });
    }

    async onPlayerToggle({ fullMessage, username, message, color, channel }) {
        channel = await this.stateHandler.getChannel(channel);
        if (channel == undefined) {
            return;
        }
        switch (config.bot.other.messageMode.toLowerCase()) {
            case 'bot':
                channel.send({
                    embeds: [
                        {
                            color: color,
                            timestamp: new Date(),
                            author: {
                                name: `${message}`,
                                icon_url: `https://www.mc-heads.net/avatar/${username}`
                            }
                        }
                    ]
                }).catch(e => console.log(e));;
                break;
            case 'webhook':
                message = this.cleanMessage(message);
                if (message.length === 0) {
                    return;
                }

                this.app.discord.webhook = await this.getWebhook(this.app.discord, channel);
                this.app.discord.webhook.send({
                    username: username,
                    avatarURL: `https://www.mc-heads.net/avatar/${username}`,
                    embeds: [
                        {
                            color: color,
                            description: `${message}`
                        }
                    ]
                }).catch(e => console.log(e));;

                break;
            case 'minecraft':
                await channel.send({
                    files: [
                        new AttachmentBuilder(await messageToImage(fullMessage), {
                            name: `${username}.png`
                        })
                    ]
                }).catch(e => console.log(e));;
                break;
            default:
                throw new Error('Invalid message mode: must be bot or webhook');
        }
    }

    hexToDec(hex) {
        if (hex === undefined) {
            return 1752220;
        }

        if (typeof hex === 'number') {
            return hex;
        }

        return parseInt(hex.replace('#', ''), 16);
    }

    cleanMessage(message) {
        if (message === undefined) {
            return '';
        }

        return message
            .split('\n')
            .map((part) => {
                part = part.trim();
                return part.length === 0 ? '' : part.replace(/@(everyone|here)/gi, '').trim() + ' ';
            })
            .join('');
    }

    formatMessage(message, data) {
        return replaceVariables(message, data);
    }
}

module.exports = ReplicationManager;
