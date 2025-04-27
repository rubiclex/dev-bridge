const minecraftCommand = require('../../contracts/minecraftCommand.js');
const axios = require('axios');

class platorngCommand extends minecraftCommand {
    constructor(minecraft) {
        super(minecraft);

        this.name = 'platorng';
        this.aliases = ['ptr'];
        this.description = 'Sends your Platow Rng Value';
        this.options = [
            {
                name: 'username',
                description: 'Minecraft username',
                required: false
            }
        ];
    }
    
    async onCommand(username, message, channel = 'gc') {
        try {
            
            let passed_username = this.getArgs(message)[0];
            username = passed_username || username;
            
            let rngvalue = Math.random() * (100 - 0) + 0;           
            if (username == "Platow") {
                rngvalue = 100;
            }
            rngvalue = rngvalue.toFixed(2);
            this.send(`/${channel} ${username}'s PlatoRNG: ${rngvalue}%`)
                        
        } catch (error) {
            this.send(`/${channel} [ERROR] ${error}`);
        }
    }
}

module.exports = platorngCommand;