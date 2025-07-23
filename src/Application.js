const DiscordManager = require('./discord/DiscordManager.js');
const MinecraftManager = require('./minecraft/MinecraftManager.js');
const apiManager = require('./api/APIManager.js');
const ReplicationManager = require('./replication/ReplicationManager.js');
const SCFAPI = require('./../API/utils/scfAPIHandler.js');
const Logger = require('./Logger.js');
const config = require('#root/config.js').getConfig();
const axios = require('axios');
const fs = require('fs').promises;
const SbuService = require('./../API/utils/sbuService.js');

const getGitId = async () => {
    try {
        const gitId = await fs.readFile('.git/HEAD', 'utf8');
        if (gitId.indexOf(':') === -1) {
            return gitId;
        }
        const refPath = '.git/' + gitId.substring(5).trim();
        return await fs.readFile(refPath, 'utf8');
    } catch (e) {
        return 'N/A';
    }
};

class Application {
    constructor() {
        this.discord = null;
        this.minecraft = null;
        this.api = null;
        this.replication = null;
        this.sbuApi = null;
        this.sbuService = null;
    }

    async register() {
        // Initialize SBU service BEFORE other components
        if (config.API.SBU.enabled) {
            try {
                Logger.infoMessage('Initializing SBU service...');
                this.sbuService = new SbuService(config.API.SBU.baseURL, config.API.SBU.authToken);
                await this.sbuService.initialize();
                
                // Make it globally available
                global.globalSbuService = this.sbuService;
                Logger.infoMessage('SBU service initialized successfully');
            } catch (error) {
                Logger.errorMessage('Failed to initialize SBU service:', error.message);
                // Don't fail the entire startup, just disable SBU features
                global.globalSbuService = null;
            }
        }

        this.discord = new DiscordManager(this);
        this.minecraft = new MinecraftManager(this);
        this.api = new apiManager(this);

        // Initialize global SBU service
        await globalSbuService.initialize();

        this.discord.setBridge(this.minecraft);
        this.minecraft.setBridge(this.discord);

        if (config.replication.enabled) {
            this.replication = new ReplicationManager(this);

            this.replication.setBridge(this.minecraft);
            this.replication.setBridge(this.discord);

            this.discord.setBridge(this.replication);
            this.minecraft.setBridge(this.replication);
        }

        // Get authenticated API instance from the global service
        this.sbuApi = globalSbuService.getService().getApiInstance();
    }

    async connect() {
        // Add a startup delay to ensure all services are ready
        Logger.infoMessage('Starting connection sequence...');
        
        this.discord.connect();
        
        // Wait a bit before connecting Minecraft to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.minecraft.connect();
        this.api.startLongpoll();
        
        if (config.replication.enabled) {
            this.replication.connect();
        }

        let fail_checks = 0;

        async function sendStatus() {
            function isBotOnline() {
                if (bot === undefined || bot._client.chat === undefined) {
                    return 0;
                }
                return 1;
            }

            let botConnected = isBotOnline();
            let commit_version = ((await getGitId()) ?? 'N/A').slice(0, 7);

            if (botConnected == 0) {
                fail_checks++;
                Logger.warnMessage(`Bot isn't connected to Hypixel. Error ${fail_checks}/5.`);
            } else {
                if (fail_checks != 0) {
                    Logger.warnMessage(`Reset failchecks.`);
                }
                fail_checks = 0;
            }

            SCFAPI.saveStatus(botConnected, commit_version);

            if (fail_checks >= 5) {
                Logger.errorMessage(`Bot will reboot, as it failed the max amount of failchecks (5/5).`);
                process.exit(124);
            }
        }

        // Wait before starting status checks
        await new Promise(resolve => setTimeout(resolve, 5000));
        sendStatus();
        setInterval(sendStatus, 30000);

        process.send({
            event_id: 'initialized',
        });
    }
}

module.exports = new Application();