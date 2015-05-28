function convertImgToBase64(url, callback,feed_name, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var img = new Image;
	img.crossOrigin = 'Anonymous';
	img.onload = function(){
		canvas.height = img.height;
		canvas.width = img.width;
	  	ctx.drawImage(img,0,0);
	  	var dataURL = canvas.toDataURL(outputFormat || 'image/png');
	  	//callback.call(this, dataURL);
        callback(feed_name,dataURL);
        // Clean up
	  	canvas = null; 
	};
	
}





// This the date to schedule the alarm
var myDate  = new Date("May 27, 2015 15:48:00");

// This is arbitrary data pass to the alarm
var data    = {
  foo: "sha"
}

// The "ignoreTimezone" string is what make the alarm ignoring it
var request = navigator.mozAlarms.add(myDate, "ignoreTimezone", data);

request.onsuccess = function () {
  console.log("The alarm has been scheduled");
};

request.onerror = function () { 
  console.log("An error occurred: " + this.error.name);
};



function get64(source, width, height) {

            var canvas = document.createElement('canvas');

            canvas.height = height || 24;
            canvas.width = width || 24;

            ctx = canvas.getContext('2d');

            ctx.drawImage(source, 0, 0);

            return canvas.toDataURL('image/png')

        }

        function cache_icon(feed_name, source) {

            if (global_feeds[feed_name].icon_type != 'local') {


                global_feeds[feed_name].icon = get64(source);
                global_feeds[feed_name].icon_type = 'local';
                localStorage.feeds = JSON.stringify(global_feeds);
            }
        }