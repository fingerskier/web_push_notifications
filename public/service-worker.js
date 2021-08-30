self.addEventListener('push', function(event) {
  event.waitUntil(self.registration.showNotification('Push Notification', {
    body: 'Subscribed Notification'
  }));
});


self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Subscription expired');

  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
    .then(function(subscription) {
      console.log('Subscribed after expiration', subscription.endpoint)

      return fetch('notify/register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });
    })
  );
});