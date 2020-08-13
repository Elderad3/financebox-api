const mongoose = require('mongoose')
const ContaSchema = new mongoose.Schema({
  banco: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'banco',
    require: true
  },
  agencia: {
    type: String,
    require: true
  }
  ,
  numeroConta: {
    type: String,
    require: true
  }
});
const Conta = mongoose.model('conta', ContaSchema)
module.exports = Conta