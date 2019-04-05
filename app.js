var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');



var app = express();

/////////////////////////////////////////////////////////////////
//WECHATY START
const { Wechaty } = require('wechaty')
const { PuppetPadpro  } = require('wechaty-puppet-padpro');
const WECHATY_PUPPET_PADPRO_TOKEN = 'puppet_padpro_4ebbd3d8fe7ebbc1';

const puppet = new PuppetPadpro({
  token: WECHATY_PUPPET_PADPRO_TOKEN,
})

global.bot = new Wechaty({
  name:'pad-roombot',
  puppet,
})

// 设置完成
// 运行 wechaty

global.wechatyQr = '';

global.bot
.on('scan', (qrcode, status) => {
  require('qrcode-terminal').generate(qrcode, { small: true });  // show qrcode on console

  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')
  global.wechatyQr = qrcodeImageUrl;


  console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`);
})
.on('login',            user => {
  console.log(`User ${user} logined`)  

})

.on('message', async function (message) {
  //console.log(`Message: ${message.from()}`)

  if (message.text() === 'create') {
    
    console.log(message.text());
    const helperContactB = await bot.Contact.find({ name: 'CY' })

    if(helperContactB)
    {
      console.log('CY found')
      const room = await bot.Room.find({topic:'test'});//'澳洲西北同乡会(布村)'})
      if(room)
      {
        await room.add(helperContactB);
        console.log('adding member to the room')
      }
      else{
        console.log('unable to find room')
      }
    }

    else{
      console.log('fucked');
    }


    //console.log('creating room...');    
    // const room = await bot.Room.create([message.from(),helperContactB]);
    // await room.sync();
    // await room.topic('group created');
    // await room.say('Created');


  }
})
.on('ready', async () =>  {
  console.log('ready')
  const allRooms = await bot.Room.findAll()
  // Then do whatever you want to do

  const helperContactB = await bot.Contact.find({ name: 'CY' })

  if(helperContactB)
  {
    console.log('CY found')
    const room = await bot.Room.find({topic:'ding'});//'澳洲西北同乡会(布村)'})
    if(room)
    {
      await room.add(helperContactB);
      console.log('adding member to the room')
    }
    else{
      console.log('unable to find room, try again')
      room = allRooms.find(x=>x.payload.topic && x.payload.topic.includes('ding'));
      if(room)
      {
        await room.add(helperContactB);
      }
      
    }
  }

  else{
    console.log('fucked');
  }

})
.start().then(() => 
{      
  console.log('Starter Bot Started.')
})
.catch(e => console.error(e));

//WECHATY END

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.env.PORT || 80;

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});

module.exports = app;
