const { getLatestProfile } = require('../../../API/functions/getLatestProfile.js');
const { formatUsername } = require('../../contracts/helperFunctions.js');
const minecraftCommand = require('../../contracts/minecraftCommand.js');
const { getBestiary } = require('../../../API/stats/bestiary.js');
const Logger = require('#root/src/Logger.js');

class BestiaryCommand extends minecraftCommand {
    constructor(minecraft) {
        super(minecraft);

        this.name = 'bestiary';
        this.aliases = ['be'];
        this.description = 'Bestiary of specified user.';
        this.options = [
            {
                name: 'username',
                description: 'Mincraft Username',
                required: false
            }
        ];
    }

    async onCommand(username, message, channel = 'gc') {
        try {
            const args = this.getArgs(message);

            const playerUsername = username;
            const mob = args[1];
            username = args[0] || username;

            const data = await getLatestProfile(username);

            username = formatUsername(username, data.profileData?.game_mode);

            const bestiary = getBestiary(data.profile);
            if (bestiary === null) {
                return this.send(`/${channel} This player has not yet joined SkyBlock since the bestiary update.`);
            }

            if (mob) {
                const allMobs = this.getBestiaryObject(bestiary);
                
                // First try to find an exact match
                let mobData = allMobs.find((m) =>
                    m.name.toLowerCase() === mob.toLowerCase()
                );
                
                // If no exact match, find all partial matches and sort them
                if (!mobData) {
                    const matches = allMobs.filter((m) =>
                        m.name.toLowerCase().includes(mob.toLowerCase())
                    );
                    
                    if (matches.length > 1) {
                        // Sort matches by name length (shorter names first) then alphabetically
                        // This ensures "Worm" comes before "Flaming Worm"
                        matches.sort((a, b) => {
                            if (a.name.length !== b.name.length) {
                                return a.name.length - b.name.length;
                            }
                            return a.name.localeCompare(b.name);
                        });
                        
                        const matchNames = matches.map(m => `${m.name} (${m.kills}/${m.nextTierKills})`).join(', ');
                        this.send(`/${channel} Multiple matches found: ${matchNames}. Showing first match.`);
                    }
                    
                    mobData = matches[0]; // Take the first (shortest/alphabetically first) match
                }

                if (mobData) {
                    this.send(
                        `/${channel} ${username}'s ${mobData.name} Bestiary: ${mobData.kills} / ${mobData.nextTierKills} (${
                            mobData.nextTierKills - mobData.kills
                        }) `
                    );

                    await new Promise((resolve) => setTimeout(resolve, 1000));
                } else {
                    this.send(`/${channel} No bestiary data found for "${mob}".`);
                    return;
                }
            }

            this.send(
                `/${channel} ${username}'s Bestiary Milestone: ${bestiary.milestone} / ${bestiary.maxMilestone} | Unlocked Tiers: ${bestiary.tiersUnlocked} / ${bestiary.totalTiers}`
            );

            if (playerUsername === username) {
                const bestiaryData = this.getBestiaryObject(bestiary).sort(
                    (a, b) => a.nextTierKills - a.kills - (b.nextTierKills - b.kills)
                );

                const topFive = bestiaryData.slice(0, 5);
                const topFiveMobs = topFive.map((mob) => {
                    return `${mob.name}: ${mob.kills} / ${mob.nextTierKills} (${mob.nextTierKills - mob.kills})`;
                });

                await new Promise((resolve) => setTimeout(resolve, 1000));

                this.send(`/${channel} Closest to level up: ${topFiveMobs.join(', ')}`);
            }
        } catch (error) {
            Logger.warnMessage(error);
            this.send(`/${channel} [ERROR] ${error}`);
        }
    }

    getBestiaryObject(bestiary) {
        return Object.keys(bestiary.categories)
            .map((category) => {
                if (category === 'fishing') {
                    return Object.keys(bestiary.categories[category])
                        .map((key) => {
                            if (key === 'name') return null;
                            return bestiary.categories[category][key].mobs?.map((mob) => mob) || [];
                        })
                        .filter(Boolean)
                        .flat();
                } else {
                    return bestiary.categories[category].mobs?.map((mob) => mob) || [];
                }
            })
            .flat()
            .filter((mob) => mob?.nextTierKills != null);
    }
}

module.exports = BestiaryCommand;
