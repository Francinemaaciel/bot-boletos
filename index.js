require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Função para ler os boletos do arquivo
function lerBoletos() {
  const data = fs.readFileSync('boletos.json');
  return JSON.parse(data);
}

// Função para salvar boletos atualizados
function salvarBoletos(boletos) {
  fs.writeFileSync('boletos.json', JSON.stringify(boletos, null, 2));
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Olá, ${msg.from.first_name}! Eu sou seu bot de boletos! Use /boletos para ver os pendentes.`);
});

// Comando /boletos
bot.onText(/\/boletos/, (msg) => {
  const boletos = lerBoletos();
  const pendentes = boletos.filter(b => !b.pago);

  if (pendentes.length === 0) {
    bot.sendMessage(msg.chat.id, "Uhul! Todos os boletos estão pagos!");
  } else {
    let mensagem = "Boletos pendentes:\n";
    pendentes.forEach(b => {
      mensagem += `- ${b.nome}: R$ ${b.valor.toFixed(2)} (vence em ${b.vencimento})\n Código de barras: ${b.codigoDeBarras}\n`;
    });
    bot.sendMessage(msg.chat.id, mensagem);
  }
});

// Comando para adicionar um novo boleto
bot.onText(/\/adicionar_boleto (.+) (\d+(\.\d{1,2})?) (\d{2}\/\d{2}\/\d{2}) (\d{44})/, (msg, match) => {
  const nomeBoleto = match[1].trim(); // Nome do boleto
  const valor = parseFloat(match[2]); // Valor do boleto
  const vencimento = match[4]; // Vencimento (dd/mm/aa)
  const codigoDeBarras = match[5]; // Código de barras (44 caracteres)

  const boletos = lerBoletos(); // Lê os boletos do arquivo
  const novoBoleto = {
    nome: nomeBoleto,
    valor: valor,
    vencimento: vencimento,
    codigoDeBarras: codigoDeBarras,
    pago: false
  };

  // Adiciona o novo boleto
  boletos.push(novoBoleto);

  // Salva os boletos atualizados
  salvarBoletos(boletos);
  bot.sendMessage(msg.chat.id, `Novo boleto adicionado:\nNome: ${nomeBoleto}\nValor: R$ ${valor.toFixed(2)}\nVencimento: ${vencimento}\nCódigo de barras: ${codigoDeBarras}`);
});

// Comando /paguei <nome>
bot.onText(/\/paguei (.+)/, (msg, match) => {
  const nomeDigitado = match[1].trim().toLowerCase();
  const boletos = lerBoletos();
  const boleto = boletos.find(b => b.nome.toLowerCase() === nomeDigitado);

  if (boleto) {
    if (boleto.pago) {
      bot.sendMessage(msg.chat.id, `O boleto de ${boleto.nome} já está marcado como pago.`);
    } else {
      boleto.pago = true;
      salvarBoletos(boletos);
      bot.sendMessage(msg.chat.id, `Beleza! Marquei o boleto de ${boleto.nome} como pago.`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `Não achei esse boleto. Tente /boletos para ver os nomes.`);
  }
});
