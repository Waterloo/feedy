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

    }
}


//This Function Returns the Source inside the first src attribut it finds even if it is not an Image , Needs Fixing
function parse_img(html_str) {
    
    reg = /\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/;
    return reg.exec(html_str);

}



/*function to fetech remote feed url , Takes feed url and a callback or a feed_name , if feed_name is given then it will call force_populate_feed with feed name as parameter
*/

function fetech_feed(url, feed_name) {

    var feeds = {};
    //Api URL
    
    fetch_url = 'http://localhost:8080/feedy/?url=' + encodeURIComponent(url);
    
    console.log(fetch_url);
    
    nanoajax.ajax(fetch_url, function (stat, code) {
        
    //if the ajax request was success    
        if (stat == 200) {
            
            console.log(code);
            console.log(stat);
            //            console.log(JSON.parse(code));
            code = JSON.parse(code);
            
            //checking weather the subscription exists , if it is there parse it to Object
            if (localStorage.feeds) {
                feeds = JSON.parse(localStorage.feeds);
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
    if (((cur_time > data.updated_time) / 900000) > 1 || data.updated_time == 0) {
        
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
        path = ((window.location.hash.replace('#', '')).split('/'))[2];
    }
    var hash = path;
    var follow_feeds = collection[hash].feeds;
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
    document.getElementById('category_head').style.backgroundImage = 'url(\'' + collection[hash].img + '\')';
    document.getElementById('category_title').textContent = hash;
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
                icon: collection[hash]['feeds'][feed_name].icon
            };
        } else if (e.target.dataset.state == 'followed') {
            e.target.dataset.state = 'follow';
            e.target.className = '';
            e.target.className = 'button';
            e.target.textContent = 'follow';
            delete feeds[feed_name];
        }
        localStorage.feeds = JSON.stringify(feeds);
    }
}

function populate_subscription() {
    var html = '';
    var feeds = JSON.parse(localStorage.feeds);
    for (feed_name in feeds) {
        if (feeds[feed_name]) {
            html += '<div class="menu_item" onclick="populate_feed(this.textContent.trim())"><img class="feed_favicon" src="' + feeds[feed_name]['icon'] + '" /> <span>' + feed_name + '</span></div>';
        }
    }
    document.getElementById('lists').innerHTML = html;
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

    }


}



