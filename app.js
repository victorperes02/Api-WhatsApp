//const makeWASocket = require ('@adiwajshing/baileys').default
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const db = require('./Db');
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', 'Conectando...');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'BOT-ZDG QRCode recebido, aponte a câmera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', 'BOT-ZDG Dispositivo pronto!');
    socket.emit('message', 'BOT-ZDG Dispositivo pronto!');	
    console.log('BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', 'BOT-ZDG Autenticado!');
    socket.emit('message', 'BOT-ZDG Autenticado!');
    console.log('BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', 'BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  console.log('BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', 'BOT-ZDG Cliente desconectado!');
  console.log('BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});
client.on('message', async msg => {

  if (msg.type.toLowerCase() == "e2e_notification") return null;
  
  if (msg.body == "") return null;

  else if (msg.body !== null) {

    const contact = await msg.getContact();
    const keyword = msg.body;
    const user = contact.number;
    const replyMessage = await db.getReply(keyword);
    const replyWelcome = await db.getWelcome(keyword);
    const getUserFrom = await db.getUser(user);

    if (getUserFrom === false){
      await db.setUser(user);
      console.log('Usuario capturado com sucesso');
    }
    if (getUserFrom !== false) {
      console.log('Usuario já existe no sistema.');
    }  
    else if (msg.body !== null && getUserFrom !== false) {
      await msg.reply (replyWelcome);
      console.log('Boas vindas enviada');
    }///
    if (replyMessage !== false) {
      await msg.reply (replyMessage);
      console.log('Resposta enviada');
    }
    if (replyMessage === false) {
      console.log('Sem resposta definida')
    }
  }
})

/*
// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number + '@c.us';
  const message = req.body.message;


  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

client.on('message', async msg => {

  const nomeContato = msg._data.notifyName;

  if (msg.type.toLowerCase() == "e2e_notification") return null;
  
  if (msg.body == "") return null;

  if (msg.body !== null && msg.body === "1") {

    msg.reply("🤑 AUMENTE O FATURAMENTO DOS SEUS LANÇAMENTOS DISPARANDO MENSAGENS DIRETAMENTE PARA O WHATSAPP PESSOAL DE CADA LEAD, SEM PRECISAR DE CELULAR. DE FORMA AUTOMÁTICA E EM MASSA. São mais de 200 vídeos aulas sobre APIs de WhatsAPP e técnicas de WhatsApp Marketing, conteúdo exclusivo, todas as soluções desse canal para copiar e colar, grupo de alunos e o meu suporte pessoal. Mesmo que você não seja programador, na Comunidade ZDG você vai aprender como fazer disparos em massa com segurança, enviar notificações automáticas pelo WhatsApp, construir ChatBots com inteligência artificial, criar soluções com a API da Baileys, Venom-BOT, WPPConnect, WhatsAppWeb-JS e Cloud API (Api Oficial), construir sistemas para múltiplos atendentes, fazer a gestão automática de grupos de WhatsApp, construir conversas com listas e botões, criar integrações com aplicativos Bubble, WordPress (WooCommerce e Elementor), Botpress, N8N, DialogFlow, ChatWoot e plataformas como Hotmart, Edduz, Monetizze, Rd Station, Mautic, Google Sheets, Active Campaing, e muito mais.\r\n\r\nhttps://zapdasgalaxias.com.br/ \r\n\r\n⏱️ As inscrições estão *ABERTAS*");
  } 
  
  else if (msg.body !== null && msg.body === "2") {
    msg.reply("*" + nomeContato + "*, " + "*que ótimo, vou te enviar alguns cases de sucesso:*\r\n\r\n 📺");
  }
  
  else if (msg.body !== null && msg.body === "3") {
    msg.reply("*" + nomeContato + "*, " + "tudo que você vai ter acesso na Comunidade ZDG (mais de 200 vídeo-aulas).\r\n\r\nMétodo ZDG: R$5.000,00\r\nBot gestor de grupos: R$1.500,00\r\nMulti-disparador via API: R$1.800,00\r\nWebhooks: R$5.200,00\r\nExtensão do Chrome para extração: R$150,00\r\nPacote de aulas sobre grupos de WhatsApp: R$600,00\r\nPacote de aulas + downloads para implementação dos ChatBots: R$5.000,00\r\nPacote de aulas + downloads para notificações automáticas por WhatsApp: R$4.600,00\r\n\r\nNo total, tudo deveria custar:\r\nR$ 23.850,00\r\nMas você vai pagar apenas: R$347,00");
  }
  
  else if (msg.body !== null && msg.body === "4") {

        const contact = await msg.getContact();
        setTimeout(function() {
            msg.reply(`@${contact.number}` + ' seu contato já foi encaminhado para o Pedrinho');  
            client.sendMessage('5515998566622@c.us','Contato ZDG. https://wa.me/' + `${contact.number}`);
          },1000 + Math.floor(Math.random() * 1000));
  
  }
  
  else if (msg.body !== null && msg.body === "4") {
    msg.reply("Seu contato já foi encaminhado para o Pedrinho");
  }
  
  else if (msg.body !== null && msg.body === "5") {
    msg.reply("*" + nomeContato + "*, " +"aproveite o conteúdo e aprenda em poucos minutos como colocar sua API de WhatsAPP no ar, gratuitamente:\r\n\r\n🎥 https://youtu.be/sF9uJqVfWpg");
  }
  
  else if (msg.body !== null && msg.body === "7") {
    msg.reply("😁 Hello, how are you? Choose one of the options below to start our conversation: \r\n\r\n*8*- I want to know more about the ZDG method. \r\n*9*- I would like to know some case studies. \r\n*10*- What will I receive by joining the ZDG class? \r\n*11*- I would like to talk to Pedrinho, but thanks for trying to help me. \r\n*12*- I want to learn how to build my WhatsApp API for FREE. \r\n*13*- I want to know all the programmatic content of the ZDG Community. \r\n*0*- Em *PORTUGUÊS*, por favor! \r\n*14*-  En *ESPAÑOL* por favor.");
  }
  
  else if (msg.body !== null && msg.body === "8") {
    msg.reply("🤑 INCREASE THE BILLING OF YOUR RELEASES BY SHOOTING MESSAGES DIRECTLY TO THE PERSONAL WHATSAPP OF EACH LEAD, WITHOUT NEEDING A MOBILE. AUTOMATICALLY AND IN MASS. There are more than 200 video lessons on WhatsAPP APIs and WhatsApp Marketing techniques, exclusive content, all the solutions on this channel to copy and paste, a group of students and my personal support. Even if you are not a programmer, in the ZDG Community you will learn how to safely mass shoot, send automatic WhatsApp notifications, build ChatBots with artificial intelligence, create solutions with Baileys API, Venom-BOT, WPPConnect, WhatsAppWeb-JS and Cloud API (Official API), build systems for multiple attendants, automatically manage WhatsApp groups, build conversations with lists and buttons, create integrations with Bubble, WordPress (WooCommerce and Elementor), Botpress, N8N, DialogFlow, ChatWoot applications and platforms like Hotmart, Edduz, Monetizze, Rd Station, Mautic, Google Sheets, Active Campaing, and more.\r\n\r\nhttps://zapdasgalaxias.com.br/ \r\n\r\n⏱️ Registration is *OPEN*");
  } 
  
  else if (msg.body !== null && msg.body === "9") {
    msg.reply("");
  }
  
  else if (msg.body !== null && msg.body === "10") {
    msg.reply("Everything you will have access to in the ZDG Community (over 200 video lessons).\r\n\r\nZDG method: R$5,000.00\r\nBot group manager: R$1,500.00\r\nMulti-trigger via API: R$1,800.00\ r\nWebhooks: R$5,200.00\r\nChrome extension for extraction: R$150.00\r\nPackage of lessons on WhatsApp groups: R$600.00\r\nPackage of lessons + downloads for implementing ChatBots: R $5,000.00\r\nClass package + downloads for automatic notifications via WhatsApp: R$4,600.00\r\n\r\nIn total, everything should cost:\r\nR$23,850.00\r\nBut you will pay only: R$347.00");
  }
  
  else if (msg.body !== null && msg.body === "11") {

        const contact = await msg.getContact();
        setTimeout(function() {
            msg.reply(`@${contact.number}` + ' your contact has already been forwarded to Pedrinho');  
            client.sendMessage('5515998566622@c.us','Contato ZDG - EN. https://wa.me/' + `${contact.number}`);
          },1000 + Math.floor(Math.random() * 1000));
  
  }
  
  else if (msg.body !== null && msg.body === "11") {
    msg.reply("Your contact has already been forwarded to Pedrinho");
  }
  
  else if (msg.body !== null && msg.body === "12") {
    msg.reply("Enjoy the content and learn in a few minutes how to put your WhatsAPP API online, for free:\r\n\r\n🎥 https://youtu.be/sF9uJqVfWpg");
  }
  
  else if (msg.body !== null && msg.body === "14") {
    msg.reply("😁 Hola, ¿cómo estás? ¿Cómo te va? Elija una de las siguientes opciones para iniciar nuestra conversación: \r\n\r\n*15*- Quiero saber más sobre el método ZDG. \r\n*16*- Me gustaría conocer algunos casos prácticos. \r\n*17*- ¿Qué recibiré al unirme a la clase ZDG? \r\n*18*- Me gustaría hablar con Pedrinho, pero gracias por intentar ayudarme. \r\n*19*- Quiero aprender a crear mi API de WhatsApp GRATIS.\r\n*20*- Quiero conocer todo el contenido programático de la Comunidad ZDG. \r\n*0*- Em *PORTUGÊS*, por favor! \r\n*7*- In *ENGLISH* please!");
  }
  
  else if (msg.body !== null && msg.body === "15") {
    msg.reply("🤑");
  } 
  
  else if (msg.body !== null && msg.body === "16") {
    msg.reply("");
  }
  
  else if (msg.body !== null && msg.body === "17") {
    msg.reply("");
  }
  
  else if (msg.body !== null && msg.body === "18") {

        const contact = await msg.getContact();
        setTimeout(function() {
            msg.reply(`@${contact.number}` + ' su contacto ya ha sido reenviado a Pedrinho');  
            client.sendMessage('5515998566622@c.us','Contato ZDG - ES. https://wa.me/' + `${contact.number}`);
          },1000 + Math.floor(Math.random() * 1000));
  
  }
  
  else if (msg.body !== null && msg.body === "18") {
    msg.reply("Su contacto ya ha sido reenviado a Pedrinho");
  }
  
  else if (msg.body !== null && msg.body === "19") {
    msg.reply("Disfruta del contenido y aprende en unos minutos cómo poner en línea tu API de WhatsAPP, gratis:\r\n\r\n🎥 https://youtu.be/sF9uJqVfWpg");
  }
  else if (msg.body !== null && msg.body === "6"){
	  msg.reply("👨‍🏫 I 📌 A⚠️🚀 🛸 🤖 📰 ");
  }
	else if (msg.body !== null && msg.body === "13"){
		msg.reply("👨‍🏫 🎁 domain\r\n👨‍💻");
	}
    else if (msg.body !== null && msg.body === "20"){
		msg.reply(" ");
    esteCliente = Cliente()
    


	}
	 else if (msg.body !== null || msg.body === "0") {
    const saudacaoes = ['Olá ' + nomeContato + ', tudo bem?', 'Oi ' + nomeContato + ', como vai você?', 'Opa ' + nomeContato + ', tudo certo?'];
    const saudacao = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];
    msg.reply(saudacao + " Escolha uma das opções abaixo para iniciarmos a nossa conversa: \r\n\r\n*1*- Quero saber mais sobre o método ZDG. \r\n*2*- Gostaria de conhecer alguns estudos de caso. \r\n*3*- O que vou receber entrando para a turma da ZDG? \r\n*4*- Gostaria de falar com o Pedrinho, mas obrigado por tentar me ajudar. \r\n*5*- Quero aprender como montar minha API de WhatsApp de GRAÇA.\r\n*6*- Quero conhecer todo o conteúdo programático da Comunidade ZDG. \r\n*7*- In *ENGLISH* please! \r\n*14*- En *ESPAÑOL* por favor.");
	}
});

    */
server.listen(port, function() {
        console.log('App running on *: ' + port);
});


/* Classes */

class Cliente{
    user = nomeContato;
    phone = req.body.number;
    contact = number;


}
