let subscriptionButton


function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


function subscribe() {
  navigator.serviceWorker.ready
  .then(async function(registration) {

    const response = await fetch('notify/vapidPublicKey');
    const vapidPublicKey = await response.text();

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  })
  .then(function(subscription) {
    console.log('Subscribed', subscription.endpoint);
    
    return fetch('notify/register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription
      })
    });
  })
  .then(setUnsubscribeButton);
}


function unsubscribe() {
  navigator.serviceWorker.ready
  .then(function(registration) {
    return registration.pushManager.getSubscription();
  })
  .then(function(subscription) {
    return subscription.unsubscribe()
      .then(function() {
        console.log('Unsubscribed', subscription.endpoint);
        
        return fetch('notify/unregister', {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            subscription: subscription
          })
        });
      });
  })
  .then(setSubscribeButton);
}


function setSubscribeButton() {
  console.log('subscribing')

  subscriptionButton.onclick = subscribe;
  subscriptionButton.textContent = 'Subscribe!';
}


function setUnsubscribeButton() {
  console.log('unsubscribing')

  subscriptionButton.onclick = unsubscribe;
  subscriptionButton.textContent = 'Unsubscribe!';
}


window.addEventListener('load', event=>{
  subscriptionButton = document.getElementById('subscribe')
  navigator.serviceWorker.register('service-worker.js');


  navigator.serviceWorker.ready
  .then(function(registration) {
    console.log('service worker registered');
    subscriptionButton.removeAttribute('disabled');
  
    return registration.pushManager.getSubscription();
  })
  .then(function(subscription) {
    if (subscription) {
      console.log('Already subscribed', subscription.endpoint);
      setUnsubscribeButton();
    } else {
      setSubscribeButton();
    }
  })
})