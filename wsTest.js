const WebSocket = require('ws');






const ws = new WebSocket('ws://127.0.0.1:8080');

// console.log(ws);


ws.on('open', function open() {

  let a = {
    test: true,
    isValid: false,
    string: "something",
    obj: {
      nstObj: {
        deeper: "thoughts",
        arr: [0, 1, 2]
      },
      nstArr: [0, 1, 2, "three"],
      somethingElse: "valid",
    },
    array: [0, 1, "two"]
  }

  ws.send('eltbotCallback:' + JSON.stringify(a));


  ws.on('message', (data) => {});

})