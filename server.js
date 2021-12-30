var SSE = require('express-sse');
var express = require("express");
var app = express();
var request = require('request')
const fs = require('fs');
var sse = new SSE();





var id_admin = "tibolebot"//"7opsohlz6za385qzw10meovqz7h34x4785h0jecj90pbfzc41rg9i"//Array.from('1'.repeat(5), x => Math.random().toString(36).substring(2, 15)).join('');

var information = {
    "pause": true,
    "players_id": [],
    "players": {},
    "quibuzz": []
};

sse.updateInit(information);


function update_sse() {
    sse.updateInit(information);
    sse.send(information, 'UPDATE');
}


app.use('/ressources', express.static(__dirname + '/client/ressources'));

app.get('/sse', (req, res, next) => {
  res.flush = () => {};
  next();
}, sse.init);


app.get("/", (req, res) => {
    console.log("/");
    res.sendFile(__dirname + "/client/client.html")
})
app.get(`/${id_admin}`, (req, res) => {
    console.log("/admin");
    res.sendFile(__dirname + "/client/admin.html")
})
app.post(`/${id_admin}/update`, (req, res) => {
    console.log("/update");
    var id = req.query.id;
    var valeur = parseInt(req.query.value);
    if (information.players_id.includes(id)) {
        information.players[id].points += valeur;
        update_sse();
    }
    res.send("update");
})

app.post(`/${id_admin}/pause`, (req, res) => {

    console.log("/pause");

    information.pause = true;

    update_sse();
    res.send("pause");
})
app.post(`/${id_admin}/resume`, (req, res) => {

    console.log("/resume");
    if (information.pause) {
        information.quibuzz = [];
        information.pause = false;
        update_sse();
    }
    res.send("resume");
})


app.post("/add_player", (req, res) => {

    console.log("/add_player");
    var id = req.query.id
    var pseudo = req.query.pseudo
    if (!information.players_id.includes(id)) {
        information.players_id.push(id);
        information.players[id] = {
            "pseudo": pseudo,
            "points": 0
        }
        update_sse();
    }
    res.send(information);
})

app.post("/buzz", (req, res) => {

    console.log("/buzz");

    var id = req.query.id
    var tempo = req.query.date
    if (information.players_id.includes(id)) {
        information.pause = true;
        information.quibuzz.push({
            'id': id,
            'pseudo': information.players[id].pseudo,
            'date': tempo,
            'score': information.players[id].points
        })
    }
    update_sse();
    sse.send("", 'BUZZ');
    res.send("buzz");
})


/////////////////////////////////////////////////////////////////////

app.listen(8080, () => {
    console.log("HTTP Server started on port 8080");
    console.log("id_admin : ", id_admin);
    sse.send("raz", 'RAZ');
})
