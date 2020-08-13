const mongoose = require('mongoose')
const TransacaoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    require: true
  },
  descricao: {
    type: String,
    require: true
  },
  conta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conta',
    require: true
  },
  tipo: {
    type: String,
    require: true
  },
  mes: {
    type: Number,
    require: true
  },
  ano: {
    type: Number,
    require: true
  },
  data: {
    type: Date,
    require: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categoria',
    require: true
  },
  isAtivo: {
    type: Boolean,
    require: true
  },
  valor: {
    type: Number,
    require: true
  }
});
const Transacao = mongoose.model('transacao', TransacaoSchema)
module.exports = Transacao