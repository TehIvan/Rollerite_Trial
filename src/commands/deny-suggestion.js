const { SlashCommandBuilder } = require("discord.js");
const { denySuggestion } = require("../utils/suggestion");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("deny-suggestion")
        .setDescription("Denies a suggestion")
        .addStringOption(s => s.setName("id").setDescription("ID of the suggestion").setRequired(false))
        .addStringOption(s => s.setName("msg").setDescription("Message ID of the suggestion").setRequired(false))
        .toJSON(),
    run: async (client, interaction) => {
        denySuggestion(client, interaction);
     }
}