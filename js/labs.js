function convertImgToBase64(url, callback, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var img = new Image;
	img.crossOrigin = 'Anonymous';
	img.onload = function(){
		canvas.height = img.height;
		canvas.width = img.width;
	  	ctx.drawImage(img,0,0);
	  	var dataURL = canvas.toDataURL(outputFormat || 'image/png');
	  	callback.call(this, dataURL);
        // Clean up
	  	canvas = null; 
	};
	img.src = url;
}


// This the date to schedule the alarm
var myDate  = new Date("May 27, 2015 13:48:00");

// This is arbitrary data pass to the alarm
var data    = {
  foo: "bar"
}

// The "ignoreTimezone" string is what make the alarm ignoring it
var request = navigator.mozAlarms.add(myDate, "ignoreTimezone", data);

request.onsuccess = function () {
  console.log("The alarm has been scheduled");
};

request.onerror = function () { 
  console.log("An error occurred: " + this.error.name);
};



navigator.mozSetMessageHandler("alarm", function (mozAlarm) { 
  console.log((mozAlarm.data)); 
});





function populate_home() {
var articles=[];

 if(localStorage.feeds) {

   var data = JSON.parse(localStorage.feeds);
   
for(x in data)
  {
    
    articles = articles.concat(data[x].entries);
    
    
    
  }



articles.sort(function(a, b) {
    a = new Date(a.publishedDate);
    b = new Date(b.publishedDate);
    return a>b ? -1 : a<b ? 1 : 0;
});

}
  
  

}