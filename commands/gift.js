module.exports =
{
    name: "gift",
    description: "Gives you your daily gift",
    execute(message)
    {   
        const fs = require("fs");
        let rawData = fs.readFileSync("./saves/" + message.author.username + ".json");
        let data = JSON.parse(rawData);
        if(data.Gift == false)
        {
            XPGot = Math.floor(Math.random() * data.level * 5);
            newData =
            {
                "level": data.level,
                "XP": data.XP + XPGot,
                "XPNeeded": data.XPNeeded,
                "Gift": true
            }
            let saveData = JSON.stringify(newData);
            message.channel.send("You got " + XPGot + "XP!");
            fs.writeFileSync("./saves/" + message.author.username + ".json", saveData);
        } else
        {
            message.channel.send("You already got your gift, come back tomorrow!");
        }
    },

    reset()
    {
        console.log("reset");

        const fs = require("fs");
        
        saves = fs.readdirSync("./saves/");
        for(file of saves)
        {
            let readDataRaw = fs.readFileSync("./saves/" + file);
            let readData = JSON.parse(readDataRaw);
            newData =
            {
                "level": readData.level,
                "XP": readData.XP,
                "XPNeeded": readData.XPNeeded,
                "Gift": false
            };
            let saveData = JSON.stringify(newData);
            fs.writeFileSync("./saves/" + file, saveData);
        }
    }
}