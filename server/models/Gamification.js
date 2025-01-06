const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  // TODO: Define model schema
}, { timestamps: true })

module.exports = mongoose.model('ModelName', Schema)
