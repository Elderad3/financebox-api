const mongoose = require('mongoose')
const CategoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    require: true
  },
  image: {
    type: String,
    require: true
  },
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'grupo',
    require: true
  },
  classe: {
    type: String,
    require: false
  },
  cor: {
    type: String,
    require: false
  }
});
const Categoria = mongoose.model('categoria', CategoriaSchema)
module.exports = Categoria