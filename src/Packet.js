const os = require('os');

const ACN_PID = Buffer.from('ASC-E1.17');
const VECTOR_ROOT_E131_DATA = 0x00000004;
const VECTOR_ROOT_E131_SYNC = 0x00000008;
const VECTOR_E131_DATA_PACKET = 0x00000002;
const VECTOR_DMP_SET_PROPERTY = 0x02;

function Packet(universe, priority, cid, source) {
  this._buffer = Buffer.alloc(0);
  this._rootLayer;
  this._framingLayer;
  this._DMPLayer;
  this._values;

  this._sequence = 0x00;
  this._universe = 1;
  this._isSync = false;
  this._priority = 100;
  this._slots = [];
  this._cid = Buffer.from([
    0x29, 0x97, 0x97, 0x45, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ]);
  this._source = Buffer.from(os.hostname());

  this.update();
}

Packet.prototype.update = function () {
  this._rootLayer = Buffer.alloc(38);
  this._rootLayer.writeUInt16BE(0x0010, 0); // Preamble Size
  this._rootLayer.writeUInt16BE(0x0000, 2); // Post-amble Size
  ACN_PID.copy(this._rootLayer, 4); // ACN Packet Identifier
  this._rootLayer.writeUInt16BE(0x7000 | (110 + this._slots.length), 16); // Flags and Length
  if (this._isSync) {
    this._rootLayer.writeUInt32BE(VECTOR_ROOT_E131_SYNC, 18);
  } else {
    this._rootLayer.writeUInt32BE(VECTOR_ROOT_E131_DATA, 18); // Vector
  }
  this._cid.copy(this._rootLayer, 22); // CID

  this._framingLayer = Buffer.alloc(77);
  this._framingLayer.writeUInt16BE(0x7000 | (88 + this._slots.length), 0); // Flags and Length
  this._framingLayer.writeUInt32BE(VECTOR_E131_DATA_PACKET, 2); // Vector
  this._source.copy(this._framingLayer, 6); // Source Name
  this._framingLayer.writeUInt8(this._priority, 70); // Priority
  this._framingLayer.writeUInt16BE(0x0000, 71); // Synchronization Address
  this._framingLayer.writeUInt8(this._sequence, 73); // Sequence Number
  this._framingLayer.writeUInt8(0x00, 74); // Options
  this._framingLayer.writeUInt16BE(this._universe, 75); // Universe

  this._DMPLayer = Buffer.alloc(11);
  this._DMPLayer.writeUInt16BE(0x7000 | (11 + this._slots.length), 0); // Flags and Length
  this._DMPLayer.writeUInt8(VECTOR_DMP_SET_PROPERTY, 2); // Vector
  this._DMPLayer.writeUInt8(0xa1, 3); // Address Type & Data Type
  this._DMPLayer.writeUInt16BE(0x0000, 4); // First Property Address
  this._DMPLayer.writeUInt16BE(0x0001, 6); // Address Increment
  this._DMPLayer.writeUInt16BE(this._slots.length + 1, 8); // Property value count

  this._buffer = Buffer.concat([
    this._rootLayer,
    this._framingLayer,
    this._DMPLayer,
    Buffer.from(this._slots)
  ]);
};

Packet.prototype.setUniverse = function (universe) {
  this._universe = universe;
  this.update();
};
Packet.prototype.setPriority = function (priority) {
  this._priority = priority;
  this.update();
};
Packet.prototype.setIsSync = function (bool) {
  this._isSync = bool;
  this.update();
};
Packet.prototype.setCID = function (cid) {
  this._cid = Buffer.from(cid);
  this.update();
};
Packet.prototype.setSource = function (source) {
  this._source = Buffer.from(source);
  this.update();
};
Packet.prototype.setSlots = function (slots) {
  this._slots = slots;
  this.update();
};
Packet.prototype.getBuffer = function () {
  this._sequence++;
  if (this._sequence > 255) {
    this._sequence = 0;
  }
  this._framingLayer.writeUInt8(this._sequence, 73);
  this.update();
  return this._buffer;
};

Packet.prototype.getUniverse = function () {
  return this._framingLayer.readUInt16BE(75);
};
Packet.prototype.getPriority = function () {
  return this._framingLayer.readUInt8(70);
};
Packet.prototype.getCID = function () {
  return this._framingLayer
    .slice(6, this._framingLayer.indexOf(0x00, 6))
    .toString();
};
Packet.prototype.getSource = function () {
  return this._framingLayer
    .slice(6, this._framingLayer.indexOf(0x00, 6))
    .toString();
};
Packet.prototype.getSlots = function () {
  return this._slots;
};
Packet.prototype.getSequence = function () {
  return this._framingLayer.readUInt8(73);
};

Packet.prototype.fromBuffer = function (buf) {
  buf.copy(this._rootLayer, 0, 0, 38);
  buf.copy(this._framingLayer, 0, 38, 115);
  buf.copy(this._DMPLayer, 0, 115, 126);

  this._slots = Array.prototype.slice.call(buf, 126);
};
Packet.prototype.toString = function () {
  return {
    Universe: this.getUniverse(),
    Priority: this.getPriority(),
    Sequence: this.getSequence(),
    Source: this.getSource(),
    Slots: this.getSlots().join(',')
  };
};

// From https://github.com/hhromic/e131-node/blob/master/lib/e131.js
function getMulticastGroup(universe) {
  if (universe < 1 || universe > 63999) {
    throw new RangeError('universe should be in the range [1-63999]');
  }
  return '239.255.' + (universe >> 8) + '.' + (universe & 0xff);
}

module.exports.Packet = Packet;
module.exports.getMulticastGroup = getMulticastGroup;
