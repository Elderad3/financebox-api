const express = require("express")
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const ofx = require('ofx');
const Transacao = require("../models/transacao")
const Conta = require("../models/conta")
const Banco = require("../models/banco")
const Categoria = require("../models/categoria")
const router = express.Router()

// Todas as Transacoes------------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const transacao = await Transacao.find()
      // .populate(['categoria','conta'])
      .populate('categoria')
      .populate('conta')
    res.json(transacao)
    console.log(transacao)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// transacoes por ano ---------------------------------------------------------------------
router.get("/:ano", async (req, res) => {
  try {
    const transacoes = await Transacao.find()
      .where('ano').equals(req.params.ano)
      .populate(['categoria', 'conta'])
    res.json(transacoes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// transacoes por ano e mês ---------------------------------------------------------------------
router.get("/:ano/:mes", async (req, res) => {
  try {
    const transacoes = await Transacao.find()
      .where('ano').equals(req.params.ano)
      .where('mes').equals(req.params.mes)
      .populate(['categoria', 'conta'])
    res.json(transacoes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// listagem de uma transação---------------------------------------------------------------
router.get("/:_id", getTransacao, (req, res) => {
  res.json(res.transacao)
})

// inclusão ---------------------------------------------------------------
router.post("/", async (req, res) => {
  const transacao = new Transacao({
    codigo: req.body.codigo,
    conta: req.body.conta,
    descricao: req.body.descricao,
    tipo: req.body.tipo,
    mes: req.body.mes,
    ano: req.body.ano,
    data: req.body.data,
    categoria: req.body.categoria,
    isAtivo: req.body.isAtivo,
    valor: req.body.valor
  })
  try {
    const newTransacao = await transacao.save()
    res.status(201).json(newTransacao)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }

})

// alteração ---------------------------------------------------------------
router.put("/:_id", async (req, res) => {
  const transacao = new Transacao(req.body)
  try {
    const updateTransacao = await transacao.update(transacao)
    res.json(updateTransacao)
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// remoção ---------------------------------------------------------------
router.delete("/:_id", getTransacao, async (req, res) => {
  try {
    await res.transacao.remove()
    res.json({ message: "Registro removido" })
  } catch (error) {
    res.status(500).json(error.message)
  }
})


/**
 * realiza o carregamento do extrato bancário, salva as transações do extrato no banco
 */
router.post("/extrato", upload.single('arquivo'), async (req, res) => {
  try {
    let transacoes = []
    let data
    let banco
    let conta
    const nomeArquivo = req.file.filename
    fs.readFile(`uploads/${nomeArquivo}`, 'utf8', async function (err, ofxData) {
      if (err) throw err;
      data = ofx.parse(ofxData);
      banco = await verificarBanco(data);
      conta = await verificarConta(data, banco)
      transacoes = data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
      await transacoes.map(async (transacaoExtrato) => {
        let ano = transacaoExtrato.DTPOSTED.substr(0, 4)
        let mesString = transacaoExtrato.DTPOSTED.substr(4, 2)
        let mesNumero = Number(mesString)
        let mes = mesNumero - 1
        let dia = transacaoExtrato.DTPOSTED.substr(6, 2)
        let data = new Date(ano, mes, dia)
        const transacao = montarTransacao(transacaoExtrato, conta, mes, data)
        await validarTransacao(transacao)
      })
      res.json({ message: "Extrato bancário carregado", transacoes: transacoes.map(item => `A transação - ${item.MEMO} no valor de ${item.TRNAMT} foi carregada`) })
    });
  } catch (error) {
    res.json({ message: "Erro ao carregar o extrato Bancário" })
  }


})


// medleware para verificar se o Id existe ---------------------------------------------------------------
async function getTransacao(rec, res, next) {
  try {
    transacao = await Transacao.findById(rec.params._id)
    if (transacao === null) {
      return res.status(400).json({ message: "Não foi possível localizar este ID" })
    }
  } catch (error) {
    res.status(500).json(error.message)
  }
  res.transacao = transacao
  next()
}

// busca banco pelo código---------------------------------------------------------------------
async function getBanco(banco) {
  console.log("trasacaoController.getBanco()]...buscando banco...")
  try {
    const bancob = await Banco.find()
      .where('codigo').equals(banco.codigo)
    return bancob
  } catch (error) {
    console.log("trasacaoController.getBanco()]...erro ao buscar o banco")
    return null
  }
}

// verificar bancos, salva se não tiver---------------------------------------------------------------------
async function verificarBanco(data) {
  const bancod = new Banco({
    nome: "",
    codigo: data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.BANKID,
    img: "",
  })
  const bancof = await getBanco(bancod)
  if (bancof != null || bancof != undefined) {
    console.log("trasacaoController.verificarBanco()]...banco da transação já existe no banco de dados...")
    return bancof
  }
  else {
    const updateBanco = await bancod.save()
    console.log("trasacaoController.verificarBanco()]...banco da transação não existe no banco de dados, salvando o novo banco...")
    return updateBanco
  }

}

// busca conta pelo número da conta---------------------------------------------------------------------
async function getConta(conta) {
  console.log("trasacaoController.getConta()]...buscando conta...")
  try {
    const contab = await Conta.find()
      .where('numeroConta').equals(conta.numeroConta)
    return contab
  } catch (error) {
    console.log("[trasacaoController.getConta()]...erro ao buscar a conta: " + error.message)
    return null
  }
}

// verificar contas, salva se não tiver---------------------------------------------------------------------
async function verificarConta(data, banco) {
  const conta = new Conta({
    banco: banco,
    agencia: data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.BRANCHID,
    numeroConta: data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTID
  })
  const contaBancaria = await getConta(conta)
  if (contaBancaria != null || contaBancaria != undefined) {
    console.log("trasacaoController.verificarConta()]...conta da transação já existe no banco de dados...")
    return contaBancaria
  }
  else {
    const novaConta = await conta.save()
    console.log("trasacaoController.verificarConta()]...Conta da transação não existe no banco de dados, salvando a nova conta...")
    return novaConta
  }
}


/**
 * Busca transação no banco de dados, existindo retorna Promise com a transação
 * @param {*} transacao 
 */
async function buscarTransacao(transacao) {
  console.log("trasacaoController.buscarTransacao()]...buscando transação no banco de dados...")
  try {
    const transacaoFind = await Transacao.find()
      .where('codigo').equals(transacao.codigo)
      .where('valor').equals(transacao.valor)
      .where('descricao').equals(transacao.descricao)
    return transacaoFind
  } catch (error) {
    console.log("[trasacaoController.buscarTransacao()]... erro ao buscar a transação: " + error.message)
    return null
  }
}

/**
 * Realiza a montagem da transação recebida do extrato com categoria a definir
 * @param {*} transacaoExtrato 
 * @param {*} conta 
 * @param {*} mes 
 * @param {*} data 
 */
function montarTransacao(transacaoExtrato, conta, mes, data) {
  console.info("[trasacaoController.montarTransacao()]...Montando transação extraída do extrato...")
  const transacao = new Transacao({
    codigo: transacaoExtrato.DTPOSTED,
    descricao: transacaoExtrato.MEMO,
    conta: conta[0],
    categoria: {
      _id: "5ebed2bdbb27fa34d09a8bb2",
    },
    tipo: transacaoExtrato.TRNTYPE,
    mes: mes,
    ano: transacaoExtrato.DTPOSTED.substr(0, 4),
    data: data,
    isAtivo: true,
    valor: transacaoExtrato.TRNAMT,
  })
  console.info("[trasacaoController.montarTransacao()]...Transação montada...")
  console.info("[trasacaoController.montarTransacao()]...verificando transação extraída do extrato...")
  return transacao
}

/**
 * verifica a transacao, salva se não encontrar transação no banco de dados
 * @param {*} transacao
 */
async function validarTransacao(transacao) {
  try {
    const transacaoRecebida = await buscarTransacao(transacao)
    if (transacaoRecebida[0] != null || transacaoRecebida[0] != undefined) {
      console.info("[trasacaoController.verificarTransacao()]...transação " + transacaoRecebida[0].descricao + " já existe no banco de dados...")
      return transacaoRecebida[0].descricao
    }
    else {
      const transacaoSalva = await transacao.save()
      console.info("[trasacaoController.verificarTransacao()]...transacao não existe no banco de dados.")
      return transacaoSalva
    }
  } catch (error) {
    console.info("[trasacaoController.verificarTransacao()]...erro ao salvar transação. " + error.message)
  }
}

function categorizarTransacao(descricao) {
  const categoria = new Categoria()
  descricao.includes('CASCOL') || descricao.includes('GASOLLINE') || descricao.includes('COMB') ? categoria._id = "5ebed2bdbb27fa34d09a8bb2" :
    descricao.includes('') || descricao.includes('') || descricao.includes('') ? categoria._id = "5ebed2bdbb27fa34d09a8bb2" :
      categoria._id = "5ebed2bdbb27fa34d09a8bb2"

}

module.exports = router;