const { Client } = require("discord.js");
const { showSuggestionModal, postSuggestion, handleVote } = require("../utils/suggestion");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Client} client 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: (client, interaction) => {

        if (interaction.isCommand()) {

            let name = interaction.commandName;
            let command = client.commands.get(name);

            if (command != null) command.run(client, interaction);
        }

        if (interaction.isButton() && (interaction.customId == "upvoteSuggestion" || interaction.customId == "downvoteSuggestion")) {
            handleVote(client, interaction);
        }

        if (interaction.isStringSelectMenu() && interaction.customId == "createSuggestion") {
            showSuggestionModal(interaction);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith("postSuggestion_")) {
            postSuggestion(client, interaction);
        }
    }
}