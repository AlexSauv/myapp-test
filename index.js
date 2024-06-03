
const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
var io = require('socket.io');
const app = express();
const port = 3000

const client = new Client ({ 
host: 'localhost',
user: 'postgres',
password: '7649',
database: 'lg-users',
socketPath: "/Application/MAMP/tmp/postgres/postgres.sock"
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());


client.connect((err) => {
  if(err){
    console.error("Erreur de connection : "+err.stack)
    return;
  }
  else{
    console.log("Connexion réussi à la base de données")
  }
})

app.get('/chat', function(request,response){
  response.sendFile( __dirname  + '/chat.html');
});

app.get('/login', function(request,response){
  response.sendFile( __dirname  + '/index.html');
});
app.get('/signup', function(request,response){
  response.sendFile( __dirname  + '/inscription.html');
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const query = `INSERT INTO public.users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  client.query(query, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});


app.post('/login', (request, response) => {
  const {username, password} = request.body;

  if (username && password) {
    const query = `SELECT * FROM public.users WHERE username = ${username} AND password = ${password}`;
    client.query(query ,(err, results, fields) => {
    if (err) throw err;

    if (results.length > 0){
      request.session.loggedin = true;
      request.session.username = username;
      response.redirect('/');
    } else {
      response.send('Vos informations sont incorrects');
    }
    response.end();
    });
} else { response.send('Merci de renseigner un mail & mot de passe.');
  response.end();
  }
});

app.get('/', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome back, ' + request.session.username + '!');
	} else {
		res.send('Please login to view this page!');
	}
	response.end();
});

app.listen(port, () => {
  console.log(`Le serveur est en port: http://localhost:${port}`)
})

/*io.on('client', (socket) => {  
socket.on('chat message', (msg) => {    
console.log('message: ' + msg);  });});*/
