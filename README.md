# stagehack-sACN
Dead-Simple library for sending and receiving sACN (E1.31) lighting data. The full ESTA ANSI E1.31 control protocol specification is published at  

## Installation
npm coming soon

# Sender
```javascript
const ACNSender = require('hack-sACN').Sender;
ACNSender.Start(options);
```
### Options:
* `interfaces`: Array of network interfaces on the device to send from. ex: `['192.168.0.40, 10.0.0.5']`
* `cid`: 16-character unique string to represent this device
* `source`: Plaintext name of this device


### Example:
Sends 4 DMX addresses on Universe 1 with Priority 100
```javascript
const ACNSender = require('hack-sACN').Sender;
ACNSender.Start();

var sender = new ACNSender.Universe(1, 100);
sender.on("ready", function(){
 this.send([255, 0, 0, 255]);
});
```



# Receiver
```javascript
const ACNReceiver = require('hack-sACN').Receiver;

ACNReceiver.Start();
var receiver = new ACNReceiver.Universe(1);
receiver.on("packet", function(packet){
 console.log(packet.getSlots());
});
```
