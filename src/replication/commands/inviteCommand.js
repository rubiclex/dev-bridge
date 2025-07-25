const HypixelDiscordChatBridgeError = require('../../contracts/errorHandler.js');
const { EmbedBuilder } = require('discord.js');
const config = require('#root/config.js').getConfig();
const AuthProvider = require('../AuthProvider.js');

module.exports = {
    name: `${config.minecraft.bot.replication_prefix}` + 'invite',
    description: 'Invites the given user to the guild.',
    options: [
        {
            name: 'name',
            description: 'Minecraft Username',
            type: 3,
            required: true
        }
    ],

    execute: async (interaction) => {
        const user = interaction.member;
        const permission_required = 'invite';

        let permission = false;

        const AuthData = new AuthProvider();
        permission = (await AuthData.permissionInfo(user)).permissions?.[permission_required] ?? false;

        if (!permission) {
            throw new HypixelDiscordChatBridgeError(
                'You do not have permission to use this command, or the Permission API is Down.'
            );
        }

        const name = interaction.options.getString('name');
        bot.chat(`/g invite ${name}`);

        const embed = new EmbedBuilder()
            .setColor(5763719)
            .setAuthor({ name: 'Invite' })
            .setDescription(`Successfully executed \`/g invite ${name}\``)
            .setFooter({
                text: '/help [command] for more information',
                iconURL: config.API.SCF.logo
            });

        await interaction.followUp({
            embeds: [embed]
        });
    }
};
