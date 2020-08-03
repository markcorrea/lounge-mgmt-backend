const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { getSecret } = require('./secrets');
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');
const ticketsRoute = require('./routes/tickets');
const clientsRoute = require('./routes/clients');
const rolesRoute = require('./routes/roles');
const routesRoute = require('./routes/routes');
const terminalsRoute = require('./routes/terminals');
const cashiersRoute = require('./routes/cashiers');
const ordersRoute = require('./routes/orders');
const menusRoute = require('./routes/menus');

mongoose.Promise = global.Promise;
mongoose.connect(getSecret('dbUri')).then(
  () => {
    console.log('Connected to mongoDB');
  },
  (err) => console.log('Error connecting to mongoDB', err)
);

const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 3000;

app.use(function (req, res, next) {
  let allowedOrigins = [
    'http://127.0.0.1:8020',
    'http://localhost:8020',
    'http://127.0.0.1:9000',
    'http://localhost:9000',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'https://kanova.netlify.app',
    'https://kanovabeer.netlify.app',
    'https://beerball.netlify.app',
    'https://loungemgmt.netlify.app',
  ];
  let origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,HEAD,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, token');
  next();
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  socket.emit('tickets', { hello: 'world' });
});

app.set('socketio', io);

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/users', usersRoute);
app.use('/api/products', productsRoute);
app.use('/api/tickets', ticketsRoute);
app.use('/api/clients', clientsRoute);
app.use('/api/roles', rolesRoute);
app.use('/api/routes', routesRoute);
app.use('/api/terminals', terminalsRoute);
app.use('/api/cashiers', cashiersRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/menus', menusRoute);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app };
