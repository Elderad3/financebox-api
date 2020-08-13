const express = require("express")
const Banco = require("../models/banco")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const banco = await Banco.find()
    res.json(banco)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem  por id ---------------------------------------------------------------
router.get("/:id", getBanco, (req, res) => {
  res.json(res.banco)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const banco = new Banco({
    nome: req.body.nome,
    codigo: req.body.codigo,
    img: req.body.img
  })
  try {
    const newBanco = await banco.save()
    res.status(201).json(newBanco)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.patch("/:id", getBanco, async (req, res) => {
  if (req.body.nome != null) {
    res.banco.codigo = req.body.codigo,
      res.banco.nome = req.body.nome,
      res.banco.img = req.body.img
  }
  try {
    const updateBanco = await res.banco.save()
    res.json(updateBanco)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:id", getBanco, async (req, res) => {
  try {
    await res.banco.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getBanco(rec, res, next) {
  try {
    banco = await Banco.findById(rec.params.id)
    if (banco === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.banco = banco
  next()
}

module.exports = router;