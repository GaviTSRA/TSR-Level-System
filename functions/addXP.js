module.exports =
{
    name: "addXP",
    description: "Gives you XP",
    execute(message, count)
    {
        const fs = require("fs");
        if(fs.existsSync("./saves/" + message.author.username + ".json"))
        {
            let rawData = fs.readFileSync("./saves/" + message.author.username + ".json");
            let data = JSON.parse(rawData);
            data2 =
            {
                "level": data.level,
                "XP": data.XP + count,
                "XPNeeded": data.XPNeeded - 1
            };
        } else {
            data2 = 
            {
                "level": 1,
                "XP": 1,
                "XPNeeded": 9
            }
        }
        let saveData = JSON.stringify(data2);
        fs.writeFileSync("./saves/" + message.author.username + ".json", saveData);
    }
}