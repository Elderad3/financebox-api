const mongoose = require('mongoose')
const GrupoSchema = new mongoose.Schema({
  nome: {
    type: String,
    require: true
  },
  tipo: {
    type: Number,
    require: true
  },
  classe: {
    type: String,
    require: true
  }
});
const Grupo = mongoose.model('grupo', GrupoSchema)
module.exports = Grupo