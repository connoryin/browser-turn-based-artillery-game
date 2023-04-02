### Quick Start
1. In the root directory, do `npm install` and then `npm start`
2. `cd client`, then do the same thing (`npm install` and `npm start`)
3. Open 2 different browsers, such as a chrome and an edge. It seems that chromes with 2 different accounts also work.
4. Enjoy the game!

### Architecture
1. I used `Node.js` as the backend, `React` as the front end, and `socket.io` library for the communication between the frontend and the backend.
2. When a browser first connects to the server, it saves its socket ID to its `localStorage`. The server attach the user to either an existing game or a new game, and stores the socket ID and the socket object.
3. When a browser disconnects and then reconnects, it will first find that a socket ID is already in the `localStorage`. It will then create a new socket, but send the connection request along with the old socket ID so that the server will know which game to connect it to. The server then replace the old socket associated with the user with the new one.
4. When a user fires, he will notify the server. The server can then find out the socket of the opponent and send the angle and velocity to him, so that he can see the animation and know when he can fire. The server also stores the info of whose turn it is now so that the users can know about this after reconnection.
5. When a user wins, the server also stores that info to show to users who reconnect.
6. After the game is end, the `localStorage` will be cleared so that if the users reconnects they can be attached to a new game.
7. I will skip the description of the frontend because it is relatively simple and mostly related to math.

### Why use socket.io
Socket.io allows real-time communication between the server and client, which is essential for a game where player actions need to be immediately reflected on the other player's screen. It allows bidirectional through sockets without the client having to continuously request it. This eliminates the need for constant polling and reduces network traffic, which is important for reducing latency.

### Why use React
React, on the other hand, provides a component-based approach to building user interfaces. This allows for easy organization and management of the various elements that make up the game interface. React also provides a way to handle state changes and updates efficiently with the "useEffect" hook, which is also significant for reducing latency.




