var MAX_INVENTORY_SIZE=4;
var MOOD_COLORS={'h':"#6d5c00",'m':"#570200",'s':'#01445d'};

gameData = {
'parser':{
	"verbs":{
		"look in":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions['look in'](item);
			}catch(e){
				try{
					output(item.desc[mood]+"<br>");
				}catch(e){
					output("I can't see inside the "+itemStr);
				}
			}
		},
		"search":function(itemStr){this["look in"](itemStr);},
		"look at":function(itemStr){this["look"](itemStr);},
		"look":function(itemStr){
			if(!itemStr){
				output(currentRoom.desc[mood]+"<br>");
			}else{
				item = getItem(itemStr);
				try{
					item.actions['look'](item);
				}catch(e){
					try{
						output(item.desc[mood]+"<br>");
					}catch(e){
						output("Nothing is known about "+itemStr);
					}
				}
			}
		}, 
		// Remove the following commands before release
		"cheer up":function(){
			mood = 'h';
			output("I'm Happy!");
			redraw();
		},
		"get happy":function(){this["cheer up"]();},
		"sadden":function(){
			mood = 's';
			output("I'm sad..");
			redraw();
		},
		"get sad":function(){this["sadden"]();},
		"get mad":function(){
			mood = 'm';
			output("I'm MAD!!!!");
			redraw();
		},
		"anger":function(){this["get mad"]();},
		"take":function(itemStr){
			if(dictSize(inventory)<MAX_INVENTORY_SIZE){
				item = takeItemFromRoom(itemStr);
				if(!item)
					output("You can't see any "+itemStr+" in this room");
				if(item.actions && item.actions.take){
					currentRoom.items[item.alias[0]] = item;
					item.actions.take(itemStr);
				}else if(item.prop && item.prop.takeable==false){
					output("You can't take the "+itemStr);
					currentRoom.items[item.alias[0]] = item;
				}else{
					inventory[item.alias[0]] = item;
					redraw();
					output("took " + item.alias[0] +"<br>");
				}
			}else{
				output("Your inventory is full");
			}
		},
		"drop":function(itemStr){
			item = takeItemFromInventory(itemStr);
			currentRoom.items[item.alias[0]] = item;
			output("dropped " + item.alias[0] +"<br>");
			redraw();
		},
		"release":function(itemStr){this["drop"](itemStr);},
		"inventory":function(){
			outputStr = "Inventory:<br>";
			for(item in inventory){
				outputStr += "&nbsp;&nbsp;"+item+"<br>";
			}
			output(outputStr);
		},
		"open":function(itemStr){this["unlock"](itemStr);},
		"unlock":function(parameter){
			try{
				itemStr = parameter.match(/(.*)( with | on )(.*)/)[1];
				toolStr = parameter.match(/(.*)( with | on )(.*)/)[3];
			}catch(e){
				output("Unlock "+parameter+" with what?");
				return;
			}
			tool = takeItemFromInventory(toolStr);
			item = getItem(itemStr);
			try{
				item.actions['unlock'](tool, item);
			}catch(e){
				console.log(e);
				output("Could not unlock "+itemStr);
			}
			if(tool)
				inventory[tool.alias[0]] = tool;
		},
		"enter":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions["enter"](item);
			}catch(e){
				output("You can't enter a "+itemStr);
			}
		},
		"smell":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions["smell"](item);
			}catch(e){
				output("The "+itemStr+" doesn't have a scent.");
			}
		},
		"eat":function(itemStr){
			item = getItem(itemStr);
			if(!item){
				output("I don't know of this '"+itemStr+"'.  How do I eat it?");
				return;
			}
			try{
				item.actions["eat"](item);
			}catch(e){
				output("I don't think the "+itemStr+" is meant for eating.");
			}
		},
		"kill":function(itemStr){
			killCB = function(itemStr){
				if(itemStr.trim()=="self"){
					$('body').append("<div style='position:fixed; width:100%; height:100%; background-color:rgba(0,0,0,.5);left:0px; top:0px;text-align:center;font-size:30px;'><div style='background-color:white;border-radius:15px;border:2px solid black;display:inline-block;padding:10px;position:absolute;top:40%;left:42%;'><b>Game Over</b><br> you died</div></div>");
					return;
				}
				item = getItem(itemStr);
				try{
					item.actions["kill"](item);
				}catch(e){
					output("The "+itemStr+" doesn't die");
				}
			};
			output("Are you sure you want to kill "+itemStr+"? <button onclick='killCB(\""+itemStr+"\")'>Yes!!!</button><button onclick='output(\"No "+itemStr+" was killed\");'>No..</button>");
		},
		"shoot":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions["shoot"](item);
			}catch(e){
				output("I can't shoot the "+itemStr+".");
			}
		},
		"jump":function(){
			output("You jumped up and came back down.");
		},
		"flail":function(){
			output("It's not very effective.");
		},
		"use":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions["use"](item);
			}catch(e){
				output("How do I use a "+itemStr+"?");
			}
		},
		"smash":function(itemStr){
			item = getItem(itemStr);
			try{
				item.actions["smash"](item);
			}catch(e){
				if(item){
					output("SMASH!!!");
					$('body').css("background-color",MOOD_COLORS.m);
					$('canvas').effect( "shake", function(){
						$('body').css("background-color",MOOD_COLORS[mood]);
						output("The "+item.alias[0]+" didn't break.");
					});
				}else{
					output("I don't know how to smash a "+itemStr+"?");
				}
			}
		},
		"help":function(){
				output("look, look in, take, drop, unlock, use, etc.");
		},
		"play":function(){
				output("YAY! Playing is fun!!!");
				$('body').css("background-color","lightGreen");
		},
		"dance":function(){
				output("YAY! Dancing is fun!!!");
				$('body').css("background-color","#D8B3FF");
				$('canvas').effect("shake",{'direction':'up','times':3},3000);
		},
		"throw":function(itemStr){
			item = takeItemFromInventory(itemStr);
			try{
				item.actions["throw"](item);
			}catch(e){
				if(item){
					output("THROW!!!");
					$('canvas').effect( "shake",{'times':1}, 250, function(){
						output("The "+item.alias[0]+" didn't break.");
					});
					currentRoom.items[item.alias[0]]=item;
					redraw();
				}else{
					output("I don't have a "+itemStr+" to throw.");
					return;
				}
			}
		},
	}
},
"rooms" : {
	"dungeon":{
		"name":"dungeon",
		"desc":{
			"h":"I'm in a dungeon. I have a really good feeling about this place. Great things could happen here.",
			"s":"I'm in a dungeon. It's dark and cold. I could be stuck here forever.",
			"m":"I'm in a dungeon. If I'm lucky, one day I'll be able to meet the person who built this place, and I can punch them in the face. Seriously, what idiot designed this place?"
		},
		"items":{
			"flower":{
				"alias":["flower","vase","garbage"],
				"desc":{
					"h":"A beautiful daisy! That's wonderful. I would feel so happy if I could just smell it.",
					"s":"A dead flower. A fading memory of a life that no longer is.",
					"m":"A flower. I kind of want to light it on fire."
				},
				"pos":{
					"x":530,
					"y":300,
				},
				"actions":{
					"look in":function(){
						if(mood=='h'){
							output("There's some dirt underneath the flower, but I can't look very deep in the vase.");
						}else if(mood=='s'){
							output("I can't look into the vase.");
						}else if(mood=='m'){
							output("Nothing valuable on top of this dumb vase. Maybe I'll find something if I smash it open.");
						}
					},
					"smell":function(self){
						if(mood=='h'){
							output("The daisy smells wonderful!");
						}else if(mood=='s'){
							output("It's nice to be able to stop and smell a flower...");
							setTimeout(function(){
								mood = 'h';
								redraw();
							},1000);
						}else if(mood=='m'){
							output("The flower has an oddly relaxing smell...");
							setTimeout(function(){
								mood = 'h';
								redraw();
							},1000);
						}
					},
					"kill":function(self){
						if(self.state == 'okay')
							output("The flower is cut from it's roots already.  If it's not dead, it's on its way...");
						else
							output("I broke it, it's dead.. End of story.");
					},
					"smash":function(self){
						if(self.prop.state == 'okay'){
							if(mood=='h'){
								output("But it's such a nice flower!");
							}else if(mood=='s'){
								output("I can't find the strength to.");
							}else if(mood=='m'){
								output("Dumb flower.");
								$('canvas').effect( "shake", function(){
									self.prop.state = "broken";
									getItem('circular key').prop.hidden=false;
									redraw();
								});
							}
						}else{
							output("It's already broken..");
							$('canvas').effect( "shake", function(){
								output("The vase broke no more.");
								redraw();
							});
						}
					},
					"throw":function(self){
						if(self.prop.state == 'okay'){
							if(mood=='h'){
								output("But it's such a nice flower!");
								inventory[self.alias[0]] = self;
							}else if(mood=='s'){
								output("I can't find the strength to.");
								inventory[self.alias[0]] = self;
							}else if(mood=='m'){
								output("THROW!!!");
								$('canvas').effect( "shake",{'times':1}, 250, function(){
									output("The vase shattered and a circular key fell out.");
									getItem('circular key').prop.hidden=false;
									self.prop.state = "broken";
									currentRoom.items[self.alias[0]] = self;
									redraw();
								});
							}
						}else{
							output("THROW!!!");
							$('canvas').effect( "shake",{'times':1}, 250, function(){
								output("The vase broke no more.");
								currentRoom.items[self.alias[0]] = self;
								redraw();
							});
						}
					}
				},
				"prop":{
					"state":"okay",
				}
			},
			"pile of hay":{
				"alias":["pile of hay","pile","hay","hay pile"],
				"desc":{
					"h":"A pile of hay. It probably was put here so someone could have something soft to lay on. It looks comfy!",
					"s":"A pile of hay. Probably meant for someone to cover themselves with to keep warm in this drafty place.",
					"m":"A pile of hay. How stereotypical is this place? There's probably a skeleton in manacles in the next cell over."
				},
				"pos":{// This needs to be updated
					"x":200,
					"y":200,
				},
				"actions":{
					"look in":function(self){
						if(mood=='h' && currentRoom.items['triangular key']){
							output("Patience is one of the best virtues. Thanks to it, I found a key in the hay!");
							getItem("triangular key").prop.hidden=false;
							redraw();
						}else if(mood=='h'){
							output("Patience is one of the best virtues. But there");
							mood = 'm';
							redraw();
						}else if(mood=='s'){
							output("There's no point in searching. The needle in the haystack will never be found.");
						}else if(mood=='m'){
							output("I've shoved it aside but there's nothing under it. Hay is annoying.");
						}
					},
					"smell":function(self){
						if(mood=='h'){
							output("Smells like fresh hay.");
						}else if(mood=='s'){
							output("Smell like damp, moldy hay.");
							mood = 'h';
							redraw();
						}else if(mood=='m'){
							output("It smells like a pig rolled around in it.");
						}
					},
					"eat":function(self){
						self.prop.eatcounter += 1;
						if(mood=='h'){
							output("Kind of dry, but I could see how animals like it!");
						}else if(mood=='s'){
							output("I feel sick...");
						}else if(self.prop.eatcounter == 1 && mood=='m'){
							output("This is clearly the <b>dumbest</b> thing I've done yet.");
						}else if(self.prop.eatcounter == 2 && mood=='m'){
							output("No, <b>this</b> is clearly the <b>dumbest</b> thing I've done yet.");
						}else if(self.prop.eatcounter >= 3 && mood=='m'){
							output(self.prop.eatcounter + " times? Really?");
						}
					}
				},
				"prop":{
					"eatcounter":0,
					"takeable":false,
				}
			},
			"manacles":{
				"alias":["manacles","manacle","chains"],
				"desc":{
					"h":"A set of manacles. Good for holding your arms up!",
					"s":"A set of manacles. I could be a skeleton in those one day...",
					"m":"Dumb chains. It's like someone was trying to scare me or something."
				},
				"pos":{ // This needs to be updated
					"x":200,
					"y":200,
				},
				"actions":{
					"smell":function(self){
						if(mood=='h'){
							output("Smells like shiny new metal.");
						}else if(mood=='s'){
							output("Smell like rusting metal.");
						}else if(mood=='m'){
							output("Why would I sniff manacles?");
						}
					},
					"eat":function(self){
						if(mood=='h'){
							output("I'm pretty sure this is inedible, but I'm also sure I would get my daily value of iron!");
						}else if(mood=='s'){
							output("I feel sick...");
						}else if(mood=='m'){
							output("I'd rather eat the hay!");
						}
					},
					"use":function(self){
						if(mood=='h'){
							output("Shoot. I can't find a key that would work with these. Oh well. I'm sure I'm happier when I'm not in chains.");
						}else if(mood=='s'){
							output("I can't even put myself in chains...");
							mood = 'h';
							redraw();
						}else if(mood=='m'){
							output("I'd rather eat the hay!");
						}
					}
				},
				"prop":{
					"takeable":false,
				}
			},
			"triangular key":{
				"alias":["triangular key", "key"],
				"desc":{
					"h":"A triangular key! It probably opens a way out of here!",
					"s":"A triangular key. It looks like it could break if it was squeezed too hard.",
					"m":"A triangular key, probably placed here just to irritate me and make me think I might be able to find a way out."
				},
				"pos":{// This needs to be updated
					"x":190,
					"y":470,
				},
				"prop":{
					"hidden":true,
				}
			},
			"circular key":{
				"alias":["circular key","key"],
				"desc":{
					"h":"A circular key! It probably opens a way out of here!",
					"s":"A circular key. It probably doesn't open anything in this room.",
					"m":"A circular key, probably placed here just to irritate me and make me think I might be able to find a way out."
				},
				"pos":{// This needs to be updated
					"x":600,
					"y":300,
				},
				"prop":{
					"hidden":false,
					"counter":3,
				},
				"actions":{
					"eat":function(self){
						output("No,I need that key!");
					},
				}
			},
			"chest key":{
				"alias":["chest key","key"],
				"desc":{
					"h":"This key looks like it fits in the chest!",
					"s":"A circular key. It probably doesn't open anything in this room.",
					"m":"A circular key, probably placed here just to irritate me and make me think I might be able to find a way out."
				},
				"pos":{// This needs to be updated
					"x":600,
					"y":300,
				},
				"prop":{
					"hidden":false,
					"counter":3,
				},
				"actions":{
					"eat":function(self){
						output("No,I need that key!");
					},
				}
			},
			"stone door":{
				"alias":["stone door", "door","camoflaged door","hidden door"],
				"desc":{
					"h":"Wow! That was really cleverly hidden!",
					"s":"That door is an omen of things to come.",
					"m":"Like I said. Going to kill whoever designed this place."
				},
				"pos":{// This needs to be updated
					"x":500,
					"y":200,
				},
				"actions":{
					"shoot":function(self){
						if(!getItem('gun')){
							if(mood=='h'){
								output("");
							}else if(mood=='s'){
								output("I don't have anything to shoot with...");
							}else if(mood=='m'){
								output("I would if the creator of this room was here!");
							}
						}
					},
					"unlock":function(key, self){
						if($.inArray("triangular key",key.alias[0])){
							if(self.prop.locked == true){
								self.prop.locked = false;
								output("I've unlocked the door.");
							}else{
								self.prop.locked = true
								output("I've locked the door.");
							}
						}else{
							output("That doesn't work.");
						}
					},
				},
				"prop":{
					"locked":true,
					"takeable":false,
				}
			},
			"compartment":{
				"alias":["compartment","secret compartment","hidden compartment","square compartment","hidey place","hidey hole","the place"],
				"desc":{
					"h":"Wow! That was really cleverly hidden!",
					"s":"How did I miss this for so long? I can't believe I didn't notice it...",
					"m":"The person who designed this place is a jerk."
				},
				"pos":{// This needs to be updated
					"x":330,
					"y":470,
				},
				"actions":{
					"shoot":function(self){
						if(!getItem('gun')){
							if(mood=='h'){
								output("I wouldn't do that!");
							}else if(mood=='s'){
								output("I don't have anything to shoot with...");
							}else if(mood=='m'){
								output("I would if the creator of this room was here!");
							}
						}
					},
					"unlock":function(key, self){
						if($.inArray("circular key",key.alias[0])){
							if(self.prop.locked == true){
								self.prop.locked = false;
								output("I've unlocked the secret compartment.");
								self.hidden=true;
								redraw();
							}else{
								self.prop.locked = true
								output("I've locked the secret compartment.");
								self.hidden=false;
								redraw();
							}
						}else{
							output("That doesn't work.");
						}
					},
				},
				"prop":{
					"locked":true,
					"takeable":false,
					"hidden":true,
				}
			},
			"wall":{
				"alias":["wall", "north wall","south wall", "east wall", "west wall", "top wall", "bottom wall", "first wall", "second wall", "third wall", "fourth wall", "fifth wall", "sixth wall",],
				"desc":{
					"h":"It's a nice wall.",
					"s":"It's a dark and cold wall.",
					"m":"It's a wall that was put there to annoy me."
				}
			},
			"walls":{
				"alias":["walls"],
				"desc":{
					"h":"They are nice walls.",
					"s":"They are dark and cold wall.",
					"m":"They are walls that were put there to annoy me."
				}
			},
			"rope":{
				"alias":["rope", "coil","coil of rope"],
				"desc":{
					"h":"",
					"s":"",
					"m":""
				},
				"pos":{// This needs to be updated
					"x":300,
					"y":130,
				},
				"actions":{
					"tie":function(self){
						if(mood=='h'){
							output("I made a nice knot! Oh...it fell apart...");
						}else if(mood=='s'){
							output("I can't tie knots...");
							mood = 'h';
							redraw();
						}else if(mood=='m'){
							output("I can't do this!");
						
						}
					},
				},
				"prop":{
					"locked":true,
					"takeable":true,
				}
			},
			"chest":{
				"alias":["chest", "box"],
				"desc":{
					"h":"Hey! A treasure chest!",
					"s":"Oh. A chest.",
					"m":"Oh, look. Another useless box."
				},
				"pos":{// This needs to be updated
					"x":500,
					"y":200,
				},
				"actions":{
					"shoot":function(self){
						if(!getItem('gun')){
							if(mood=='h'){
								output("I don't have anything to shoot with.");
							}else if(mood=='s'){
								output("There's nothing I can do that with.");
								mood = 'h';
								redraw();
							}else if(mood=='m'){
								output("I would if I had something to shoot with!");
							}
						}
					},
					"unlock":function(key, self){
						console.log(key);
						if($.inArray("triangular key",key.alias[0])){
							if(self.prop.locked == true){
								self.prop.locked = false;
								output("I've unlocked the chest.");
							}else{
								self.prop.locked = true
								output("I've locked the chest.");
							}
						}else{
							output("I could not open the chest with the "+key.alias[0]);
						}
					},
					"look in":function(self){
						if(self.prop.locked){
							output("The chest is locked.");
						}else{
							if(mood=='h'){
								output("There's not much there, but that's okay!");
							}else if(mood=='s'){
								output("It's empty.");
							}else if(mood=='m'){
								output("It's completely empty and worthless, like everything else in this room.");
							}
						}
					},
				},
				"prop":{
					"locked":true
				}
			}
		}
	},
}
}
