var dgram = require('dgram');
const os = require('os');
const sACNPacket = require('./Packet.js');

var _interfaces = [];
var _options = {};
var _universes = {};
var _keepAliveInterval;

function Start(options) {
  if (options){
    if(options.interfaces) {
      _interfaces = options.interfaces;
    }
    if(options.keepAlive != false){
      startKeepAliveInterval();
    }
    _options.type = options.type;
  } else {
    _interfaces = getNetworkInterfaces();
    startKeepAliveInterval();
  }

}

function Universe(universe, priority) {
  var self = this;

  this.universe = universe || 1;
  this.priority = priority || 100;

  this._sockets = [];
  this._readyCallback = function () {};
  _universes[this.universe] = this;

  var j = 0;
  for (var i in _interfaces) {
    this._sockets[_interfaces[i]] = dgram.createSocket('udp4');
    this._sockets[_interfaces[i]].bind({}, function () {
      j++;
      if (j == _interfaces.length) {
        self._readyCallback();
      }
    });
  }

  this.packet = new sACNPacket.Packet();
  this.packet.setUniverse(this.universe);
  this.packet.setPriority(this.priority);

  if (_options && _options.cid && _options.cid.length <= 16) {
    this.packet.setCID(_options.cid);
  }

  if (_options && _options.source) {
    this.packet.setSource(_options.source);
  }

}

Universe.prototype.send = function (arg) {
  var slots;
  if (Array.isArray(arg)) {
    // passed an array of addresses
    slots = arg;
  } else if (typeof arg == 'object') {
    // passed an object of non-sequential addresses
    slots = new Array(512).fill(0);
    for (var addr in arg) {
      slots[addr - 1] = arg[addr];
    }
  }
  this.packet.setSlots(slots);
  for (var i in _interfaces) {
    if (_options && _options.type && _options.type === 'unicast') {
      // send packet unicast to a single destination IP
      this._sockets[_interfaces[i]].send(
        this.packet.getBuffer(),
        5568,
        _interfaces[i]
      );
    } else {
      // send packet multicast to all members
      this._sockets[_interfaces[i]].setMulticastInterface(_interfaces[i]);
      this._sockets[_interfaces[i]].send(
        this.packet.getBuffer(),
        5568,
        sACNPacket.getMulticastGroup(this.universe)
      );
    }
  }
};

Universe.prototype.on = function (event, funct) {
  if (event == 'ready') {
    this._readyCallback = funct;
  }
};

Universe.prototype.getUniverse = function () {
  return this.universe;
};
Universe.prototype.getPacket = function () {
  return this.packet;
};
Universe.prototype.getInterfaces = function () {
  return _interfaces;
};
Universe.prototype.toString = function () {
  return {
    Universe: this.getUniverse(),
    Interfaces: this.getInterfaces(),
    Packet: this.packet.toString()
  };
};

Universe.prototype.getPossibleInterfaces = function () {
  return getNetworkInterfaces();
};

Universe.prototype.close = function(){
  delete _universes[this.universe];
}

function startKeepAliveInterval(){
  clearInterval(_keepAliveInterval);
  _keepAliveInterval = setInterval(sendKeepAliveCache, 900);
}

function sendKeepAliveCache(){
  for(var i in _universes){
    _universes[i].send(_universes[i].packet.getSlots());
  }
}

function getNetworkInterfaces() {
  var out = [];
  var interfaces = os.networkInterfaces();
  for (var iface in interfaces) {
    for (var address in interfaces[iface]) {
      if (interfaces[iface][address].family == 'IPv4') {
        out.push(interfaces[iface][address].address);
      }
    }
  }
  return out;
}

module.exports.Universe = Universe;
module.exports.Start = Start;
