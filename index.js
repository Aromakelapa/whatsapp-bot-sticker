import FfmpegPath from '@ffmpeg-installer/ffmpeg';
import WAWebJS from "whatsapp-web.js";
import qrcode from 'qrcode-terminal'
import Spinnies from "spinnies";
import chalk from 'chalk';
import fs from 'fs';

const spinnies = new Spinnies();
const ffmpegPath = FfmpegPath.path;
const { Client, LocalAuth } = WAWebJS;

const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath,
  puppeteer: {
		args: ['--no-sandbox']
	}
});

console.log(chalk.green('\n[🤖] Simple WhatsApp Bot Sticker by Aromakelapa\n'));

// On Login
client.on('qr', (qr) => {
  spinnies.add('generateQr', {text: 'Generating QR Code'});
  console.log(chalk.yellow('[!] Scan QR Code Bellow'));
  qrcode.generate(qr, {small: true});
  spinnies.succeed('generateQr', {text: 'QR Code Generated'});
});

spinnies.add('Connecting', { text: 'Connecting'});

// Authenticated
client.on('authenticated', () => {
  console.log(chalk.green('Authenticated!'));
});

// Auth Failure
client.on('auth_failure', (msg) => {
  console.error('Authentication Failure!', msg);
});

// Bot Ready
client.on('ready', () => {
  spinnies.succeed('Connecting', { text: 'Connected!', successColor: 'greenBright' });
  aboutClient(client);
  console.log('Incoming Messages : \n');
});

// Messages Handler
client.on('message', async (msg) => {
  const chat = await msg.getChat();
  const contact = await msg.getContact();
  console.log(`⬇️ ${contact.pushname} : ${msg.body}\n`);

  try {
    switch (msg.body.toLowerCase()) {
      case '!stiker':
      case '!sticker':
        if(msg.hasMedia){
          const media = await msg.downloadMedia();
          chat.sendMessage(media, { sendMediaAsSticker: true });
          console.log(chalk.green(`⬆ ${contact.pushname} : Send sticker.\n`));
        } else {
          msg.reply('_Send image with caption !sticker_');
        };
        break;
      case '!error':
        // console.log(new Error());
        new Error();
        break;
    }
  } catch (error) {
    console.error(error);
  };
});

// Init Bot
client.initialize();

// Disconnected
client.on('disconnected', (reason) => {
  console.log('Client was logged out, Reason : ', reason);
});

function aboutClient(client){
  console.log(                                                                                                                                                  
    '\nAbout Client :' +                                                                                                                                     
    '\n  - Username : ' + client.info.pushname +                                                                                                           
    '\n  - Phone Number : ' + client.info.wid.user +                                                                                                       
    '\n  - Platform : ' + client.info.platform + '\n'
  );
};