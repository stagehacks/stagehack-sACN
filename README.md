# stagehack-sACN
Dead-Simple library for sending and receiving sACN (E1.31) lighting data. The full ESTA ANSI E1.31 control protocol specification is published at  

## Installation
npm coming soon

# Sender
```javascript
const ACNSender = require('hack-sACN').Sender;
ACNSender.Start([options]);
var universe = new ACNSender.Universe([universe], [priority]);
```
### Sender Options:
* `interfaces`: Array of network interfaces on the device to send from. ex: `['192.168.0.40, 10.0.0.5']`
* `cid`: 16-character unique string to represent this device. ex: `"036b2d4932174812"`
* `source`: Plaintext name of this device. ex: `"Tim's MacBook Pro"`

### Universe Options:
* `universe`: Packet's Universe. Default: `1`
* `priority`: Packet's Priority. Defauly: `100`

### Example:
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
