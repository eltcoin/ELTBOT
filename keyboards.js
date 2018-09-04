var keyboards = {
    startButtons: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Deposit ETH',
                    callback_data: 'beginDepositETH'
                },{
                    text: 'Deposit ELT',
                    callback_data: 'beginDepositELT'
                },{
                    text: 'View Balance',
                    callback_data: 'showBalance'
                },{
                    text: 'Show Offers',
                    callback_data: 'showOffers'
                }]
            ]
        })
    },
    chatPaymentSessionBools: {
        reply_markup: JSON.stringify({
            "resize_keyboard": true, 
            "one_time_keyboard": true,
            inline_keyboard: [
                [{
                    text: '✅',
                    callback_data: 'beginPaymentSession_true'
                }],
                [{
                    text: '❌',
                    callback_data: 'beginPaymentSession_false'
                }]
            ]
        })
    },
}