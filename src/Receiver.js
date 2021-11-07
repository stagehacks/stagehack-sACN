var dgram = require('dgram');
const os = require('os');
const sACNPacket = require('./Packet.js');

var _socket;
var _universes = [];

function Start(){
  var self = this;
  this._packet = new sACNPacket.Packet();

  _socket = dgram.createSocket('udp4');
  _socket.on("message", function(msg, network){
    if(msg.slice(4, 13).toString()=="ASC-E1.17"){
      self._packet.fromBuffer(msg);
      _universes[self._packet.getUniverse()]._sourceAddress = network.address;
      _universes[self._packet.getUniverse()]._packet = self._packet;
      _universes[self._packet.getUniverse()]._packetCallback(self._packet);
    }
  });
  _socket.on("listening", function(){
    for(var i in _universes){
      _universes[i]._readyCallback();
    }
  });
  _socket.bind(5568, function(){
    for(var i in _universes){
      _universes[i].begin();
    }
  });

}

function Universe(universe){
  this._universe = universe || 1;
  _universes[this._universe+""] = this;

  this._sourceAddress;
  this._packet;
  this._packetCallback = function(){};
  this._readyCallback = function(){};

}
Universe.prototype.begin = function(){
  _socket.addMembership(sACNPacket.getMulticastGroup(this._universe));
}
Universe.prototype.on = function(event, funct){
  if(event=="packet"){
    this._packetCallback = funct;
  }else if(event=="ready"){
    this._readyCallback = funct;
  }
}
Universe.prototype.toString = function(){
  return {
    "Universe": this._universe,
    "SourceAddress": this._sourceAddress,
    "Packet": this._packet.toString()
  }
}





module.exports.Start = Start;
module.exports.Universe = Universe;