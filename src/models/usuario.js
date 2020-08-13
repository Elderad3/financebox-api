const mongoose = require('mongoose')
const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    require: true
  }
});
const Usuario = mongoose.model('usuario', UsuarioSchema)
module.exports = Usuario