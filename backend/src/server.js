import { createApp } from './app.js';
import { Messages } from './enums/Messages.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(Messages.INVALID_PORT);
}

const server = createApp().listen(port, () => {
    console.log(`${Messages.SERVER_STARTED} http://localhost:${server.address().port}/products`);
});