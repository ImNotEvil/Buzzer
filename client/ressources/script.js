var es = new EventSource('/sse');
var id = sessionStorage.getItem('id');
var pseudo = sessionStorage.getItem('pseudo');

if (id == null || id == "" || pseudo == null || pseudo == "") {
    var pseudo = prompt("Quel est ton pseudo ?", "Manuel Ferrara");
    if (pseudo == null || pseudo == "") {
        document.location.reload();
    } else {

        id = Math.random().toString(36).substring(2, 15) + Date.now() + Math.random().toString(36).substring(2, 15);
		sessionStorage.setItem('id',id);
		sessionStorage.setItem('pseudo',pseudo);
	}
}
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        actualize(JSON.parse(xhttp.responseText));
    }
};
xhttp.open("POST", "add_player" + '?id=' + id + "&pseudo=" + pseudo, true);


xhttp.send();
es.addEventListener('RAZ', function(event) {
	sessionStorage.clear();
})
es.addEventListener('UPDATE', function(event) {
	actualize(JSON.parse(event.data));
});
es.addEventListener('BUZZ', function(event) {
    console.log(JSON.parse(event.data));
	update_main_text("BUZZZZZZ");
	document.getElementById("buzzer").disabled = true;
	console.log("pause ON");
});
function buzz() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
        }
    };
    xhttp.open("POST", "buzz?id=" + id + "&date=" + Date.now(), true);
    xhttp.send();
}
function fill_joueur(i,pseudo,score){
	return (`<div class="col-sm-3 col-xs-12">
		<div class="panel panel-default text-center">
			<div class="panel-heading">
				<h3>${pseudo}</h3>
			</div>
			<div class="panel-body">
				<p>Position : <strong>${i+1}</strong></p>
				<p>Score : <strong>${score}</strong></p>
			</div>
		</div>
	</div>`)
}
function update_main_text(text){
	document.getElementById('main_text').innerHTML = text;
}
function actualize(obj){
	if (obj.pause){
		update_main_text("BUZZZZZZ");
		document.getElementById("buzzer").disabled = true;
		console.log("pause ON");
	}
	else {
		update_main_text("QUESTION EN COURS");
		document.getElementById("buzzer").disabled = false;
		console.log("pause OFF");
	}
	var tab = []
    Object.keys(obj.players).forEach(function(k, v) {
		tab.push( {'id' : k, 'points' : obj.players[k].points, 'pseudo' : obj.players[k].pseudo })
		//var obj2 = obj.players[k];
		//console.log(obj2)
    });
	var el = document.getElementById('classement')
	el.innerHTML = '';
	tab.sort( (a, b) => a.points - b.points).reverse().forEach((item, i) => {
		el.innerHTML += fill_joueur(i,item.pseudo,item.points)
	});
	if (obj.quibuzz.length > 0 ){
		var first = obj.quibuzz.sort((a, b) => a.date - b.date).reverse()[0];
		document.getElementById('sub_text').innerHTML = `<strong>${first.pseudo}</strong> a buzzé` ;
	}
	else {
		document.getElementById('sub_text').innerHTML = "" ;
	}
}
