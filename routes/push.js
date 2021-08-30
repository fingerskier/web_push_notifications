const express = require('express');
const router = express.Router();

const webPush = require('web-push');


if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
    "environment variables. You can use the following ones:");
  console.log(webPush.generateVAPIDKeys());
  return;
}

webPush.setVapidDetails(
  process.env.HOST,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)


const subscriptions = {}

const pushIntervalMilliseconds = 2500


function sendNotification(subscription) {
  webPush.sendNotification(subscription)
  .then(function() {
    console.log('Push Application Server - Notification sent to ' + subscription.endpoint)
  })
  .catch(function() {
    console.log('ERROR in sending Notification, endpoint removed ' + subscription.endpoint)

    delete subscriptions[subscription.endpoint];
  })
}


setInterval(function() {
  // for testing purposes: we send a message to each subscriber
  Object.values(subscriptions).forEach(sendNotification)
}, pushIntervalMilliseconds);


router.get('/vapidPublicKey', async(req, res)=>{
  res.send(process.env.VAPID_PUBLIC_KEY);
})


router.post('/register', async(req, res)=>{
  var subscription = req.body.subscription;

  if (!subscriptions[subscription.endpoint]) {
    console.log('Subscription registered ' + subscription.endpoint)

    subscriptions[subscription.endpoint] = subscription
  }

  res.sendStatus(201)
})


router.post('/unregister', async(req, res)=>{
  var subscription = req.body.subscription;
  
  if (subscriptions[subscription.endpoint]) {
    console.log('Subscription unregistered ' + subscription.endpoint)

    delete subscriptions[subscription.endpoint]
  }

  res.sendStatus(201)
})


module.exports = router