const discord = require('discord.js')
const guild = require('../modules').GuildSettings

module.exports.run = async (bot, message, args) => {
  const member = message.mentions.members.first();
  if (!member) return message.channel.send("Please mention a member to ban.");
  const reason = args.slice(1).join(" ") || "No reason provided.";
  const msgmember = message.member;
  if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.channel.send("I don't have permission to do that. Make sure I have the Ban Members permission.");
  if (!msgmember.hasPermission("BAN_MEMBERS")) return message.channel.send("Invalid permissions!");
  if (!member.bannable) return message.channel.send(`${member.displayName} is not bannable.`);
  await member.ban(reason)
        .then(member => {
          guild.findOne({ guildId: message.guild.id }, (err,data) => {
            if (!data || data == null) {
              const newData = new guild({
                guildId: message.guild.id,
                guildName: message.guild.name,
                premium: false,
                blacklist: false,
                modlog: "",
                welcome: "",
                warns: {},
                bans: {}
              })
              
              newData.save()
              .catch(e => {
                console.error(bot.errors.dbSaveError.replace("%s", e))
              })
              
              data.bans[member.user.id] = {moderator: message.author.id, reason: reason}
              data.save()
              .catch(e => console.error(bot.errors.dbSaveError.replace("%s", e)))
            } else {
              data.bans[member.user.id] = {moderator: message.author.id, reason: reason}
              data.save()
              .catch(e => console.error(bot.errors.dbSaveError.replace("%s", e)))
            }
          })
    
          const em = new discord.RichEmbed()
          .addField("Modboi Ban System", `🔨 ${member.user.username} is outta here!`)
          .setFooter(`${member.user.username} was banned by ${msgmember.displayName}.`)
          .setTimestamp()
          .setColor("GREEN");
          message.channel.send({embed: em})
        })
        .catch(err => {
          message.channel.send(`I couldn't ban ${member.displayName}...`)    
          console.error(`[ERROR] Ban Failed in guild ${member.guild.name}.\nError Message: ${err}`)
        })  
}

module.exports.help = {name: "ban"}
