var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var shortid = require('shortid');

mongoose.connect('mongodb://userKST:XqkhALEqVH2uNy6G@mongodb/TIdatabase');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var admins = require('./routes/admins');
// Init App
//var app = express();

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)


var handlebars  = require('./helpers.js')(exphbs);
// View Engine
app.set('views', path.join(__dirname, 'views'));
//app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);
app.use('/admin', admins);

// Set Port

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
}
console.log(server_ip_address, server_port);
app.start(server_port, server_ip_address);





//var io = require('socket.io').listen(app.listen(3000));

var User = require('./models/user');
var image = require('./models/image');
var connections = {};


var presentation = io.on('connection', function (socket) {

  
  socket.emit('olloeh',{id: shortid.generate()});

  socket.on('hello',function(message){
    if(message.user ==='admin')
    {
      socket.broadcast.emit('admincast', {users: connections});
      //connections[socket.id] = message.user;
    }
    else
    {
    connections[socket.id] = message.user;
    socket.broadcast.emit('admincast', {users: connections});
    SendToUser(message.user);
    }
});

  socket.on('change-files', function(data){
    User.UpdateFiles(data.user,data.files);

    SendToUser(data.user)
    });

  socket.on('schedule-user', function(data){
    console.log('schedule-log');
    User.scheduleUser(data.user, data.start, data.stop, data.image);
  })

  socket.on('change-group',function(data){
    console.log('change-group',data.group, data.files);
    User.UpdateGroup(data.group, data.files);
  });

  socket.on('disconnect', function(message){
      console.log('Got disconnect!');
      delete connections[socket.id];
      socket.broadcast.emit('admincast', {users: connections});
  });

  function SendToUser(user)
  {
  User.getUserByUsername(user,function(err,ruser){
    image.GetAllImages(function(err,images){
      User.GetscheduleUsers(function(err,schedulesImages){
      for(var key in schedulesImages)
      {
        for(var kay in ruser.images)
        {
          if (ruser.images[kay] == schedulesImages[key].image)
          {
            ruser.images[kay] = {file: schedulesImages[kay].image, start:schedulesImages[kay].start, stop:schedulesImages[kay].stop};
          }
        }
      }
      //console.log(ruser);
      socket.broadcast.emit('data-change',{user:ruser});
      });
  });
  });
  }

  // Clients send the 'slide-changed' message whenever they navigate to a new slide.
  });