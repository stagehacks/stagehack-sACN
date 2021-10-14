# 🔌stagehack-sACN
Simple library for sending and receiving [sACN (E1.31)](https://tsp.esta.org/tsp/documents/docs/ANSI_E1-31-2018.pdf) lighting data. It is not the full E1.31 protocol, but should be close enough for most projects.


**This library supports**
* Multiple network interfaces
* Multicast and Unicast
* ETC Net3 (coming soon)


## Installation
`npm install stagehack-sacn`



# Sender
```javascript
const ACNSender = require('stagehack-sACN').Sender;
ACNSender.Start([options]);
var universe = new ACNSender.Universe([universe], [priority]);
```
### Sender Options:
* `interfaces`: Array of IPv4 network interfaces on the device to send from. ex: `['192.168.0.40, 10.0.0.5']`
* `cid`: 16-character UUID to represent this device. ex: `"036b2d4932174812"`
* `source`: Plaintext name of this device. ex: `"Tim's MacBook Pro"`
* `type`: `"unicast"` or `"multicast"`. Defaults to `"multicast"` if neither is provided

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
	 // send as an array
	this.send([255, 0, 0, 255]);

	// or send as key-value pairs
	this.send({
	 	4: 255,
	 	11: 150,
	 	301: 155
	});
});
```

Sender also provides `sender.getPossibleInterfaces()` which returns a list of all IPv4 network interfaces on the device. Useful for populating a dropdown or other UI.



# Receiver
```javascript
const ACNReceiver = require('stagehack-sACN').Receiver;
ACNReceiver.Start();
var universe = new ACNReceiver.Universe([universe]);
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
* `getSlots`: gets current Slots (length 1-512)
* `getSequence`: gets current Sequence
* `getBuffer`: returns a Buffer of the complete sACN Packet


# TODO
* Add "allReady" event for when all Senders/Receivers are ready
* Implement Net3
