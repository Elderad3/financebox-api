const mongoose = require('mongoose')
const BancoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    require: true
  },
  nome: {
    type: String,
    require: true
  },
  img: {
    type: String,
    require: true
  }
});
const Banco = mongoose.model('banco', BancoSchema)
module.exports = Banco