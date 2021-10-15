var dgram = require('dgram');
const os = require('os');
const sACNPacket = require('./Packet.js');

var _interfaces = [];
var _options = {};

function Start(options) {
  _options = options;

  if (_options && _options.interfaces) {
    _interfaces = _options.interfaces;
  } else {
    _interfaces = getNetworkInterfaces();
  }
}

function Universe(universe, priority) {
  var self = this;
  this.universe = universe || 1;
  this.priority = priority || 100;

  this._sockets = [];
  this._readyCallback = function () {};

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
  this.syncPacket = new sACNPacket.Packet();
  this.packet.setUniverse(this.universe);
  this.packet.setPriority(this.priority);
  this.syncPacket.setUniverse(this.universe);
  this.syncPacket.setPriority(this.priority);
  this.syncPacket.setIsSync(true);

  if (_options && _options.cid && _options.cid.length <= 16) {
    this.packet.setCID(_options.cid);
    this.syncPacket.setCID(_options.cid);
  }

  if (_options && _options.source) {
    this.packet.setSource(_options.source);
    this.syncPacket.setSource(_options.source);
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
  this.syncPacket.setSlots(slots);
  for (var i in _interfaces) {
    if (_options.type && _options.type === 'unicast') {
      this._sockets[_interfaces[i]].send(
        this.packet.getBuffer(),
        5568,
        _interfaces[i]
      );
      this._sockets[_interfaces[i]].send(
        this.syncPacket.getBuffer(),
        5568,
        _interfaces[i]
      );
    } else {
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
