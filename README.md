# Chatflare
A simple chat app, running on some small VM in a Cloudflare server tower nearby

## How It Works

Users are assigned their own chat room when they first visit the page, and can talk to others by sharing their room name. When someone joins the chat room, a WebSocket connection is opened with a [Durable Object](https://developers.cloudflare.com/durable-objects/) that stores and synchronizes the chat history.

The Durable Object instance that manages the chat room runs in one location, and handles all incoming WebSocket connections. Chat messages are stored and retrieved using the [Durable Object SQL Storage API](https://developers.cloudflare.com/durable-objects/api/sql-storage/). When a new user joins the room, the existing chat history is retrieved from the Durable Object for that room. When a user sends a chat message, the message is stored in the Durable Object for that room and broadcast to all other users in that room via WebSocket connection. This template uses the [PartyKit Server API](https://docs.partykit.io/reference/partyserver-api/) to simplify the connection management logic, but could also be implemented using Durable Objects on their own.

<!-- dash-content-end -->


## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```
2. Deploy the project!
   ```bash
   npx wrangler deploy
   ```
3. Monitor your worker
   ```bash
   npx wrangler tail
   ```
