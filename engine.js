var currentRoom;
var inventory = {};
var mood = 'h';
var commandHistBack = [];
var commandHistForward = [];
var histCurrent = "";

$(document).ready(function(){
	currentRoom = gameData.rooms.dungeon;
	
	$(document).keypress(function(e){
		if (e.which == 13){
			parseCommand();
		}
	});
	$(document).keydown(function(e){
		if (e.which == 38){
			histBack();
		}else if (e.which == 40){
			histForward();
		}
	});
});

function startGame(){
	$('#game').fadeIn();
	$('#intro').fadeOut();
	$('body').css('background-color','#6680C2');
	redraw();
}

function histBack(){
	console.log('back');
	if(commandHistBack.length >0){
		if($('#mainInput')[0].value != "")
			commandHistForward.push($('#mainInput')[0].value);
			histCurrent = commandHistBack.pop();
		$('#mainInput')[0].value = histCurrent;
	}
}
function histForward(){
	console.log('forwared');
	if($('#mainInput')[0].value != "")
		commandHistBack.push($('#mainInput')[0].value);
	if(commandHistForward.length >0){
		histCurrent = commandHistForward.pop();
		$('#mainInput')[0].value = histCurrent;
	}else{
		$('#mainInput')[0].value = "";
	}
}
function parseCommand(){
	input = $('#mainInput')[0].value;
	if(commandHistForward.length>0){
		commandHistBack.push(histCurrent);
		commandHistBack = commandHistBack.concat(commandHistForward.reverse());
		commandHistForward = [];
	}
	if(input.trim()!=""){
		commandHistBack.push(input);
		$('#main').fadeIn();
	}else{
		$('#main').fadeOut();
	}	
	input = input.trim();
	$('#mainInput')[0].value = "";
	for(var key in gameData.parser.verbs){
		if(input.indexOf(key)>=0){
			if(gameData.parser.verbs[key].length==1){
				parameter = input.substring(key.length).trim();
				gameData.parser.verbs[key](parameter);
				return;
			}else{
				gameData.parser.verbs[key]();
				return;
			}
		}
	}
	$('#main').html("You can't "+input);
}

function redraw(){
	c.clearRect(0, 0, WIDTH, HEIGHT);
	c.drawImage(IMG[mood + '_' + currentRoom.name], 0, 0);
	$('body').css('background-color', MOOD_COLORS[mood]);
	
	for (var key in currentRoom.items){
	
		if (currentRoom.items[key].prop && currentRoom.items[key].prop.state)
			var state = '_' + currentRoom.items[key].prop.state;
		else
			var state = '';
		
		if (IMG[mood + '_' + key + state] && !currentRoom.items[key].prop.hidden)
			c.drawImage(IMG[mood + '_' + key + state], currentRoom.items[key].pos.x,  currentRoom.items[key].pos.y);
	}
	updateInventory();
	updateMoodIndicator();
}

////////////////////////////////
//helper methods
////////////////////////////////
function takeItemFromRoom(itemStr){
	for(var name in currentRoom.items){
		if($.inArray(itemStr, currentRoom.items[name].alias)>=0){
			item = currentRoom.items[name];
			if(item && item.prop && item.prop.hidden){
			}else{
				delete currentRoom.items[name];
				return item;
			}
		}
	}
	$('#main').html("Item not found in room, Try again<br>");
}

function getItemFromRoom(itemStr){
	for(var name in currentRoom.items){
		if($.inArray(itemStr, currentRoom.items[name].alias)>=0){
			item = currentRoom.items[name];
			if(item && item.prop && item.prop.hidden){
			}else{
				return item;
			}
		}
	}
	$('#main').html("Item not found in room, Try again<br>");
}

function takeItemFromInventory(itemStr){
	for(var name in inventory){
		if($.inArray(itemStr, inventory[name].alias)>=0){
			item = inventory[name];
			delete inventory[name];
			return item;
		}
	}
	$('#main').html("Item not found in inventory, Try again<br>");
}

function getItemFromInventory(itemStr){
	for(var name in inventory){
		if($.inArray(itemStr, inventory[name].alias)>=0){
			item = inventory[name];
			return item;
		}
	}
	$('#main').html("Item not found in inventory, Try again<br>");
}

function getItem(itemStr){
	for(var name in currentRoom.items){
		if($.inArray(itemStr, currentRoom.items[name].alias)>=0){
			item = currentRoom.items[name];
			return item;
		}
	}
	for(var name in inventory){
		if($.inArray(itemStr, inventory[name].alias)>=0){
			item = inventory[name];
			return item;
		}
	}
}

function isInInventory(itemStr){
	for(var name in inventory){
		if($.inArray(itemStr, inventory[name].alias)>=0){
			item = inventory[name];
			return true;
		}
	}
	return false;
}

function showInventory(){
	$('#main').html("Inventory<br>");
	for(item in inventory){
		$('#main').append("&nbsp;&nbsp;"+item+"<br>");
	}
}

function dictSize(dict){
	var count = 0;
	for(var key in dict){
		count++;
	}
	return count;
}

function output(message){
	$('#main').html(message);
}

function updateInventory(){
	if(dictSize(inventory)>0){
		$('#inventory').html("<span style='font-size:25px; color:white;'>Inventory:</span><br>");
		for(itemKey in inventory){
			var item = inventory[itemKey];
			if(item.alias[0] == 'rope'){
				if(IMG[mood+"_rope"].height>IMG[mood+"_rope"].width)
					$('#inventory').append("<div class=invItem><img src='img/"+mood+"_coil.png' height=100 /><div>"+inventory[itemKey].alias[0]+"</div></div>");
				else
					$('#inventory').append("<div class=invItem><img src='img/"+mood+"_coil.png' width=100 /><div>"+inventory[itemKey].alias[0]+"</div></div>");
			}else{
				if(item.prop && item.prop.state)
					var imgName = mood+"_"+item.alias[0]+"_"+item.prop.state;
				else
					var imgName = mood+"_"+item.alias[0];
				console.log(imgName);
				if(IMG[imgName].height>IMG[imgName].width)
					$('#inventory').append("<div class=invItem><img src='img/"+imgName+".png' height=100 /><div>"+inventory[itemKey].alias[0]+"</div></div>");
				else
					$('#inventory').append("<div class=invItem><img src='img/"+imgName+".png' width=100 /><div>"+inventory[itemKey].alias[0]+"</div></div>");
			}
		}
		$('#inventory').fadeIn();
	}else{
		$('#inventory').fadeOut();
		
	}
}

function updateMoodIndicator(){
	if(mood == 'h'){
		moodName = 'Happy';
	}else if(mood == 's'){
		moodName = "Sad";
	}else if(mood == 'm'){
		moodName = 'Mad';
	}
	$('#currentMood').html("<img src='"+mood+"_placeholder.png'/><br>Current Mood<br><b>"+moodName+"</b></div>");
}