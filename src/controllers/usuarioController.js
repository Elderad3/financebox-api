const express = require("express")
const Usuario = require("../models/usuario")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const usuario = await Usuario.find()
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem ---------------------------------------------------------------
router.get("/:id", getUsuario, (req, res) => {
  res.json(res.usuario)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const usuario = new Usuario({
    nome: req.body.nome
  })
  try {
    const newUsuario = await usuario.save()
    res.status(201).json(newUsuario)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.patch("/:id", getUsuario, async (req, res) => {
  if (req.body.nome != null) {
    res.usuario.nome = req.body.nome
  }
  try {
    const updateUsuario = await res.usuario.save()
    res.json(updateUsuario)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:id", getUsuario, async (req, res) => {
  try {
    await res.usuario.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getUsuario(rec, res, next) {
  try {
    usuario = await Usuario.findById(rec.params.id)
    if (usuario === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.usuario = usuario
  next()
}

module.exports = router;