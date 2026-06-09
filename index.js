import FfmpegPath from '@ffmpeg-installer/ffmpeg';
import WAWebJS from "whatsapp-web.js";
import qrcode from 'qrcode-terminal'
import Spinnies from "spinnies";
import chalk from 'chalk';
import { instagram } from '@jerrycoder/instagram-api';

const spinnies = new Spinnies();
const ffmpegPath = FfmpegPath.path;
const { Client, LocalAuth, MessageMedia } = WAWebJS;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "one",
    dataPath: "./sessions",
  }),
  ffmpegPath,
  puppeteer: {
    executablePath: '/usr/bin/google-chrome-stable', // Replace with the path to your Chrome executable!
		args: ['--no-sandbox']
	}
});

console.log(chalk.green('\n🤖 Simple WhatsApp Bot Sticker by Aromakelapa\n'));

client.initialize();

spinnies.add('Connecting', { text: 'Opening Whatsapp Web' })

client.on('loading_screen', (percent, message) => {
  spinnies.update('Connecting', { text: `Connecting. ${message} ${percent}%`});
});

client.on('qr', (qr) => {
  spinnies.add('generateQr', {text: 'Generating QR Code'});
  console.log(chalk.yellow('[!] Scan QR Code Bellow'));
  qrcode.generate(qr, {small: true});
  spinnies.succeed('generateQr', {text: 'QR Code Generated'});
  spinnies.update('Connecting', { text: 'Waiting to scan' })
});

client.on('authenticated', () => {
  console.log(chalk.green(`✓ Authenticated!                          `))
});

client.on('auth_failure', (msg) => {
  console.error('Authentication Failure!', msg);
});

client.on('ready', () => {
  spinnies.succeed('Connecting', { text: 'Connected!', successColor: 'greenBright' });
  aboutClient(client);
  console.log('Incoming Messages : \n');
});

client.on('message', async (msg) => {
  const chat = await msg.getChat();
  const contact = await msg.getContact();
  console.log(chalk.cyan(`💬 ${contact.pushname} : ${msg.body}\n`));

  try {
    switch (msg.body.toLowerCase()) {
      case '!stiker':
      case '!sticker':
      case 'st':
        if(msg.hasMedia){
          const media = await msg.downloadMedia();
          chat.sendMessage(media,
            {
              sendMediaAsSticker: true,
              stickerName: '',
              stickerAuthor: contact.pushname
            }
          );
          console.log(chalk.green(`💬 ${contact.pushname} : Sticker sent!\n`));
        } else {
          msg.reply('Send image with caption !sticker');
        };
        break;
      case '!error':
        // console.log(new Error());
        new Error();
        break;
    }

    switch (true) {
      case msg.body.startsWith('https://www.instagram.com/'):
        try {
          const ig = await instagram(msg.body);
          const media = await MessageMedia.fromUrl(ig.url, { unsafeMime: true });
          msg.reply(media);
        } catch (error) {
          msg.reply(error.message);
        };
        break;
    }
  } catch (error) {
    console.error(error);
  };
});

client.on('disconnected', (reason) => {
  console.log('Client was logged out, Reason : ', reason);
});

function aboutClient(client){
  console.log(chalk.cyan(                                                                                                                                                  
    '\nAbout Client :' +                                                                                                                                     
    '\n  - Username : ' + client.info.pushname +                                                                                                           
    '\n  - Phone    : ' + client.info.wid.user +                                                                                                       
    '\n  - Platform : ' + client.info.platform + '\n'
  ));
};