/* eslint-disable no-throw-literal */
const config = require('#root/config.js').getConfig();
const axios = require('axios');
const { hypixelRequest } = require('../utils/scfAPIHandler.js');

async function getMuseum(profileID, uuid) {
    try {
        const data = await hypixelRequest(
            `https://api.hypixel.net/v2/skyblock/museum?key=${config.API.hypixelAPIkey}&profile=${profileID}`
        );

        if (data === undefined || data.success === false) {
            throw 'Request to Hypixel API failed. Please try again!';
        }

        if (data.members === null || Object.keys(data.members).length === 0) {
            // throw "Profile doesn't have a museum.";
        }

        if (data.members[uuid] === undefined) {
            // throw "Player doesn't have a museum.";
        }

        return {
            museum: data.members ? data.members[uuid] : null,
            museumData: data.members ? data.members : null
        };
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = { getMuseum };
