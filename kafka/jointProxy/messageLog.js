class MessageLog {
    constructor(id, sendTime = new Date(), confirmedTime = null) {
      this.id = id;
      this.sendTime = sendTime;
      this.confirmedTime = confirmedTime;
    }

    toString() {
        if (this.receivedTime) {
          return `Message ID: ${this.id} sent at: ${this.sendTime} received at: ${this.receivedTime}`;
        } else {
          return `Message ID: ${this.id} sent at: ${this.sendTime} not received yet`;
        }
    }
}