const { ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, Collection, StringSelectMenuBuilder } = require("discord.js");
const { generateEmbed, mapToJson } = require("../utils/util");
const { insertSuggestion, deleteSuggestion, updateVotes } = require("../utils/sql");
const { suggestionsChannelId, suggestionCategories, embedSettings } = require(process.cwd() + "/config/config.json");

function showSuggestionCategories(interaction) {
    interaction.reply({
        flags: ["Ephemeral"],
        embeds: [generateEmbed({
            title: "Please choose a category for your suggestion"
        })],
        components: [new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("createSuggestion")
                .setOptions(Object.keys(suggestionCategories).map(r => {
                    return {
                        label: r,
                        value: r
                    }
                }))
        )]
    });
}

function showSuggestionModal(interaction) {
    let category = interaction.values[0];

    interaction.showModal({
        title: `${category} - New Suggestion`,
        components: [new ActionRowBuilder().addComponents(
            new TextInputBuilder({
                style: TextInputStyle.Paragraph,
                customId: "suggestion",
                label: "Your Suggestion"
            })
        )],
        customId: "postSuggestion_" + category
    });
}

function postSuggestion(client, interaction) {

    interaction.deferReply({
        flags: ["Ephemeral"]
    })

    let suggestion = interaction.fields.getTextInputValue("suggestion");
    let category = interaction.customId.split("_").pop();
    let suggestionsChannel = interaction.guild.channels.cache.get(suggestionCategories[category]);

    suggestionsChannel.send({
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder({
                        customId: "upvoteSuggestion",
                        label: "Upvote (0)",
                        style: ButtonStyle.Primary
                    }),
                    new ButtonBuilder({
                        customId: "downvoteSuggestion",
                        label: "Downvote (0)",
                        style: ButtonStyle.Danger
                    })
                )
        ]
    }).then(msg => {
        insertSuggestion(interaction.user.id, msg.id, suggestion, category).then(id => {
            client.suggestions.set(msg.id, {
                id, suggestion, userId: interaction.user.id, msgId: msg.id, upvotes: 0, downvotes: 0,
                category, users: new Collection()
            });

            msg.edit({
                embeds: [
                    generateEmbed({
                        author: {
                            name: "From " + interaction.user.username
                        },
                        title: `#${id} Suggestion - ${category}`,
                        description: "```" + suggestion + "```"
                    })
                ],
            })

            interaction.editReply({
                embeds: [
                    generateEmbed({
                        title: "Suggestion Posted",
                        description: `Your suggestion for **${category}** has been posted.\n\`\`\`${suggestion}\`\`\``
                    })
                ]
            });
        });
    })
}

async function denySuggestion(client, interaction) {


    let id = interaction.options.getString("id", false);
    let msgId = interaction.options.getString("msg", false);

    if (id == null && msgId == null) {
        return interaction.reply({
            flags: ["Ephemeral"],
            embeds: [generateEmbed({
                title: "Error",
                description: "You need to specify either the message ID or the suggestion ID"
            })]
        })
    }

    let suggestion = (msgId == null ? client.suggestions.find(r => r.id == id) : client.suggestions.get(msgId));


    if (suggestion == null) {
        return interaction.reply({
            flags: ["Ephemeral"],
            embeds: [generateEmbed({
                title: "Error",
                description: "Suggestion not found."
            })]
        })
    }

    let suggestionsChannel = interaction.guild.channels.cache.get(suggestionCategories[suggestion.category]);

    await interaction.deferReply({
        flags: ["Ephemeral"]
    });


    suggestionsChannel.messages.fetch(suggestion.msgId).then(async msg => {

        await msg.edit({
            embeds: [
                new EmbedBuilder(msg.embeds[0])
                    .setTitle(`#${suggestion.id} Suggestion - ${suggestion.category} - Denied`)
                    .setFields({ name: "Upvotes", value: "" + suggestion.upvotes }, { name: "Downvotes", value: "" + suggestion.downvotes })
                    .setColor(embedSettings.deniedSuggestionColor)
            ],
            components: []
        })

        interaction.editReply({
            embeds: [generateEmbed({
                title: "Suggestion Denied."
            })]
        })

        client.suggestions.delete(msgId);
        await deleteSuggestion(suggestion.id);
    }).catch(err => {
        interaction.editReply({
            embeds: [generateEmbed({
                title: "Error",
                description: "Message not found"
            })]
        })
        console.log(err);
    })
}

async function acceptSuggestion(client, interaction) {


    let id = interaction.options.getString("id", false);
    let msgId = interaction.options.getString("msg", false);

    if (id == null && msgId == null) {
        return interaction.reply({
            flags: ["Ephemeral"],
            embeds: [generateEmbed({
                title: "Error",
                description: "You need to specify either the message ID or the suggestion ID"
            })]
        })
    }

    let suggestion = (msgId == null ? client.suggestions.find(r => r.id == id) : client.suggestions.get(msgId));


    if (suggestion == null) {
        return interaction.reply({
            flags: ["Ephemeral"],
            embeds: [generateEmbed({
                title: "Error",
                description: "Suggestion not found."
            })]
        })
    }

    let suggestionsChannel = interaction.guild.channels.cache.get(suggestionCategories[suggestion.category]);

    await interaction.deferReply({
        flags: ["Ephemeral"]
    });


    suggestionsChannel.messages.fetch(suggestion.msgId).then(async msg => {

        await msg.edit({
            embeds: [
                new EmbedBuilder(msg.embeds[0])
                    .setTitle(`#${suggestion.id} Suggestion - ${suggestion.category} - Accepted`)
                    .setFields({ name: "Upvotes", value: "" + suggestion.upvotes }, { name: "Downvotes", value: "" + suggestion.downvotes })
                    .setColor(embedSettings.acceptedSuggestionColor)
            ],
            components: []
        })

        interaction.editReply({
            embeds: [generateEmbed({
                title: "Suggestion Accepted."
            })]
        })

        client.suggestions.delete(msgId);
        await deleteSuggestion(suggestion.id);
    }).catch(() => {
        interaction.editReply({
            embeds: [generateEmbed({
                title: "Error",
                description: "Message not found"
            })]
        })
    })
}

async function handleVote(client, interaction) {
    let suggestion = client.suggestions.get(interaction.message.id);

    if (suggestion == null) return;

    let userVote = suggestion.users.get(interaction.user.id);

    if (userVote == interaction.customId) {
        return interaction.reply({
            flags: ["Ephemeral"],
            embeds: [
                generateEmbed({
                    title: "You can only vote once!"
                })
            ]
        });
    }

    interaction.reply({
        flags: ["Ephemeral"],
        embeds: [generateEmbed({
            title: "Vote Recorded"
        })]
    });

    if (userVote != null) suggestion[userVote == "upvoteSuggestion" ? "upvotes" : "downvotes"]--;

    if (interaction.customId == "upvoteSuggestion") suggestion.upvotes++;
    if (interaction.customId == "downvoteSuggestion") suggestion.downvotes++;
    
    interaction.message.edit({
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder({
                        customId: "upvoteSuggestion",
                        label: `Upvote (${suggestion.upvotes})`,
                        style: ButtonStyle.Primary
                    }),
                    new ButtonBuilder({
                        customId: "downvoteSuggestion",
                        label: `Downvote (${suggestion.downvotes})`,
                        style: ButtonStyle.Danger
                    })
                )
        ]
    });

    suggestion.users.set(interaction.user.id, interaction.customId);
    client.suggestions.set(interaction.message.id, suggestion);

    await updateVotes(suggestion.id, suggestion, mapToJson(suggestion.users), interaction.customId == "downvoteSuggestion" ? "downvotes" : "upvotes");
}

module.exports = {
    showSuggestionModal, postSuggestion, showSuggestionCategories, denySuggestion,
    acceptSuggestion, handleVote
}