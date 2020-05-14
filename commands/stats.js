module.exports =
{
    name: "stats",
    description: "Shows your stats",
    execute(message, args)
    {
        const fs = require("fs");
        let rawData = fs.readFileSync("./saves/" + message.author.username + ".json");
        let data = JSON.parse(rawData);
        message.channel.send(message.author.username + "'s stats:\nLevel: " + data.level + "\n XP: " + data.XP + "\n XP Needed for next level: "+ data.XPNeeded);
    }
}