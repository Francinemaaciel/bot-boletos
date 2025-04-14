# 🤖 Bot de Boletos no Telegram

Este é um bot feito com Node.js para ajudar no controle de boletos diretamente pelo Telegram. A ideia inicial surgiu para ajudar meus pais na organização dos boletos do dia a dia — de um jeito simples, rápido e centralizado.

O bot está hospedado no [Railway](https://railway.app), o que permite que ele esteja sempre online e disponível para uso. 💻☁️

## 🚀 Funcionalidades

- `/start` – Inicia a conversa com o bot.
- `/boletos` – Lista todos os boletos pendentes.
- `/paguei <nome>` – Marca um boleto como pago.
- `/adicionar_boleto <nome> <valor> <vencimento> <código_de_barras>` – Adiciona um novo boleto.

## 🛠️ Tecnologias

- Node.js
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- dotenv
- fs (File System)
- Railway (para deploy)
