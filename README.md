# stagehack-sACN
Dead-Simple library for sending and receiving sACN (E1.31) lighting data. The full ESTA ANSI E1.31 control protocol specification is published at  

## Installation
npm coming soon

# Sender
```javascript
const ACNSender = require('stagehack-sACN').Sender;
ACNSender.Start([options]);
var universe = new ACNSender.Universe([universe], [priority]);
```
### Sender Options:
* `interfaces`: Array of IPv4 network interfaces on the device to send from. ex: `['192.168.0.40, 10.0.0.5']`
* `cid`: 16-character unique string to represent this device. ex: `"036b2d4932174812"`
* `source`: Plaintext name of this device. ex: `"Tim's MacBook Pro"`

### Universe Options:
* `universe`: Default: `1`
* `priority`: Default: `100`

### Example:
```javascript
const ACNSender = require('stagehack-sACN').Sender;
ACNSender.Start({
	interfaces: ["192.168.0.40"]
});

var sender = new ACNSender.Universe(1, 100);
sender.on("ready", function(){
 this.send([255, 0, 0, 255]);
});
```


# Receiver
```javascript
const ACNReceiver = require('stagehack-sACN').Receiver;
ACNReceiver.Start();
var universe = new ACNReceiver.Universe(1);
```
### Universe Options:
* `universe`: Default: `1`

### Example:
```javascript
receiver.on("packet", function(packet){
 console.log(packet.getSlots());
});
```

# Packet
Setters:
* `setUniverse`: sets the Universe
* `setPriority`: sets the Priority
* `setCID`: sets the CID
* `setSource`: sets the Source
* `setSlots`: sets the Slots

Getters:
* `getUniverse`: gets the Universe
* `getPriority`: gets the Priority
* `getCID`: gets the CID
* `getSource`: gets the Source
* `getSequence`: gets current Sequence
* `getBuffer`: returns a Buffer of the complete sACN Packet