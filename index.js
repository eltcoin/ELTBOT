import ethers, {
    utils
} from 'ethers';
import Telegraf, { TelegramOptions } from 'telegraf';
import Extra from 'telegraf/extra';
import session from 'telegraf/session';
import Router from 'telegraf/router';
import Markup from 'telegraf/markup';
import Stage from 'telegraf/stage';
import WizardScene from 'telegraf/scenes/wizard';
import Composer from 'telegraf/composer';
import EthereumQRPlugin from 'ethereum-qr-code'
import qr from 'qrcode'
import imgur from 'imgur'
import fetch from 'node-fetch';

import WebSocket from 'ws';



const wss = new WebSocket.Server({
    port: 8080
}, () => {

    const ethQR = new EthereumQRPlugin()


    const bot = new Telegraf('<insert API Key here>');


    bot.use(session({
        ttl: 10
    }))

    const startKeyboardMarkup = Markup.inlineKeyboard([
        Markup.callbackButton('Deposit ETH', 'deposit_ETH'),
        Markup.callbackButton('Deposit ELT', 'deposit_ELT'),
        Markup.callbackButton('View Offers', 'showOffers'),
        Markup.callbackButton('View Balances', 'showBalances')
    ], {
        columns: 2
    }).extra();

    wss.on('connection', (ws, req) => {


        ws.on('message', async (_message) => {
            if (_message.match(/eltbotCallback/)) {
                console.log(_message);
                let cbObj = JSON.parse(_message.replace('eltbotCallback:', ''));
                if (cbObj.chatID) {
                   bot.telegram.sendMessage(cbObj.chatID, 'Authentication successful!');
                   let chat = await (bot.TelegramOptions.getChat(cbObj.chatID));
                   console.log(chat);
                }
            }
        })
    });

    let test = async () => {

    let a = await (bot.telegram.getChat(137217262,137217262));
    let b = Telegraf.session(137217262,137217262);
    console.log(b);
    console.log(a);
    }
    test();

    bot.start((ctx) => {
        if (!ctx.session.ethAddress) {
            return ctx.reply(`Please send me the address you want to link`);
        }
        return ctx.reply(`Connected to address: ${ctx.session.ethAddress}`, startKeyboardMarkup)
    })

    bot.hears(/^(0x)?[0-9a-fA-F]{40}$/, async (ctx) => {
        var addr = 0;
        try {
            addr = utils.getAddress(ctx.message.text);
        } catch (e) {
            if (e.expected) {
                addr = e.expected;
                ctx.reply('Checksum Address: ' + addr);
            }
        }
        if (addr == 0) return ctx.reply('Invalid Address Supplied');
        ctx.session.ethAddress = addr;
        return ctx.reply(`Added. Please use /start to begin trading`);
    })


    bot.on('text', async (ctx) => {

        if (ctx.session.isDepositingETH) {
            ctx.session.isDepositingETH = false;
            let ethDepositAmount = parseFloat(ctx.update.message.text.match(/([+-]?([0-9]*[.])?[0-9]+)/))

            console.log(ethDepositAmount);

            if (!ethDepositAmount) {
                ctx.reply(ctx.update.message.text + ' is not a valid amount, please try again 🙃');
                ctx.session.isDepositingETH = true;
                return;
            }

            const qrCode = await (qr.toDataURL('eltbotCallback:' + JSON.stringify({
                "chatID": ctx.update.message.chat.id,
                "ethereumURI": {
                    "to": "0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208",
                    "from": ctx.session.ethAddress,
                    "value": parseInt(utils.parseEther(ethDepositAmount.toString()).toString(10)),
                    "gas": 5000000,
                    "mode": "contract_function",
                    "functionSignature": {
                        "name": "deposit",
                        "payable": true
                    }
                }
            })))



            if (!qrCode) return;

            let base64Image = qrCode.replace('data:image/png;base64,', '')
            let imgurResp = await (imgur.uploadBase64(base64Image))
            ctx.replyWithPhoto(imgurResp.data.link)

        }

        if (ctx.session.isBuying) {
            ctx.session.isBuying = false;
            let amount = parseFloat(ctx.update.message.text.match(/([+-]?([0-9]*[.])?[0-9]+)/))
            console.log(amount);
            if (!amount) {
                ctx.reply(ctx.update.message.text + ' is not a valid amount, please try again 🙃')
                ctx.session.isBuying = true
                return
            }

            // let tx = 

            const startKeyboardMarkup = Markup.inlineKeyboard([
                Markup.callbackButton('Create Transaction', 'signTx:'),
                Markup.callbackButton('Create Transaction', 'signTx:')
            ], {
                columns: 2
            }).extra();

            ctx.reply('Buying ' + amount + ' at ' + ctx.session.buyPrice + ' will cost ' + (amount * ctx.session.buyPrice) + ' ETH.\
        \nHow would you like to proceed?');

        }
    })

    // bot.start(async(ctx) => {
    //     let startKeyboard = keyboards.startKeyboard;

    //     ctx.reply('Custom buttons keyboard', Markup.inlineKeyboard([
    //         Markup.callbackButton('Deposit ETH', 'deposit'),
    //         Markup.callbackButton('Deposit ELT', 'depositELT')
    //       ])
    //     .oneTime()
    //     .resize()
    //     .extra()
    //   )

    //     await ctx.reply('Hi', startKeyboard,);
    // })
    // bot.help((ctx) => ctx.reply('Beta'))



    // bot.command('/deposit', (ctx) => {
    //     ctx.reply('Plese send your ETH address',)
    // })

    // bot.on('callback_query', async(ctx) => {
    //     const query = ctx.update.callback_query,
    //         queryName = query.data,
    //         message = query.message
    //     console.log(queryName);
    //     console.log(message);

    // })

    // bot.hears(/buy/i, (ctx) => ctx.reply('Buy-buy'))


    const exchange = new Router(({
        callbackQuery
    }) => {
        if (!callbackQuery.data) {
            return
        }
        const parts = callbackQuery.data.split(':')
        return {
            route: parts[0],
            state: {
                price: parseFloat(parts[1]) || 0
            }
        }
    })

    exchange.on('sign', async (ctx) => {


        await ctx.reply('To prove ownership over your address please scan this QR code with ELTWallet, or click this link: <dl>')

        const qrCode = ethQR.toDataUrl({
            "to": "0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208",
            "from": ctx.session.ethAddress,
            "value": utils.parseEther(ethDepositAmount),
            "gas": 5000000,
            "mode": "contract_function",
            "functionSignature": {
                "name": "deposit",
                "payable": true,
                "args": []
            },
            "argsDefaults": []
        });

        qrCode.then((code) => {
            var base64Image = code.dataURL.replace('data:image/png;base64,', '');
            imgur.uploadBase64(base64Image)
                .then(function (json) {
                    ctx.replyWithPhoto(json.data.link);
                })
                .catch(function (err) {
                    console.error(err.message);
                });
        })

    })

    exchange.on('showOffers', async (ctx) => {
        await (fetch('https://api.idex.market/returnOrderBook', {
            method: 'POST',
            body: JSON.stringify({
                market: 'ETH_ELTCOIN'
            })
        }).then(async (res) => {
            res = await (res.json());

            let offersMarkup = Markup.inlineKeyboard([
                Markup.callbackButton('0', '0'),
            ], {
                columns: 2
            }).extra();
            offersMarkup.reply_markup.inline_keyboard.pop();
            for (var ask in res.asks) {
                var theAsk = res.asks[ask];
                var callbackText = 'buy:' + theAsk.price.toString();
                console.log(callbackText);
                offersMarkup.reply_markup.inline_keyboard.push([Markup.callbackButton(`Buy ${theAsk.amount} for: ${theAsk.price} ETH`, callbackText)]);
            }
            // console.log(offersMarkup);
            if ((res.asks) && (res.asks.length !== 0)) {
                await (ctx.reply('ok.', offersMarkup));
            } else {
                await (ctx.reply('No offers today 😥'));
            }
            // console.log(res);
        }).catch(err => {
            console.log('Error: ', err)
        }));


    })

    exchange.on('buy', async (ctx) => {
        console.log('buy');
        ctx.session.isBuying = true;
        ctx.session.buyPrice = ctx.state.price;
        await (ctx.reply('How much would you like to buy at ' + ctx.state.price));
    })

    exchange.on('deposit_ETH', async (ctx) => {
        await (ctx.reply('How much ETH would you like to deposit? Example: 0.25 ETH' + ctx.state.price));
        ctx.session.isDepositingETH = true;
    })

    exchange.otherwise((ctx) => ctx.reply('🌯'))


    bot.on('callback_query', exchange);


    bot.startPolling()
});