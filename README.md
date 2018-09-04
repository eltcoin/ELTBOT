<div align="center">
  <p>
    <img src="https://pbs.twimg.com/media/DOZbENEXkAA2EMr.png" width="250" />
  </p>
  <p>
    ✨ Secure ethereum transactions telegram bot, powered by ELTWallet. Built by ELTCOIN ✨
  </p>
</div>

## How?

* <strong>Bot: </strong>Interacts only with your public address. Generates tx and sends QR Code. 

* <strong>[ELTWallet](https://github.com/eltcoin/ELTWallet): </strong>Scans QR and sends tx. Sends callback to Bot via websockets.

## Local development

Make sure you have `babel-node` installed.

```bash
# Install dependencies
$ npm i

# Get API Key for telegram. Message @BotFather and get one, then add to code. (for now) 🤠 

# Start dev server
$ npm start

```

Have fun!