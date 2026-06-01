const DEFAULT_NOTIFICATION_URL = "/notifications";

function toAbsoluteUrl(targetUrl) {
  try {
    return new URL(targetUrl, self.location.origin).toString();
  } catch {
    return new URL(DEFAULT_NOTIFICATION_URL, self.location.origin).toString();
  }
}

self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || "Fircle";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: "/icon.svg",
    badge: "/favicon.ico",
    data: {
      url: payload.url || DEFAULT_NOTIFICATION_URL,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = toAbsoluteUrl(event.notification.data?.url || DEFAULT_NOTIFICATION_URL);

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientsList) {
        if ("focus" in client) {
          const focusedUrl = new URL(client.url);

          if (focusedUrl.origin === self.location.origin) {
            await client.focus();
            if ("navigate" in client) {
              await client.navigate(targetUrl);
            }
            return;
          }
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});