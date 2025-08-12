require("dotenv").config(process.cwd() + "/.env");

const { Client, Collection } = require("discord.js");
const { loadCommands, loadEvents } = require("./utils/handler");
const { createTables, getSuggestions } = require("./utils/sql");

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages"]
});

client.commands = new Collection();
client.suggestions = new Collection();

(async() => {

    await createTables();

    let suggestions = await getSuggestions();

    for (let suggestion of suggestions) {

        if (suggestion.users == null) { 
            suggestion.users = new Collection(); 
        } else {
            let t = JSON.parse(suggestion.users);
            
            suggestion.users = new Collection();

            for (let key of Object.keys(t)) {
                suggestion.users.set(key, t[key])
            }
        }

        client.suggestions.set(suggestion.msgId, suggestion);
    }

    await loadCommands(client);
    await loadEvents(client);

    try {
        client.login(process.env.TOKEN);
    } catch (err) {
        console.log("Unable to login");
        console.log(err);
    }
})();