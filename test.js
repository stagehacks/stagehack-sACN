const ACNSender = require('./../stagehack-sACN').Sender;
const ACNSync = require('./../stagehack-sACN').Sync;
const ACNReceiver = require('./../stagehack-sACN').Receiver;

ACNSender.Start();
ACNSync.Start();
ACNReceiver.Start();

var test0send = new ACNSender.Universe();
test0send.on('ready', function () {
  console.log(this.getPossibleInterfaces());
  console.log('');
});

var test0sync = new ACNSync.Universe();
test0sync.on('ready', function () {
  console.log(this.getPossibleInterfaces());
  console.log('');
});

var test1send = new ACNSender.Universe();
test1send.on('ready', function () {
  this.send([255, 0, 0, 255]);
});

var test1receive = new ACNReceiver.Universe();
test1receive.on('packet', function (packet) {
  console.log('Test 1');
  test(test1send.toString(), test1receive.toString());
});

var test2send = new ACNSender.Universe(2, 50);
test2send.on('ready', function () {
  this.send([255, 255, 0, 0, 0, 0, 140]);
});

var test2receive = new ACNReceiver.Universe(2);
test2receive.on('packet', function (packet) {
  console.log('Test 2');
  test(test2send.toString(), test2receive.toString());
});

var test3send = new ACNSender.Universe(3);
test3send.on('ready', function () {
  this.send({ 1: 255, 3: 120, 512: 255 });
});

var test3receive = new ACNReceiver.Universe(3);
test3receive.on('packet', function (packet) {
  console.log('Test 3');
  test(test3send.toString(), test3receive.toString());
});

const ACNSenderInterface = require('./../stagehack-sACN').Sender;
ACNSenderInterface.Start({
  interface: '192.168.0.40'
});

function test(send, receive) {
  var errors = [];
  if (send.Universe != receive.Universe) {
    errors.push('Universe Error');
  }
  if (send.Packet.Universe != receive.Packet.Universe) {
    errors.push('Packet Universe Error');
  }
  if (send.Packet.Priority != receive.Packet.Priority) {
    errors.push('Packet Priority Error');
  }
  if (send.Packet.Sequence != receive.Packet.Sequence) {
    errors.push('Packet Sequence Error');
  }
  if (send.Packet.Source != receive.Packet.Source) {
    errors.push('Packet Source Error');
  }
  if (send.Packet.Slots != receive.Packet.Slots) {
    errors.push('Packet Slots Error');
  }

  if (errors.length == 0) {
    console.log('\x1b[32m%s\x1b[0m', 'PASS');
  } else {
    console.log('\x1b[31m%s\x1b[0m', 'ERRORS: ' + errors.join(', '));
  }
  console.log(receive.Packet.Slots);
  console.log('');
}
