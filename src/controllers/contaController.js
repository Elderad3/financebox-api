const express = require("express")
const Conta = require("../models/conta")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const conta = await Conta.find().populate('banco')
    res.json(conta)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem ---------------------------------------------------------------
router.get("/:id", getConta, (req, res) => {
  res.json(res.conta)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const conta = new Conta({
    banco: req.body.banco,
    agencia: req.body.agencia,
    numeroConta: req.body.numeroConta
  })
  try {
    const newConta = await conta.save()
    res.status(201).json(newConta)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.put("/:_id", getConta, async (req, res) => {
  if (req.body._id != null) {
    res.conta.banco = req.body.banco
    res.conta.agencia = req.body.agencia
    res.conta.numeroConta = req.body.numeroConta
  }
  try {
    const updateConta = await res.conta.save()
    res.json(updateConta)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:_id", getConta, async (req, res) => {
  try {
    await res.conta.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getConta(rec, res, next) {
  try {
    conta = await Conta.findById(rec.params._id)
    if (conta === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.conta = conta
  next()
}

module.exports = router;