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
var giftReady;
    
bot.on("ready", () => 
{
    console.log(`${bot.user.username} is online!`); 
    bot.user.setPresence({activity: { name: "Discord", type: "PLAYING" }, status: "online"}); 
    pool.getConnection();
});

update = setInterval(UPDATE, 100);
function UPDATE()
{
    if (new Date().getHours() == 0 && new Date().getMinutes() == 0 && new Date().getSeconds() == 0)
    {
        query = "UPDATE levelsystem SET giftReady = true";
        editDB(undefined, query);
    }
}

const editDB = async (message, query) =>
{
    try { await pool.query(query); }
    catch(e) 
    { 
        if(message != undefined) message.channel.send("Something went wrong (editDB): \nQuery: " + query + "\n" + e);
        else console.log(e);
    }
}

const printStats = async (message, username) =>
{
    query = "SELECT * FROM levelsystem WHERE  name = '" + username + "' LIMIT 1";
    try 
    {   
        row = await pool.query(query);
        if(row[0][0] == undefined) 
        {
            message.channel.send(username + " is not part of the levelsystem - use >>join to join the levelsystem!")
            return;
        }
        message.channel.send("Name: " + row[0][0].name + "\nXP: " + row[0][0].xp + "\nLevel: " + row[0][0].level + "\nXP needed for next level up: " + row[0][0].xpNeeded + "\nGift ready: " + row[0][0].giftReady);
    }
    catch(e) { message.channel.send("Something went wrong (printStats): \n" + e); }
}

const updateValues = async (message, username) =>
{
    query = "SELECT * FROM levelsystem WHERE name = '" + username + "' LIMIT 1";
    try 
    {   
        row = await pool.query(query);
        if (row[0][0] == undefined)
	{
		xp = 0;
		xpNeeded = 52;
		level = 0;
		return;
	}
        level = row[0][0].level;
        xp = row[0][0].xp;
        xpNeeded = row[0][0].xpNeeded;
        giftReady = row[0][0].giftReady;
    }
    catch(e) { message.channel.send("Something went wrong (updateValues): \nQuery: " + query + "\n" + e); }
}

bot.on("message", message =>
{
    if(message.author.bot) return;

    ( async () => 
    {   
	xp = 0;
	xpNeeded = 52;
	level = 0;
	username = "";
        username = message.member.user.username.replace(/[^a-zA-Z0-9]/g, "");
        await updateValues(message, username);
        if(level != undefined) 
        {
            xp++;
            query = "UPDATE levelsystem SET xp = " + xp + " WHERE name = '" + username + "'";
            editDB(message, query)
        }
        if(level != undefined && xp >= xpNeeded) 
        {
            level++;
            message.channel.send(message.member.user.tag + " is now level " + level + "!");
            query = "UPDATE levelsystem SET level = " + level + " WHERE name = '" + username + "'";
            editDB(message, query);
            xpNeeded = 50 * level + level * level;
            query = "UPDATE levelsystem SET xpNeeded = " + xpNeeded + " WHERE name = '" + username + "'";
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
                    uName = "";
                    if (args[1] == undefined) uName = username;
                    else
                    {
                        for(i = 1; i < args.length; i++)
                        {
                            uName = uName + "" + args[i];
                        }
                    }
                    uName = uName.replace(/[^a-zA-Z0-9]/g, ""); 
                    printStats(message, uName);
                    break;

                case "join":
                    query = "INSERT INTO levelsystem VALUES ('" + username + "', 0, 0, 1, 1)"
                    editDB(message, query);
                    message.channel.send("You are now able to earn xp and level up!");
		    await updateValues(message, username);
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

                case "gift":
                    if(level < 2)
                    {
                        message.channel.send("You need to be level 2 for this!");
                        break;
                    }
                    if(!giftReady)
                    {
                        message.channel.send("Your gift is not ready!");
                        break;
                    }
                    query = "UPDATE levelsystem SET giftReady = false WHERE name = '" + username + "'";
                    editDB(message, query);
                    xpGot = Math.random() * 30;
                    xpGot = Math.round(xpGot);
                    message.channel.send("You got " + xpGot + " xp!");
                    xp = xp + xpGot;
                    query = "UPDATE levelsystem SET xp = " + xp + " WHERE name = '" + username + "'";
                    editDB(message, query); 

            }
        }
    }) ()

});

bot.login(process.env.TOKEN);