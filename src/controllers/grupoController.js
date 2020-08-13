const express = require("express")
const Grupo = require("../models/grupo")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const grupo = await Grupo.find()
    res.json(grupo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem ---------------------------------------------------------------
router.get("/:id", getGrupo, (req, res) => {
  res.json(res.grupo)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const grupo = new Grupo({
    nome: req.body.nome,
    tipo: req.body.tipo,
    classe: req.body.classe,
  })
  try {
    const newGrupo = await grupo.save()
    res.status(201).json(newGrupo)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.patch("/:id", getGrupo, async (req, res) => {
  if (req.body.nome != null) {
    res.grupo.nome = req.body.nome
    res.grupo.tipo = req.body.tipo
    res.grupo.classe = req.body.classe

  }
  try {
    const updateGrupo = await res.grupo.save()
    res.json(updateGrupo)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:id", getGrupo, async (req, res) => {
  try {
    await res.grupo.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getGrupo(rec, res, next) {
  try {
    grupo = await Grupo.findById(rec.params.id)
    if (grupo === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.grupo = grupo
  next()
}

module.exports = router;