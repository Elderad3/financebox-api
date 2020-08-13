const express = require("express")
const Categoria = require("../models/categoria")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const categoria = await Categoria.find()
      .populate('grupo')
    res.json(categoria)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem ---------------------------------------------------------------
router.get("/:_id", getCategoria, (req, res) => {
  res.json(res.categoria)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const categoria = new Categoria({
    nome: req.body.nome,
    image: req.body.image,
    grupo: req.body.grupo,
    classe: req.body.classe,
    cor: req.body.cor
  })
  try {
    const newCategoria = await categoria.save()
    res.status(201).json(newCategoria)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.put("/:_id", getCategoria, async (req, res) => {
  if (req.body._id != null) {
    res.categoria.nome = req.body.nome
    res.categoria.image = req.body.image
    res.categoria.grupo = req.body.grupo
    res.categoria.classe = req.body.classe
    res.categoria.cor = req.body.cor

  }
  try {
    const updateCategoria = await res.categoria.save()
    res.json(updateCategoria)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:_id", getCategoria, async (req, res) => {
  try {
    await res.categoria.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getCategoria(rec, res, next) {
  try {
    categoria = await Categoria.findById(rec.params._id)
    if (categoria === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.categoria = categoria
  next()
}

module.exports = router;