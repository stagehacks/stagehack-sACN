# stagehack-sACN
Dead-Simple library for sending and receiving sACN (E1.31) lighting data.

## Installation
npm coming soon

# Sender
```javascript
const ACNSender = require('hack-sACN').Sender;

ACNSender.Start();
var send1 = new ACNSender.Universe(1, 100);
send1.on("ready", function(){
 this.send([255, 0, 0, 255]);
});
```

# Receiver
```javascript
const ACNReceiver = require('hack-sACN').Receiver;

ACNReceiver.Start();
var receive1 = new ACNReceiver.Universe(1);
receive1.on("packet", function(packet){
 console.log(packet.getSlots());
});
```
