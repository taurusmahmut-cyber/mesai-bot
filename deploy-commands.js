require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("mesai-reset")
    .setDescription("Haftalık mesaileri manuel olarak sıfırlar"),

  new SlashCommandBuilder()
    .setName("mesai-rapor")
    .setDescription("Mevcut haftanın mesai raporunu gösterir")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("🔁 Slash komutlar yükleniyor...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash komutlar yüklendi.");
  } catch (error) {
    console.error("❌ Deploy hatası:", error);
  }
})();
