require('dotenv').config();
const config = require("./config.json");
const Discord = require("discord.js");
const package = require("./package.json");
const mysql = require("mysql2/promise");
const pool = require("./pool.js");
const bot = new Discord.Client();
var level;
var xp;
var xpNeeded;
    
bot.on("ready", () => 
{
    console.log(`${bot.user.username} is online!`); 
    bot.user.setPresence({activity: { name: "Discord", type: "PLAYING" }, status: "online"}); 
    pool.getConnection();
});

update = setInterval(UPDATE, 60);
function UPDATE()
{
    if (new Date().getHours() == 0 && new Date().getMinutes() == 0 && new Date().getSeconds() == 0 && new Date().getMilliseconds() == 0) return;
}

const editDB = async (message, query) =>
{
    try { await pool.query(query); }
    catch(e) { message.channel.send("Something went wrong (editDB): \nQuery: " + query + "\n" + e); }
}

const printStats = async (message) =>
{
    query = "SELECT * FROM levelsystem WHERE  name = '" + message.member.user.username + "' LIMIT 1";
    try 
    {   
        row = await pool.query(query);
        if(row[0][0] == undefined) 
        {
            message.channel.send("You are not part of the levelsystem - do >>join to join the levelsystem!")
            return;
        }
        message.channel.send("Name: " + row[0][0].name + "\nXP: " + row[0][0].xp + "\nLevel: " + row[0][0].level + "\nXP until next level up: " + row[0][0].xpNeeded);
    }
    catch(e) { message.channel.send("Something went wrong (printStats): \n" + e); }
}

const updateValues = async (message) =>
{
    query = "SELECT * FROM levelsystem WHERE name = '" + message.member.user.username + "' LIMIT 1";
    try 
    {   
        row = await pool.query(query);
        if (row[0][0] == undefined) return;
        level = row[0][0].level;
        xp = row[0][0].xp;
        xpNeeded = row[0][0].xpNeeded;
    }
    catch(e) { message.channel.send("Something went wrong (updateValues): \nQuery: " + query + "\n" + e); }
}

bot.on("message", message =>
{
    if(message.author.bot) return;

    ( async () => 
    {   
        await updateValues(message);

        if(level != undefined) 
        {
            xp++;
            query = "UPDATE levelsystem SET xp = " + xp + " WHERE name = '" + message.member.user.username + "'";
            editDB(message, query)
        }
        if(level != undefined && xp >= xpNeeded) 
        {
            level++;
            message.channel.send("@" + message.member.user.tag + " is now level " + level + "!");
            query = "UPDATE levelsystem SET level = " + level + " WHERE name = '" + message.member.user.username + "'";
            editDB(message, query);
            xpNeeded = 50 * level + level * level;
            query = "UPDATE levelsystem SET xpNeeded = " + xpNeeded + " WHERE name = '" + message.member.user.username + "'";
            editDB(message, query);
        }

        if(message.channel.name != "bot-channel") return;
        if(message.content.startsWith(config.prefix))
        {
            let args = message.content.substring(config.prefix.length).split(" ");
            query = "";
            switch(args[0])
            {
                case "stats":
                    printStats(message);
                    break;

                case "join":
                    query = "INSERT INTO levelsystem VALUES ('" + message.member.user.username + "', 0, 0, 1)"
                    editDB(message, query);
                    message.channel.send("You are now able to earn xp and level up!");
                    break;

                case "delete":
                    if(!message.member.roles.cache.find(r => r.name === "Alpha")) 
                    {
                        message.channel.send("You are not allowed to do that!");
                        break;
                    }
                    query = "DELETE FROM levelsystem WHERE name = '" + args[1] + "'"; 
                    editDB(message, query);
                    message.channel.send("Deleted " + args[1]);
                    break;
                case "query":
                    if(!message.member.roles.cache.find(r => r.name === "Alpha")) 
                    {
                        message.channel.send("You are not allowed to do that!");
                        break;
                    }
                    for(i = 1; i < args.length; i++)
                    {
                        query = query + " " + args[i];
                    }
                    editDB(message, query);
                    message.channel.send("Query was send!");
                    break;
            }
        }
    }) ()

});

bot.login(process.env.TOKEN);