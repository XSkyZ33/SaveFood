const connection = require('./connect');

const http = require('http')

const hostname = process.env.HOST || '127.0.0.1'; // local server​
const port = process.env.PORT || 3000; // port to listen to 

server.listen(port, hostname, () => {
    // print message in server terminal​
    console.log(`Node server running on http://${hostname}:${port}/`);
});