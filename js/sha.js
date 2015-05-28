//         WebFontConfig = {
//            google: { families: [ 'Raleway::latin' ] }
//          };
//          (function() {
//            var wf = document.createElement('script');
//            wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
//              '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
//            wf.type = 'text/javascript';
//            wf.async = 'true';
//            var s = document.getElementsByTagName('script')[0];
//            s.parentNode.insertBefore(wf, s);
//          })();
//document.addEventListener('load',router);

'use strict';

setTimeout(function(){
    
var slideout = new Slideout({
    'panel': document.getElementById('main'),
    'menu': document.getElementById('menu'),
    'padding': 246,
    'tolerance': 70,
    'duration': 200
});

populate_subscription();
},50);

var global_feeds = {};

if (localStorage.feeds) {
    global_feeds = JSON.parse(localStorage.feeds);
}

// Listineng for Hash Change
window.addEventListener('hashchange', router);


//This Founction Will Execute Functions Based on Hashes 

function router() {

    console.log('hashChange');
    var route = (window.location.hash.replace('#', '')).split('/');

    switch (route[1]) {

        //if cat populate category page , category name is in 3rd position    
    case 'cat':
        pop_follow_list(route[2]);
        break;

        //if sync the Alarm Fired For Syncing
    case 'sync':
        update_all();
        break;

    case 'content':
        display_article(route[2], route[3]);
        break;

    }
}



function populate_subscription() {
    var html = '';
    var feed_name;
    var feeds = {}
    if (localStorage.feeds) {
        feeds = JSON.parse(localStorage.feeds);
    }
     document.getElementById('lists').innerHTML = '';
    for (feed_name in feeds) {
        if (feeds[feed_name]) {

            html += '<div class="menu_item" onclick="populate_feed(this.textContent.trim())"><img class="feed_favicon" src="' + feeds[feed_name]['icon'] + '" /> <span>' + feed_name + '</span></div>';



            var menu_item = document.createElement('div');
            menu_item.setAttribute('class', 'menu_item');
            menu_item.addEventListener('click', function (e) {
                var elm = e.target;

                if (elm.className != 'list') {
                    elm = elm.parentElement;
                }
                populate_feed(elm.textContent.trim())

            });
            
            
        var sub_title  = document.createElement('span');
            sub_title.textContent = feed_name;
            
        var feed_favicon = document.createElement('img');
            feed_favicon.className = "feed_favicon";
            
            
            console.log(feed_name);
            
            
            if(feeds[feed_name]['icon'] && feeds[feed_name]['icon'].search('data')==-1) {
            feed_favicon.crossOrigin = "Anonymous";    
            feed_favicon.src ='http://geektips.in/feedy/?url='+ feeds[feed_name]['icon'];
            feed_favicon.addEventListener('load', function(e){
            
            console.log(e);
            console.log('img loaded');
            cache_icon(e.target.parentElement.textContent,e.target);
            
            });
            
            
            } else {
            
                feed_favicon.src = feeds[feed_name]['icon'];
            
            }
            
            menu_item.appendChild(feed_favicon);
            menu_item.appendChild(sub_title);
            
             document.getElementById('lists').appendChild(menu_item);

        }
    }
//    document.getElementById('lists').innerHTML = html;
}




//This Function Returns the Source inside the first src attribut it finds even if it is not an Image , Needs Fixing
function parse_img(html_str) {

   var reg = /\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/;
    return reg.exec(html_str);

}



/*function to fetech remote feed url , Takes feed url and a callback or a feed_name , if feed_name is given then it will call force_populate_feed with feed name as parameter
 */

function fetech_feed(url, feed_name) {

    var feeds = {};
    //Api URL

  var  fetch_url = 'http://localhost:8080/feedy/?url=' + encodeURIComponent(url);

    console.log(fetch_url);

    nanoajax.ajax(fetch_url, function (stat, code) {

        //if the ajax request was success    
        if (stat == 200) {

 
            console.log(stat);
            //            console.log(JSON.parse(code));
            code = JSON.parse(code);

            //checking weather the subscription exists , if it is there parse it to Object
            if (localStorage.feeds) {
                feeds = JSON.parse(localStorage.feeds);
            }
            else
            {
            
                return 'Quiting';
            
            }

            var tit = code.responseData.feed.title;
            //Coverting The Expire Time To Javascript Object
            var time = new Date(code.expire);
            console.log(tit);
            feeds[tit]['entries'] = code.responseData.feed.entries;

            feeds[tit]['updated_time'] = time.getTime();
            feeds[tit]['feed_url'] = url;

            //writing back data
            localStorage.feeds = JSON.stringify(feeds);

            global_feeds = feeds;

            //if there is a callback then call it else call force populate feed
            if (typeof (feed_name) == 'string') {
                force_populate_feed(feed_name);
            } else if (typeof (feed_name) == 'function') {
                feed_name();
            }
        } else {
            if (typeof (feed_name) == 'string') {
                force_populate_feed(feed_name);
            } else if (typeof (feed_name) == 'function') {
                feed_name();
            }
        }
    });
}


//function to  populate feed or fetech and populate feed
function populate_feed(feed_name) {

    var feed_name = (feed_name);
    var html = '<header id="top"><span id="top_title">' + feed_name + '</span></header>';

    document.getElementById('main').innerHTML = html;

    var data = (JSON.parse(localStorage.feeds));
    data = (data[feed_name]);
    var cur_time = new Date;

    //if feed is not fresh or dosn't fetech at all then fetech feed  else populate feed
    if (((cur_time > data.updated_time)) || data.updated_time == 0) {

        var html = '<header id="top"><span id="top_title">Checking for new Articles...</span></header>';
        document.getElementById('main').innerHTML = html;
        fetech_feed(data.feed_url, feed_name);
        return;
    } else {
        force_populate_feed(feed_name);
    }

}

function force_populate_feed(feed_name) {
    var feed_name = (feed_name);
    var html = '<header id="top"><span id="top_title">' + feed_name + '</span></header>';
    document.getElementById('main').innerHTML = html;
    var data = {}
    if (localStorage.feeds) {
        data = (JSON.parse(localStorage.feeds));
    } else {
        return;
    }
    data = (data[feed_name]);
    var list = {
        feed_title: [],
        feed_img: []
    };
    var tmp;
    var temp;
    var count = data.entries.length
    for (var i = 0; i < count; i++) {
        var elm = document.createElement('div');
        elm.setAttribute('data-source', feed_name);
        elm.setAttribute('data-entry', i);
        elm.setAttribute('class', 'list');

        elm.addEventListener('click', propogate_content);

        temp = parse_img(data.entries[i].content);
        if (temp) {
            list.feed_img.push(temp[0])
        }
        if (temp) {
            temp[0] = (temp[0]).replace('"', '');
            temp[0] = (temp[0]).replace('"', '');
            temp[0] = (temp[0]).replace('src=', '');
        } else {
            temp = '';
        }
        //console.log( temp[0].replace('src='));

        var img = document.createElement('img');
        setAttributes(img, {
            'src': temp[0],
            'class': 'feed_img'
        });
        var feed_title = document.createElement('span');
        feed_title.setAttribute('class', 'feed_title');

        feed_title.textContent = data.entries[i].title;
        //                html += '<img class="feed_img"  src="' + temp[0] + '">';
        //
        //                html += '<span class="feed_title">' + data.entries[i].title + '</span></div>';
        elm.appendChild(img);
        elm.appendChild(feed_title);
        document.getElementById('main').appendChild(elm);
    }
}

function add_feed(url, title) {
    var feeds = {};
    if (localStorage.feeds)
        feeds = JSON.parse(localStorage.feeds);
    var title = code.responseData.feed.title;
    console.log(title);
    feeds[title] = {
        entries: null,
        updated_time: null,
        feed_url: url
    }
    localStorage.feeds = JSON.stringify(feeds);
}

function show_add_feed() {}

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function pop_follow_list(path) {
    var subscribed_feeds = {}
    if (localStorage.feeds)
        subscribed_feeds = JSON.parse(localStorage.feeds);
    if (!path) {
        path ='Tech';
    }
    var hash = path;
   
    var follow_feeds = collection[hash].feeds;



    document.getElementById('category_head').style.backgroundImage = 'url(\'' + collection[hash].img + '\')';
    document.getElementById('top_title').textContent = hash;

var follow;

        document.getElementById('sub_lists').innerHTML = '';
    for (follow in follow_feeds) {
        var sub_list = document.createElement('div');
        sub_list.setAttribute('class', 'sub_list');
        var sub_list_head = document.createElement('div');
        sub_list_head.setAttribute('class', 'sub_list_head');
        var sub_list_img = document.createElement('img');
        sub_list_img.setAttribute('class', 'sub_list_img');
        sub_list_img.setAttribute('src', follow_feeds[follow].icon);
        var sub_title = document.createElement('span');
        sub_title.setAttribute('class', 'sub_title');
        sub_title.textContent = follow;
        var button = document.createElement('div');
        button.setAttribute('class', 'button');
        if (subscribed_feeds.hasOwnProperty(follow)) {
            button.textContent = 'Followed';
            button.setAttribute('class', 'button followed');
            button.dataset.state = 'followed';
        } else {
            button.textContent = 'Follow';
            button.dataset.state = 'follow';
        }
        button.setAttribute('data-name', follow);
        var sub_desc = document.createElement('p');
        sub_desc.setAttribute('class', 'sub_desc');
        sub_desc.textContent = follow_feeds[follow].description;
        sub_list_head.appendChild(sub_list_img);
        sub_list_head.appendChild(sub_title);
        sub_list_head.appendChild(button);
        sub_list.appendChild(sub_list_head);
        sub_list.appendChild(sub_desc);
        
        document.getElementById('sub_lists').appendChild(sub_list);
    }
    
    var buttons = document.getElementsByClassName('button');
    var btn_len = buttons.length
    for (var i = 0; i < btn_len; i++) {
        var elem = (buttons[i]);
        elem.addEventListener('click', fn)
    }

    function fn(e) {
        var feed_name = e.target.dataset.name;
        var feeds = {};
        if (localStorage.feeds) {
            feeds = JSON.parse(localStorage.feeds);
        }
        if (e.target.dataset.state == 'follow') {
            e.target.dataset.state = 'followed';
            e.target.className += ' followed';
            e.target.textContent = 'followed';
            feeds[feed_name] = {
                feed_url: collection[hash]['feeds'][feed_name].feedurl,
                entries: [
        ],
                updated_time: 0,
                icon: collection[hash]['feeds'][feed_name].icon,

                icon_type: 'remote'
            };

            fetech_feed(feeds[feed_name].feed_url);

        } else if (e.target.dataset.state == 'followed') {
            e.target.dataset.state = 'follow';
            e.target.className = '';
            e.target.className = 'button';
            e.target.textContent = 'follow';
            delete feeds[feed_name];
        }
        localStorage.feeds = JSON.stringify(feeds);
        populate_subscription();

    }

}









// Function to Sync Feeds

function update_all() {

    if (localStorage.feeds) {

        var data = JSON.parse(localStorage.feeds);


        var temp = [];

        var i = 0;

        //we will sort feeds with last update time , feed updated recently will be synced last          

        for (x in data) {

            temp[i] = {


                //fetching only the updated time and feed url; 
                date: data[x].updated_time,
                url: data[x].feed_url

            };

            i++;


        }

        //Sorting     
        temp.sort(function (a, b) {
            a = new Date(a.updated_time);
            b = new Date(b.updated_time);
            return a > b ? -1 : a < b ? 1 : 0;
        });

        // Queing the Feeds to be fetched in the window.toFetch Object
        window.toFetch = temp;

        //Start Fetching Feed   
        rec()


    }


}

//function to recursively fetch queued feeds                 
function rec() {

    if (window.toFetch.length > 0) {
        fetech_feed((window.toFetch.pop()).url, rec);

    } else {

        //When All The Feeds are feteched Reshedule fetching for next 15 mins

        shedule_sync();

    }


}



function populate_home() {
    var articles = [];

    if (localStorage.feeds) {

        var data = JSON.parse(localStorage.feeds);

        for (x in data) {
            //collecting articles from each feeds
            articles = articles.concat(data[x].entries);



        }


        //sorting article by Published Date
        articles.sort(function (a, b) {
            a = new Date(a.publishedDate);
            b = new Date(b.publishedDate);
            return a > b ? -1 : a < b ? 1 : 0;
        });

    }

    //Rendering Articles

    var html = '<header id="top"><span id="top_title">Home</span></header>';
    document.getElementById('main').innerHTML = html;
    var data = {
        entries: articles
    }

    var list = {
        feed_title: [],
        feed_img: []
    };


    var count = data.entries.length;
    for (var i = 0; i < count; i++) {

        console.log(data.entries[i].publishedDate);

        elm = document.createElement('div');
        elm.setAttribute('class', 'list');
        temp = parse_img(data.entries[i].content);
        if (temp) {
            list.feed_img.push(temp[0])
        }
        if (temp) {
            temp[0] = (temp[0]).replace('"', '');
            temp[0] = (temp[0]).replace('"', '');
            temp[0] = (temp[0]).replace('src=', '');
        } else {
            temp = '';
        }
        //console.log( temp[0].replace('src='));

        var img = document.createElement('img');
        setAttributes(img, {
            'src': temp[0],
            'class': 'feed_img'
        });
        var feed_title = document.createElement('span');
        feed_title.setAttribute('class', 'feed_title');
        feed_title.textContent = data.entries[i].title;
        //                html += '<img class="feed_img"  src="' + temp[0] + '">';
        //
        //                html += '<span class="feed_title">' + data.entries[i].title + '</span></div>';
        elm.appendChild(img);
        elm.appendChild(feed_title);
        document.getElementById('main').appendChild(elm);
    }

}



function shedule_sync(milli_sec) {

    if (navigator.mozAlarms) {

        var id = null;

        if (!milli_sec) {

            milli_sec = 900000;

        }

        var request = navigator.mozAlarms.getAll();

        request.onsuccess = function () {
            if (request.result.length == 0) {


                // This the date to schedule the alarm , Default 15 minute in milli second
                var myDate = new Date(new Date().getTime() + milli_sec);

                // This is arbitrary data pass to the alarm
                var data = {
                    ping: "pong"
                }

                // The "ignoreTimezone" string is what make the alarm ignoring it
                var new_request = navigator.mozAlarms.add(myDate, "ignoreTimezone", data);

                new_request.onsuccess = function () {
                    console.log("The alarm has been scheduled");
                };

                new_request.onerror = function () {
                    console.log("Error");
                };
            }
        }

        request.onerror = function () {
            console.log("Error getting Alarms");

        }

    }

}




//Initilazing Section

//Initilazing of Canvas Menu




var home_btn = document.getElementById('take_me_home');
home_btn.addEventListener('click', populate_home);
(document.getElementById("top")).addEventListener('click', function () {
    slideout.toggle()
});

if (navigator.mozSetMessageHandler) {

    navigator.mozSetMessageHandler("alarm", function (mozAlarm) {

        update_all();

        nanoajax.ajax('http://localhost:8080/feedy/t.php');

    });

}

function propogate_content(e) {
    var elm = e.target;

    if (elm.className != 'list') {
        elm = elm.parentElement;
    }

    location.hash = '';
    location.hash = '#/content/' + elm.dataset.source + '/' + elm.dataset.entry;
}


function display_article(source, entry) {

    var article = global_feeds[source].entries[entry];
    var article_title = article.title;
    var article_content = article.content;

    var feed_name = (source);
    var html = '<header id="top"><span id="top_title">' + feed_name + '</span></header>';
    document.getElementById('main').innerHTML = html;

    var article_elm = document.createElement('div');
    article_elm.setAttribute('id', 'article');

    var article_title_elm = document.createElement('h3');
    article_title_elm.setAttribute('id', 'content_title');
    article_title_elm.textContent = article_title;


    var article_content_elm = document.createElement('div');
    article_content_elm.setAttribute('id', 'content');
    article_content_elm.innerHTML = article_content;




    article_elm.appendChild(article_title_elm);
    article_elm.appendChild(article_content_elm);
    document.getElementById('main').appendChild(article_elm);



}


function addEventListenerList(list, event, fn) {
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}



var observer = new MutationObserver(function (mutations) {

    addEventListenerList(document.getElementById('main').querySelectorAll('img'), 'error', function (e) {

        e.target.src = './images/no_img.jpg';

    })

});



// configuration of the observer:
var config = {
    attributes: true,
    childList: true,
    characterData: true
};

// pass in the target node, as well as the observer options
observer.observe(document.getElementById('main'), config);




// Labs


function get64(source, width, height) {

    var canvas = document.createElement('canvas');

    canvas.height = height || 32;
    canvas.width = width || 32;

   var ctx = canvas.getContext('2d');

    ctx.drawImage(source, 0, 0);

    var imgData= canvas.toDataURL('image/png');
    console.log(imgData);
    canvas = null;
    return imgData;
}



function cache_icon(feed_name, source) {

    console.log('called me');
    
    var feeds = {};
    
    if(localStorage.feeds) {
        
    feeds =JSON.parse(localStorage.feeds);
    }
    
    if (feeds[feed_name].icon_type != 'local') {


        feeds[feed_name].icon = get64(source);
        feeds[feed_name].icon_type = 'local';
        localStorage.feeds = JSON.stringify(feeds);
    }
}


//var imgs = document.createElement('img');
//imgs.onload = function (e) {
//
//    console.log(get64(imgs));
//
//}
//
//imgs.crossOrgin = 'Anonymous';
//imgs.src = './images/no_img.jpg';