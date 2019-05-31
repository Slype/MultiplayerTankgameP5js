class Scoreboard {
	constructor(scoreboardElem){
		this.players = [];
		this.elem = scoreboardElem;
	}

    // Call to add a player to the scoreboard
	addPlayer(id, name, elo, c = "#ffffff"){
		this.players.push({
			id: id,
			name: name,
			elo: elo,
			color: c,
			kills: 0,
			killstreak: 0,
			deaths: 0
		});
	}

    // Call to remove a player from the scoreboard
	removePlayer(id){
        // Find it in the list and pop it
		for(let i = 0;i < this.players.length;i++){
			if(this.players[i].id == id){
				this.players.splice(i, 1);
				break;
			}
		}
	}

    // Returns a player's object with a given id
	getPlayer(id){
        // Find it in the list and return it
		for(let player of this.players){
			if(player.id == id)
				return player;
		}
	}

    // Updates a player with a given id and an object
	updatePlayer(id, obj){
        // Find player in the list
		for(let player of this.players){
			if(player.id == id){
                // Override all properties passed in
				for(let key in obj){
					player[key] = obj[key];
				}
				break;
			}
		}
	}

    // Call to update scoreboard with a player kill
	playerKill(killerID, victimID){
		let killer = this.getPlayer(killerID);
		let victim = this.getPlayer(victimID);
        // Assign the kill and death respectively
		killer.kills++;
		killer.killstreak++;
		killer.elo += killer.killstreak * tankSettings["defaultElo"] * 0.1;
		victim.deaths++;
		victim.killstreak = 0;
        // Update the scoreboard element
		this.updateElements();
	}

    // Returns the player list as a sorted list
	getSortedList(){
		let players = this.players.slice();
		let sorted = [];
		let highestElo = 0
		let highestIndex = 0;
        // Sort the list based on elo
		while(players.length > 0){
			for(let i = 0;i < players.length;i++){
				if(players[i].elo > highestElo){
					highestElo = players[i].elo;
					highestIndex = i;
				}
			}
			sorted.push(players.splice(highestIndex, 1)[0]);
			highestElo = 0;
			highestIndex = 0;
		}
		return sorted.slice();
	}

    // Updates the scoreboard element
	updateElements(){
		let players = this.getSortedList();
		this.elem.innerHTML = "";
		let count = 1;
		for(let player of players){
			let row = document.createElement("DIV");
			row.className = "row";
			let p1 = document.createElement("P");
			let b = document.createElement("B");
			b.innerText = count + ". ";
			p1.appendChild(b);
			p1.innerText = player.name;
			p1.style.color = player.color;
			let p2 = document.createElement("P");
			p2.innerText = Math.floor(player.kills);
			row.appendChild(p1);
			row.appendChild(p2);
			this.elem.appendChild(row);
			count++;
		}
	}
}
