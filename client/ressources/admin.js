var pathname = window.location.pathname + "/";
var es = new EventSource('/sse');
var es_admin = new EventSource(pathname+"sse");

es_admin.onmessage = function(event) {
    var items = JSON.parse(event.data);
	var text = ""
	for (var key in items) {
		var value = items[key];
		text+=`<div class="btn-group btn-group-justified"><a class="btn btn-primary">${key.toUpperCase()}</a><a class="btn btn-success">${value.toUpperCase()}</a></div>`;
	}
	document.getElementById('information').innerHTML = text;
};



es.onmessage = function(event) {
    actualize(JSON.parse(event.data));
};

es.addEventListener('UPDATE', function(event) {
    actualize(JSON.parse(event.data));
});

es.addEventListener('BUZZ', function(event) {
    update_main_text("BUZZZZZZ");
});

function requete(commande) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
        }
    };
    xhttp.open("POST", pathname + commande, true);
    xhttp.send();
}

function update(id, value) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
        }
    };
    xhttp.open("POST", pathname + "update" + "?id=" + id + "&value=" + value, true);
    xhttp.send();
}

function actualize(obj) {
    console.log(obj)
    if (obj.pause) {
        update_main_text("BUZZZZZZ");
        console.log("pause ON");
    } else {
        update_main_text("QUESTION EN COURS");
        console.log("pause OFF");
    }
    var tab = []
    Object.keys(obj.players).forEach(function(k, v) {
        tab.push({
            'id': k,
            'points': obj.players[k].points,
            'pseudo': obj.players[k].pseudo
        })
        //var obj2 = obj.players[k];
        //console.log(obj2)
    });
    var el = document.getElementById('classement')
    el.innerHTML = '';
    tab.sort((a, b) => a.points - b.points).reverse().forEach((item, i) => {
        el.innerHTML += fill_joueur(i, item.pseudo, item.points, item.id)
    });
    if (obj.quibuzz.length > 0) {
        var first = obj.quibuzz.sort((a, b) => a.date - b.date).reverse()[0];
        document.getElementById('sub_text').innerHTML = `
		<div class="panel panel-default text-center">
				<div class="panel-heading">
					<h3>${first.pseudo}</h3>
				</div>
				<div class="panel-body">
					<p>Score : <strong>${obj.players[first.id].points}</strong></p>
				</div>
				<div class="panel-footer">
				<div class="btn-group btn-group-justified">
				  <a type="button" onclick="update('${first.id}',-1)" class="btn btn-xs">-1</a>
				  <a type="button" onclick="update('${first.id}',+3)" class="btn btn-xs">+3</a>
				  <a type="button" onclick="update('${first.id}',+1)" class="btn btn-xs">+1</a>
				</div>
	        	</div>
			</div>
			`;
    } else {
        document.getElementById('sub_text').innerHTML = "";
    }
}

function update_main_text(text) {
    document.getElementById('main_text').innerHTML = text;
}

function fill_joueur(i, pseudo, score, id) {
    return (`<div class="col-sm-3 col-xs-12">
		<div class="panel panel-default text-center">
			<div class="panel-heading">
				<h3>${pseudo}</h3>
			</div>
			<div class="panel-body">
				<p>Position : <strong>${i+1}</strong></p>
				<p>Score : <strong>${score}</strong></p>
			</div>
			<div class="panel-footer">
				<div class="btn-group btn-group-justified">
				  <a type="button" onclick="update('${id}',-1)" class="btn btn-xs">-1</a>
				  <a type="button" onclick="update('${id}',+3)" class="btn btn-xs">+3</a>
				  <a type="button" onclick="update('${id}',+1)" class="btn btn-xs">+1</a>
				</div>
        	</div>
		</div>
	</div>`)
}
