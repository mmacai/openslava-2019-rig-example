export class Sse {
  connect(setLogs) {
    this.setLogs = setLogs;
    this.registeredListeners = [];

    try {
      this.eventStream = new EventSource('http://localhost:4000/_rig/v1/connection/sse');

      this.eventStream.onopen = e => this.log('open', e);
      this.eventStream.onmessage = e => this.log('message', e);
      this.eventStream.onerror = e => this.log('error', e);

      this.eventStream.addEventListener('rig.connection.create', e => {
        const cloudEvent = JSON.parse(e.data);
        const payload = cloudEvent.data;
        this.connectionToken = payload['connection_token'];
        this.log('_connection_created', e);
      });
    } catch (error) {
      this.log('_connection_error', error);
    } finally {
      return this;
    }
  }

  log = (type, data) => {
    this.setLogs(previousLogs => [{ type, data }, ...previousLogs]);
  };

  async createSubscriptions(subscriptions) {
    try {
      const response = await fetch(
        `http://localhost:4000/_rig/v1/connection/sse/${this.connectionToken}/subscriptions`,
        {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({
            subscriptions
          })
        }
      );

      if (!response.ok) {
        throw Error(response.statusText);
      }

      this.log('_subscriptions_created', response);
      return response;
    } catch (error) {
      this.log('_subscriptions_error', error);
    }
  }

  listenForMessage(eventType, cb) {
    if (this.registeredListeners.includes(eventType)) {
      this.log('_listener_already_created', eventType);
      return;
    }

    this.registeredListeners.push(eventType);

    this.eventStream.addEventListener(eventType, ({ data }) => {
      const message = JSON.parse(data);
      this.log('_listener_created', eventType);
      this.log(eventType, message);
      cb(message);
    });
  }

  // disconnect(cb) {
  //   // Close SSE connection
  //   this.es.close();
  //   // cb('None');
  // }
}

export default new Sse();
