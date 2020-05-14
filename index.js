require('dotenv').config();
const config = require("./config.json");
const Discord = require("discord.js");
const package = require("./package.json");
const bot = new Discord.Client();
const fs = require("fs");
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for(const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}
bot.functions = new Discord.Collection();
const commandFiles2 = fs.readdirSync("./functions/").filter(file => file.endsWith(".js"));
for(const file2 of commandFiles2)
{
    const func = require(`./functions/${file2}`);
    bot.functions.set(func.name, func);
}

bot.on("ready", () => {
    console.log(`${bot.user.username} is online!`); 
    bot.user.setPresence({activity: { name: "Discord", type: "PLAYING" }, status: "online"}); 
});

update = setInterval(UPDATE, 60);
function UPDATE()
{
    if (new Date().getHours() == 0 && new Date().getMinutes() == 0 && new Date().getSeconds() == 0 && new Date().getMilliseconds() == 0) bot.commands.get("gift").reset();
}

bot.on("message", message => {
    
    bot.functions.get("addXP").execute(message, 1);
    let rawData = fs.readFileSync("./saves/" + message.author.username + ".json");
    let data = JSON.parse(rawData);

    if (data.XPNeeded <= 0) bot.functions.get('lvlup').execute(message);

    if(message.author.bot) return;
    if(message.channel.id != 709373794019442750) return;
    if(message.content.startsWith(config.prefix))
    {
        let args = message.content.substring(config.prefix.length).split(" ");
        switch(args[0])
        {
            case 'stats':
                bot.commands.get("stats").execute(message, args)
            break;

            case 'gift':
                if(data.level < 10) message.channel.send("You need to be level 10 for this!"); else bot.commands.get("gift").execute(message);
            break;
            
            case 'reset':
                bot.commands.get("gift").reset(message);
            break;
        }
    }
});

bot.login(process.env.TOKEN);