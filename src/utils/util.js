const { EmbedBuilder } = require("@discordjs/builders");
const { resolveColor } = require("discord.js");
const { embedSettings } = require(process.cwd() + "/config/config.json");

function generateEmbed(options) {
    return new EmbedBuilder(options).setFooter(embedSettings.footer).setColor(resolveColor(embedSettings.color));
}

function mapToJson(map) {
    const obj = {};
    for (const [key, value] of map) {
        obj[key] = value instanceof Map ? mapToJson(value) : value;
    }
    return JSON.stringify(obj);
}


module.exports = {
    generateEmbed, mapToJson
}