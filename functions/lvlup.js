module.exports =
{
    name: "lvlup",
    description: "Gives you a level up",
    execute(message)
    {
        const fs = require("fs");
        let rawLevel = fs.readFileSync("./saves/" + message.author.username + ".json");
        let level = JSON.parse(rawLevel);
        newLevel = level.level + 1;
        newXPNeeded = newLevel * 10;
        message.channel.send(message.author.username + " is now level " + newLevel);
        levelSave =
        {
            "level": newLevel,
            "XP": level.XP,
            "XPNeeded": newXPNeeded,
            "Gift": level.Gift
        };

        let data = JSON.stringify(levelSave);
        fs.writeFileSync("./saves/" + message.author.username + ".json", data);
    }
}