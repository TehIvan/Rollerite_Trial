const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { generateEmbed } = require("../utils/util");
const { deleteSuggestion } = require("../utils/sql");
const { acceptSuggestion } = require("../utils/suggestion");
const { suggestionsChannelId, embedSettings } = require(process.cwd() + "/config/config.json");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("accept-suggestion")
        .setDescription("Accepts a suggestion")
        .addStringOption(s => s.setName("id").setDescription("ID of the suggestion").setRequired(false))
        .addStringOption(s => s.setName("msg").setDescription("Message ID of the suggestion").setRequired(false))
        .toJSON(),
    run: async (client, interaction) => {
        acceptSuggestion(client, interaction);
    }
}