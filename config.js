require("dotenv").config();

module.exports = {
  token: process.env.BOT_TOKEN,
  mongoUri: process.env.MONGO_URI,
  mesaiChannelName: "mesai",
  supervisorChannelName: "supervisor-not",
  supervisorRoleName: "Supervisor",
  supervisorRoleId: "1198200538412634122"
};
