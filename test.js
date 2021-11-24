const ACNSender = new require('./../stagehack-sACN').Sender;
const ACNReceiver = require('./../stagehack-sACN').Receiver;

ACNSender.Start();
ACNReceiver.Start();

Test0();

function Test0(){
  var test0send = new ACNSender.Universe();
  test0send.on('ready', function () {
    console.log(this.getPossibleInterfaces());
    console.log('');
    test0send.close();
    Test1();
  });
}

function Test1(){
  var test1send = new ACNSender.Universe();
  test1send.on('ready', function () {
    this.send([255, 0, 0, 255]);
  });

  var test1receive = new ACNReceiver.Universe();
  test1receive.begin();
  test1receive.on('packet', function (packet) {
    console.log('Test 1');
    test(test1send.toString(), test1receive.toString());
    test1send.close();
    Test2();
  });
}

function Test2(){
  var test2send = new ACNSender.Universe(2, 50);
  test2send.on('ready', function () {
    this.send([255, 255, 0, 0, 0, 0, 140]);
  });

  var test2receive = new ACNReceiver.Universe(2);
  test2receive.begin();
  test2receive.on('packet', function (packet) {
    console.log('Test 2');
    test(test2send.toString(), test2receive.toString());
    test2send.close();
    Test3();
  });
}

function Test3(){
  var test3send = new ACNSender.Universe(3);
  test3send.on('ready', function () {
    this.send({ 1: 255, 3: 120, 512: 255 });
  });

  var test3receive = new ACNReceiver.Universe(3);
  test3receive.begin();
  test3receive.on('packet', function (packet) {
    console.log('Test 3');
    test(test3send.toString(), test3receive.toString());
    test3send.close();
    Test4();
  });
}

function Test4(){
  var test4send = new ACNSender.Universe(4);
  test4send.on('ready', function () {
    this.send([1, 2, 3, 4]);
  });

  var lastTimestamp = 0;
  var test4receive = new ACNReceiver.Universe(4);
  test4receive.begin();
  test4receive.on('packet', function (packet) {
    if(packet._sequence==1){
      console.log('Test 4 - Interval');
      lastTimestamp = Date.now();
    }else if(packet._sequence==6){
      console.log('\x1b[32m%s\x1b[0m', 'PASS');
      console.log('');
      test4send.close();
      Test5();
    }else{
      console.log(packet._sequence + ' ' + (Date.now()-lastTimestamp) + 'ms');
      lastTimestamp = Date.now();
    }
  });
}

function Test5(){
  ACNSender.Start({interfaces: ['127.0.0.1'], type: 'unicast'});
  var test5send = new ACNSender.Universe(5);
  test5send.on('ready', function () {
    console.log('Test 5 - Unicast');
    this.send([1, 2, 3, 4, 5, 6, 7]);
  });

  var test5receive = new ACNReceiver.Universe(5);
  test5receive.begin();
  test5receive.on('packet', function (packet) {
    test(test5send.toString(), test5receive.toString());
    test5send.close();
    Test6();
  });
}

function Test6(){
  ACNSender.Start();
  var test6send = new ACNSender.Universe(6);
  test6send.on('ready', function () {
    console.log('Test 6 - Start Code');
    this.send([0, 255, 0, 255]);
  });

  var test6receive = new ACNReceiver.Universe(6);
  test6receive.begin();
  test6receive.on('packet', function (packet) {
    test(test6send.toString(), test6receive.toString());
    process.exit(1);
  });
}


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
    errors.push('Packet Sequence Error (' + send.Packet.Sequence + ' vs ' + receive.Packet.Sequence + ')');
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
