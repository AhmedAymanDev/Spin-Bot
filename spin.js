const {model, Schema} = require("mongoose")

const spinSchema = new Schema({
  guildId : String, 
  prizes : {type :  Array, default : []}
})

module.exports = model("spinModel", spinSchema)
