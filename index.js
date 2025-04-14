require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

const fs = require('fs');

const bot = new TelegramBot(token, {polling: true});

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

  // Comando para atualizar o valor, vencimento e código de barras de um boleto
bot.onText(/\/atualizar_boleto (.+) (\d+(\.\d{1,2})?) (\d{2}\/\d{2}\/\d{2}) (\d{44})/, (msg, match) => {
  const nomeBoleto = match[1].trim().toLowerCase(); // Nome do boleto
  const novoValor = parseFloat(match[2]); // Novo valor
  const novoVencimento = match[3]; // Novo vencimento (dd/mm/aa)
  const novoCodigoBarras = match[4]; // Novo código de barras (44 caracteres)

  const boletos = lerBoletos(); // Lê os boletos do arquivo
  const boleto = boletos.find(b => b.nome.toLowerCase() === nomeBoleto);

  if (boleto) {
    // Atualiza o valor, vencimento e código de barras do boleto
    boleto.valor = novoValor;
    boleto.vencimento = novoVencimento;
    boleto.codigo_barras = novoCodigoBarras;
    
    // Salva os boletos atualizados
    salvarBoletos(boletos);
    bot.sendMessage(msg.chat.id, `O boleto de ${boleto.nome} foi atualizado para R$ ${boleto.valor.toFixed(2)} com vencimento em ${boleto.vencimento} e código de barras: ${boleto.codigo_barras}.`);
  } else {
    bot.sendMessage(msg.chat.id, `Não encontrei o boleto ${nomeBoleto}. Tente novamente.`);
  }
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

