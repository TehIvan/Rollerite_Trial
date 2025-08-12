const { SlashCommandBuilder } = require("discord.js");
const { showSuggestionCategories } = require("../utils/suggestion");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Suggest a feature")
        .toJSON(),
    run: (client, interaction) => {
        showSuggestionCategories(interaction);
    }
}