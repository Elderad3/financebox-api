require('dotenv').config()
const express = require("express")
const app = express()

//conexão com o banco de dados ----------------------------------------------------------------------------
const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.log("[banco de dados]...Erro ao conectar no banco de dados: " + error))
db.once('open', () => console.log("[banco de dados]...Banco de dados conectado"))
// indicando o uso de json pelo express  ------------------------------------------------------------------
app.use(express.json())

// cors -------------------------------------------------------------------------------------------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).send({});
  }
  next();
});

// rotas --------------------------------------------------------------------------------------------------
const usuarioController = require("./src/controllers/usuarioController")
const categoriaController = require("./src/controllers/categoriaController")
const grupoController = require("./src/controllers/grupoController")
const bancoController = require("./src/controllers/bancoController")
const contaController = require("./src/controllers/contaController")
const transacaoController = require("./src/controllers/transacaoController")
app.use("/usuario", usuarioController)
app.use("/categoria", categoriaController)
app.use("/grupo", grupoController)
app.use("/banco", bancoController)
app.use("/conta", contaController)
app.use("/transacao", transacaoController)

app.listen(3000, () => console.log("[servidor]... servidor rodando na porta 3000"))