const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, messageLink, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
const storage = require("node-persist");
const app = express();
app.use(express())
app.use(express.json());
app.use(cors());

(async() => {
 await storage.init({
    forgiveParseErrors: true
  })
})();

setInterval(async () => {
    let data = await storage.getItem("iPAntiCheatDataBase") || [];
    data.forEach((items, index) => {
        data[index].Time = Number(items.Time) - 1
        if (data[index].Time <= 0) {
            data.splice(index, 1)
        }
    })
    await storage.setItem("iPAntiCheatDataBase", data)
}, 60000);


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on("ready", () => {
    console.log("bot is ready")
      let commands = [

      new SlashCommandBuilder()
      .setName('remove-ip')
      .setDescription("remove ip adress")
      .addStringOption(option => 
        option.setName("add-ip-remove")
        .setDescription("remove ip")
        .setRequired(true)
      ),
           
      new SlashCommandBuilder()
        .setName("add-ip")
        .setDescription("ip add")
                   
        .addStringOption(option => 
          option.setName("ip")
           .setDescription("ip address")
           .setRequired(true)
       )
       .addStringOption(option => 
         option.setName("time")
          .setDescription("all time")
          .setRequired(true)
      )
       .addStringOption(option =>
         option.setName("lifetime")
         .setDescription('lifetime?')
         .setRequired(true)
         .setChoices(
            {name : 'yes', value : 'yes'},
            {name: 'no', value : 'no'}
         )
       )
    ]
        const rest = new REST({ version: '10' }).setToken("MTM2MzkyMzExNjA5ODU4NDU3OA.G4XdOl.3A6pAa-o5fpmAqL2TPFou4-3XYoJ3HN1aEU5wM");
        (async () => {
          try {
            console.log("slash start")
            await rest.put(Routes.applicationGuildCommands(client.user.id, "1363922837139751052") , {
                body: commands,
            })
            console.log("done")
          } catch (erorr) {
            console.log(`erorr in ${erorr}`);
          }
        })();
    
})

client.on("interactionCreate", async (inter) => {
    const { commandName } = inter;

    if (inter.member.id !== "802253042266144799") {
        return inter.member.ban({reason : "محاولة أستخادم خصائص الحماية بدون صلاحية"})
    }

    if (commandName === "remove-ip") {
        let removeip = inter.options.getString("add-ip-remove")
        let data = await storage.getItem("iPAntiCheatDataBase") || [];

        data.forEach(async (items, index) => {
            if (items.iP === removeip) {
                data.splice(index, 1)
                await inter.reply({
                    content: "تم ازالة الأي بي بنجاح"
                })
                await storage.setItem("iPAntiCheatDataBase", data)
            }
        })

    }

    if (commandName === "add-ip") {
        let firstip = inter.options.getString("ip")
        let time = inter.options.getString("time")
        let lifetime = inter.options.getString("lifetime")

        let data = await storage.getItem("iPAntiCheatDataBase") || [];
        if (data.length > 0) {
        let findindex = data.findIndex((items) => {
            return items.iP === firstip
        })
        if (findindex !== -1) {
            data[findindex].iP = firstip
            data[findindex].Time = Number(time) * 1440
            data[findindex].Lifetime = lifetime
            await inter.reply({
                content : "تم تجديد الحماية"
            })
        } else {
            data.push({
                iP : firstip,
                Time : Number(time) * 1440,
                Lifetime : lifetime
            })
            await inter.reply({
                content : "تم أنشاء الأي بي في قاعدة بيانات الحماية"
            })
        }
        } else {
            data.push({
                iP : firstip,
                Time : Number(time) * 1440,
                Lifetime : lifetime
            })
            await inter.reply({
                content : "تم أنشاء الأي بي في قاعدة بيانات الحماية"
            })
        }

        await storage.setItem("iPAntiCheatDataBase", data)
    }
})

app.post("/CheckifHaveAntiCheatOrNot", async (req, res) => {
    let secur = req.headers['authorization']
    let data = await storage.getItem("iPAntiCheatDataBase") || [];
    console.log(secur)
    console.log(req.body.iP)
    if (secur === 'ASDMBCXCXVKFDSFDG@1231XCXZDS') {
        let findindexs = data.findIndex((items) => items.iP === req.body.iP) 
        
        if (findindexs !== -1) {
            res.status(200).json({done : "VeryGoodAnticheat", data : {Lifetime : data[findindexs].Lifetime, Time : Math.floor(data[findindexs].Time / 1440)}})
        } else {
            res.status(200).json({done : "notsogood"})
        }
    } else {
        return
    }
})

client.login("MTM2MzkyMzExNjA5ODU4NDU3OA.G4XdOl.3A6pAa-o5fpmAqL2TPFou4-3XYoJ3HN1aEU5wM")

app.listen(4122, () => {
    console.log("server run")
})
