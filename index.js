const fs = require("fs");
const path = require("path");

const { Client, GatewayIntentBits, Events } = require("discord.js");
require("dotenv").config();

const config = require("./config");
const connectMongo = require("./database/mongo");

// Button handler
const mesaiButtons = require("./buttons/mesaiButtons");

// Cronlar
const weeklyReset = require("./cron/weeklyReset");
const weeklyReport = require("./cron/weeklyReport");
const autoMesaiControl = require("./cron/autoMesaiControl");

// CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Slash komut map
client.commands = new Map();

// Slash komutları yükle
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// BOT READY
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Bot aktif: ${client.user.tag}`);

  // MongoDB
  await connectMongo(config.mongoUri);

  // Cronlar
  weeklyReset(client);
  weeklyReport(client);
  
  autoMesaiControl(client);


  // Mesai buton mesajı
  const mesaiChannel = client.channels.cache.find(
    ch => ch.name === config.mesaiChannelName
  );

  if (mesaiChannel) {
    await mesaiChannel.send({
      content:
        "📌 **MESAI SISTEMI**\nAşağıdaki butonları kullanarak mesaiye girip çıkabilirsiniz.",
      components: [mesaiButtons.row],
    });
  } else {
    console.log("❌ Mesai kanalı bulunamadı");
  }
});

// INTERACTION HANDLER (TEK YER – ÇOK ÖNEMLİ)
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 BUTONLAR
  if (interaction.isButton()) {
    await mesaiButtons.handle(interaction);
    return;
  }

  // 💬 SLASH KOMUTLAR
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Komut hatası:", error);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("❌ Komut çalıştırılırken hata oluştu.");
      } else {
        await interaction.reply({
          content: "❌ Komut çalıştırılırken hata oluştu.",
          ephemeral: true,
        });
      }
    }
  }
});

// LOGIN
client.login(process.env.BOT_TOKEN);
