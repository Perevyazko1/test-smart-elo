/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'my-cache';
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                `/`,
                `/index.html`,
                `static/js/bundle.js`
            ])
                .then(() => self.skipWaiting())
        })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Закрытие уведомления

    const action = event.action;

    if (action === 'open') {
        const url = event.notification.data.url;

        event.waitUntil(
            self.clients.matchAll({type: 'window'}).then(clientsArr => {
                // Ищем окно, которое уже открыто, и переходим на нужную страницу
                const client = clientsArr.find(
                    client => client.url.startsWith(
                        'http://localhost:3000/' || 'https://elo.szmk.pro'
                    ));

                if (client) {
                    // Если окно уже открыто, переходим на нужную страницу в этом окне
                    client.focus();
                    client.navigate(url);
                } else {
                    // Если окно не открыто, открываем новое
                    self.clients.openWindow(url);
                }
            })
        );
    } else if (action === 'dismiss') {
        console.log('Notification dismissed');
    } else {
        self.clients.openWindow('/'); // Открытие URL по умолчанию
    }
});
