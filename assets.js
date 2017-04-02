function Music(path){
	this.src = AM.getAsset(path);
	this.volume = 0;
}




Music.prototype.play = function(v){
	var that = this;
	this.src.volume = v * this.g.GLOBAL_VOLUME;
	this.src.addEventListener("ended", function(){
		that.src.currentTime = 0;;
		that.src.play();
	}, false);
	
	this.src.play();
}




Music.prototype.stop = function(t){
	this.src.pause();						//TODO: Have parameter t control fadeout
	this.src.currentTime = 0;
}










function AssetManager(){
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = {};
	this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path, label){			//Adds files to the queue but does not download them.
	if (path.split('.')[1] == 'png')			var type = 'image', loadCondition = "load";
	else if (path.split('.')[1] == audioType)	var type = 'audio', loadCondition = "canplaythrough";
	
	loadList.push({path: path, label: label, type: type});
	this.downloadQueue.push(path);
}

AssetManager.prototype.downloadAll = function(downloadCallback){		//Downloads everything in the queue, executes callback function when finished
	if (this.downloadQueue.length === 0){		//If there are no assets in the queue
		downloadCallback();
	}
	
	for (var i = 0; i < this.downloadQueue.length; i++){
		var path = this.downloadQueue[i];
		
		if (path.split('.')[1] == 'png')			var type = 'image', loadCondition = "load";
		else if (path.split('.')[1] == audioType)	var type = 'audio', loadCondition = "canplaythrough";
		else console.log("ERROR: Unrecognized file extention for " + path + ".  Accepted formats for images and audio are png, ogg, and mp3");
		var that = this;
		
		if (type == 'image')				var asset = new Image();	
		else								var asset = new Audio();
		
		asset.addEventListener(loadCondition, function(){
			if (DEBUG) console.log(this.src + ' loaded successfully');
			that.successCount += 1;
			if (that.isDone()) {
				downloadCallback();
			}
		}, false);
		
		asset.addEventListener("error", function(){
			if (DEBUG) console.log(this.src + ' failed to load');
			that.errorCount += 1;
			if (that.isDone()) {
				downloadCallback();
			}
		}, false);
		
		asset.src = path;				//This triggers the download
		this.cache[path] = asset;
	}
}

//Signal when downloads are finished

AssetManager.prototype.isDone = function(){
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.getAsset = function(path){
	return this.cache[path];
}

AssetManager.prototype.clearQueue = function(){
	this.successCount = 0;
	this.errorCount = 0;
	this.downloadQueue.length = 0;
}




var AM = new AssetManager();
var IMG = {};
var BGM = {};
var loadList = new Array();
var DEBUG = true;
var canvas;
var c;
var WIDTH;
var HEIGHT;

$(document).ready(function(){
	canvas = document.getElementById('canvas');
	c = canvas.getContext('2d');
	WIDTH = canvas.width;
	HEIGHT = canvas.height;

	//AM.queueDownload("url");

	//AM.downloadAll();

	AM.queueDownload("img/Room_Template.png", "test");
	AM.queueDownload("img/h_dungeon.png", "h_dungeon");
	AM.queueDownload("img/m_dungeon.png", "m_dungeon");
	AM.queueDownload("img/s_dungeon.png", "s_dungeon");
	AM.queueDownload("img/h_placeholder.png", "h_placeholder");
	AM.queueDownload("img/m_placeholder.png", "m_placeholder");
	AM.queueDownload("img/s_placeholder.png", "s_placeholder");
	AM.queueDownload("img/h_flower_okay.png", "h_flower_okay");
	AM.queueDownload("img/m_flower_okay.png", "m_flower_okay");
	AM.queueDownload("img/s_flower_okay.png", "s_flower_okay");
	AM.queueDownload("img/h_flower_broken.png", "h_flower_broken");
	AM.queueDownload("img/m_flower_broken.png", "m_flower_broken");
	AM.queueDownload("img/s_flower_broken.png", "s_flower_broken");
	AM.queueDownload("img/h_rope.png", "h_rope");
	AM.queueDownload("img/m_rope.png", "m_rope");
	AM.queueDownload("img/s_rope.png", "s_rope");
	AM.queueDownload("img/h_coil.png", "h_coil");
	AM.queueDownload("img/m_coil.png", "m_coil");
	AM.queueDownload("img/s_coil.png", "s_coil");
	AM.queueDownload("img/h_door.png", "h_door");
	AM.queueDownload("img/m_door.png", "m_door");
	AM.queueDownload("img/s_door.png", "s_door");
	AM.queueDownload("img/h_chest_locked.png", "h_chest_locked");
	AM.queueDownload("img/m_chest_locked.png", "m_chest_locked");
	AM.queueDownload("img/s_chest_locked.png", "s_chest_locked");
	AM.queueDownload("img/h_chest_unlocked.png", "h_chest_unlocked");
	AM.queueDownload("img/m_chest_unlocked.png", "m_chest_unlocked");
	AM.queueDownload("img/s_chest_unlocked.png", "s_chest_unlocked");
	AM.queueDownload("img/h_circular key.png", "h_circular key");
	AM.queueDownload("img/m_circular key.png", "m_circular key");
	AM.queueDownload("img/s_circular key.png", "s_circular key");
	AM.queueDownload("img/h_compartment.png", "h_compartment");
	AM.queueDownload("img/m_compartment.png", "m_compartment");
	AM.queueDownload("img/s_compartment.png", "s_compartment");
	AM.queueDownload("img/h_triangular key.png", "h_triangular key");
	AM.queueDownload("img/m_triangular key.png", "m_triangular key");
	AM.queueDownload("img/s_triangular key.png", "s_triangular key");
	
	AM.downloadAll(function(){
		//Assign all assets to dictionary
		for (i = 0; i < loadList.length; i++){
			if (loadList[i].type == 'audio')
				BGM[loadList[i].label] = new Music('bgm/' + loadList[i].path);
			else
				IMG[loadList[i].label] = AM.getAsset(loadList[i].path);
		}
		
		startGame();
	});
});