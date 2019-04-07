
var FileBox = require('file-box');
var express = require('express');
var router = express.Router();
const { Wechaty } = require('wechaty')

const sleep = (milliseconds) => {
  return new Promise(async resolve => setTimeout(resolve, milliseconds), (err) => {
    console.log('sleep error: ' + err);
  })
}

async function delayedMessage(room) {
  if (room.payload.topic) {
    console.log('processed room: ' + room.payload.topic)

    await sleep(3000).then(() => {

      return new Promise(async (resolve, reject) => { // <--- this line
        try {
          await room.say(globalAdText);
          return resolve();
        } catch (error) {
          return reject(error);
        }
      }).catch((err) => {
        console.log('handle reject: ' + err);
      });
    });

    await sleep(500).then(() => {

      return new Promise(async (resolve, reject) => { // <--- this line
        try {
          const fileBox2 = FileBox.FileBox.fromFile(globalImagePath)
          await room.say(fileBox2);
          return resolve();
        } catch (error) {
          return reject(error);
        }
      }).catch((err) => {
        console.log('handle reject: ' + err);
      });;
    });



    // const contactCard = await bot.Contact.find({alias: 'Cotica- H&T  Melbourne'})
    // await room.say(contactCard)
  }
  else {
    console.log('unable to process room: ' + room.payload.topic)
  }

}


async function initRoom() {
  console.log('begin to initRoom!')
  var maxCallAtempt = 1;
  var currentAttempt = 0;
  const MAX_ROOM_ = 80;

  var roomList = [];

  roomList = await bot.Room.findAll();


  while (roomList.length < MAX_ROOM_ && currentAttempt <= maxCallAtempt) {

    console.warn(`room num not ready. retry after 5 seconds. room num: ${roomList.length}. current attempt: ${currentAttempt}`)
    await sleep(5000).then(() => {

      return new Promise(async (resolve, reject) => { // <--- this line
        try {
          roomList = await bot.Room.findAll();
          return resolve(roomList);
        } catch (error) {
          return reject(error);
        }
      });
    });
    currentAttempt++;
  }
  console.log('end getting rooms, found: ' + roomList.length);
  return roomList
}

async function broadcast() {

  var roomList = await initRoom();                   // get the room list of the bot
  console.log('room count: ' + roomList.length);
  var list = roomList.sort();
  for (var room of list) {
    await delayedMessage(room);
  }


  //console.log('current index: ' + msgsentCount);


  //const promises = roomList.map(delayedMessage);
  // wait until all promises are resolved
  //await Promise.all(promises);




  console.log('Done!');



}
async function broadcastTest() {
  //const room = await bot.Room.find({ topic: 'test' });

  for (step = 0; step < 50; step++) {
    console.log(step);
    await delayedMessageErr();
  }

  // try {
  //   const contactCard2 = await bot.Contact.find({ name: 'Cotica- H&T  Melbourne' });
  //   var name = contactCard2.name()
  //   await room.say(contactCard2)
  // }
  // catch (err) {
  //   console.log(err);

  // }


}

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: '群发助手', qrcode: wechatyQr });
});
router.post('/rooms', async function (req, res, next) {
  var all = await initRoom();

  const results = all.map(async (obj) => { return await obj.topic(); });
  // document.writeln( `Before waiting: ${results}`);

  Promise.all(results).then((completed) => {
    res.send(completed);
  }
  );


});

router.post('/bulkInvite', async function (req, res, next) {
  var allrooms = await initRoom();

  var myContact = await bot.Contact.find({ name: '姜恒' })
  
  if (myContact) {
    console.log('found the contact')        
    
    var index = 0;

    for (var aRoom of allrooms) {
      try {

        if(index<5)
        {
          await sleep(3000).then(() => {

            return new Promise(async (resolve, reject) => { // <--- this line
              try {
                var tp = await aRoom.topic();
                console.log('adding to the room.. ' + myContact.name() + ' ' + tp )
                await aRoom.add(myContact)
                console.log('done adding member');
  
                return resolve();
              } catch (error) {
                return reject(error);
              }
            }).catch((err) => {
              console.log('handle reject: ' + err);
            });
          });
        }
        index++;

    

        
      }
      catch (err) {
        console.log('error in adding ppl to room' + err)
      }

    }
    
  }
  else{
    console.log('found no member') 
  }

  res.send('done');




});


router.post('/members', async function (req, res, next) {
  const room = await bot.Room.find({ topic: 'test' });
  var allMembers = await room.memberAll();

  // for(var somebody in allMembers)
  // {
  //   console.log(somebody.name())
  //   //await somebody.sync();
  // }

  const results = allMembers.map( (obj) => { return   obj.name(); });

  for(var someId in results)
  {
    somebody = await bot.Contact.load(someId);
    console.log(somebody.name()); 
  }

  res.send(results)
});



router.get('/membersFoceSync', async function (req, res, next) {
  var aTopic = req.query.topic;
  const room = await bot.Room.find({ topic: aTopic });
  
  //sync anyway to ensure the latest 
  console.log('getting the room ready')
  await room.sync();
 
  var allMembers = await room.memberAll();

  // for(var somebody in allMembers)
  // {
  //   console.log(somebody.name())
  //   //await somebody.sync();
  // }
  var results = [{roomId: room.payload.id}];
 for (var aMember of allMembers )
 {
   if(!aMember.isReady())
   {
     'a member is getting ready yet';
     await aMember.sync();
   }
   results.push({
     wxid: aMember.payload.id,
     name: aMember.name(),
     gender : aMember.gender(),
     province : aMember.province(),
     city: aMember.city()
   })

 }

  res.send(results)
});


router.get('/guess', async function (req, res, next) {
  
  var _id = req.query.id;
  console.log('wxid: ' +_id);

  var somebody = await bot.Contact.load(_id);
  if(!somebody.isReady())
  {
    console.log('somebody is not ready')
    await somebody.sync();
  }
  res.send(somebody.name())
});

router.get('/me', async function (req, res, next) {
  
  var selfId = bot.userSelf();
  
  
  console.log(selfId.payload.id +  ' ' + self.name());
  

  res.send(selfId.id)
});


router.get('/friends', async function (req, res, next) {
  
  const contactList = await bot.Contact.findAll()  
  console.log(contactList.length  +  ' contacts found');

  var friendList = [];
  contactList.forEach(contact => {
    if(contact.friend()  && contact.type() == bot.Contact.Type.Personal)
    
    {
      console.log('found a friend ' + contact.name())
      friendList.push(contact);
    }
    else{
      console.log('found a stranger ' + contact.name())
    }
  });

  //const friendList = contactList.filter(contact => !!contact.friend())
  var friends = friendList.map(x=> ({
    wxid: x.payload.id, 
    name: x.name(),
    gender : x.gender(),
    province : x.province(),
    city: x.city()
    
  }) );

  res.send(friends)
});

router.post('/friend', async function (req, res, next) {
  
  var _id = req.body.id;
  console.log('wxid: ' +_id);

  var somebody = await bot.Contact.load(_id);
  if(!somebody.isReady())
  {
    console.log('somebody is not ready')
    await somebody.sync();
  }

  await bot.Friendship.add(somebody, '小号')
  res.send(somebody.name())
});
router.post('/poke', async function (req, res, next) {
  const room = await bot.Room.find({ topic: 'test'});//'澳洲西北同乡会(布村)' });
  //var contactCard = await bot.Contact.find({ alias: 'MyBeauty' }) // change 'lijiarui' to any of the room member


  //await room.add(contactCard);
  if (room) {
    var allMembers = await room.memberAll();

    console.log('found ' + allMembers.length)
    for (var member of allMembers) {
      if (!member.friend()) {

        

        await sleep(2000).then(() => {

          return new Promise(async (resolve, reject) => { // <--- this line
            try {
              console.log('found a stranger: ' + member.name())
              await bot.Friendship.add(member, 'hello!')
              console.log('done adding a friend')
              return resolve();
            } catch (error) {
              return reject(error);
            }
          });
        });
        
      }


    }



  }
  else{
    console.log('found no room')
  }

  res.send('completed')

})


module.exports = router;
