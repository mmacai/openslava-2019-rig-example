const randomString = () => {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
};

export const registerAsync = data => {
  return fetch('/api/rs/register', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
};

export const registerSync = data => {
  return fetch('/api/rs/register/sync', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
};

export const ackRegistration = data => {
  return fetch('/api/kafka', {
    method: 'POST',
    body: JSON.stringify({
      id: randomString(),
      type: 'com.openslava.registration.acknowledged',
      time: new Date().toISOString(),
      specversion: '0.2',
      source: '/frontend',
      contenttype: 'application/json',
      rig: {
        target_partition: randomString()
      },
      data
    }),
    headers: { 'Content-Type': 'application/json' }
  });
};
