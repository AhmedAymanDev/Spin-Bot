const Discord = require("discord.js")
const client = new Discord.Client({
  intents : 32767
})
const schema = require("./spin")
const express = require("express")
const app = express()
client.config = require("./config.json")
app.listen(3000, () => {
  console.log("Server Started")
})
const mongoose = require("mongoose")
mongoose.connect(client.config.mongoURL)
client.login(client.config.token)

client.on("ready", async () => {
  client.user.setActivity("Test")
  let data = [{
    name : "add-prize", 
    description : "To Add Prize To Spin", 
    options : [{
      name : "prize", 
      description : "the prize", 
     type : "STRING", 
      required : true 
    }] 
    }, {
      name : "remove-prize", 
    description : "To Remove Prize To Spin", 
    options : [{
      name : "prize", 
      description : "the prize", 
     type : "STRING", 
      required : true  
    }]
  }, {
    name : "spin", 
    description : "Play Spin",
  },{
    name : "all-prizes", 
    description : "To see all prizes of spin",
  }] 
  await client.application.commands.set(data)
})

client.on("interactionCreate", async (interaction) => {
  if(interaction.isCommand){
    if(interaction.commandName == "add-prize"){
      let prize = interaction.options.getString("prize")
      
      let member = interaction.guild.members.cache.get(interaction.user.id) 
      await interaction.deferReply({ephemeral : false})
  if(!member.roles.cache.some(r => r.id === client.config.roleId))return await interaction.editReply({content : "Must Have Role"})
  
      
      let data ;
      data = await schema.findOne({guildId : interaction.guild.id})
        if(!data) data = await schema.create({guildId : interaction.guild.id})
      if(data.prizes.includes(prize))return await interaction.editReply({content : "This Prize Is Already Existed"})
      await data.prizes.push(prize)
      await data.save()
      await interaction.editReply({content : `Done Added ${prize} To list`})
    }
    if(interaction.commandName == "remove-prize"){
      let prize = interaction.options.getString("prize")
      let member = interaction.guild.members.cache.get(interaction.user.id) 
      await interaction.deferReply({ephemeral : false})
  if(!member.roles.cache.some(r => r.id === client.config.roleId))return await await interaction.editReply({content : "Must Have Role"})
      let data ;
      data = await schema.findOne({guildId : interaction.guild.id})
        if(!data) data = await schema.create({guildId : interaction.guild.id})
      if(!data.prizes.includes(prize))return await interaction.editReply({content : "I can't find this prize in database"})
      await data.prizes.pull(prize)
      await data.save()
      await interaction.editReply({content : `Done Removed ${prize} From list`})
    }
    if(interaction.commandName == "spin"){
      await interaction.deferReply({ephemeral : false})
      let member = interaction.guild.members.cache.get(interaction.user.id) 
  if(!member.roles.cache.some(r => r.id === client.config.roleId))return interaction.editReply({content : "Must Have Role"})
      let data ;
      data = await schema.findOne({guildId : interaction.guild.id})
        if(!data) data = await schema.create({guildId : interaction.guild.id})
   if(data.prizes.length == 0)return await interaction.editReply({content : "There is no prizes set in database so I can't play spin"})
      let prize = data.prizes[Math.floor(Math.random() * data.prizes.length)] 
     await interaction.editReply({content : "Spinning 🎰"})
      
  setTimeout(async() => {
    let embed = new Discord.MessageEmbed()
.setTitle("__Congratulations__ :tada:")
.setDescription(String(prize))
.setColor("BLUE") 
      
  await interaction.editReply({content : null, embeds : [embed]})
    
  }, 3000)
    }
    if(interaction.commandName == "all-prizes"){
      await interaction.deferReply({ephemeral : false})
      let member = interaction.guild.members.cache.get(interaction.user.id) 
  if(!member.roles.cache.some(r => r.id === client.config.roleId))return await interaction.editReply({content : "Must Have Role"})
      let data ;
      data = await schema.findOne({guildId : interaction.guild.id})
        if(!data) data = await schema.create({guildId : interaction.guild.id})
      
   if(data.prizes.length == 0)return await interaction.editReply({content : "There is no prizes set in database"})
      let embed = new Discord.MessageEmbed()
.setAuthor({name : String(interaction.guild.name) , iconURL : interaction.guild.iconURL({dynamic : true })})
.setColor("BLUE")
.setDescription(`${data.prizes.join(",")}`)
      .setThumbnail(interaction.guild.iconURL({dynamic : true}))    
        
.setFooter({text : "©" + String(interaction.guild.name), iconURL : interaction.guild.iconURL({dynamic : true})})
      await interaction.editReply({embeds : [embed]})
    }
  } 
})

