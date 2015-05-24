
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
    
    
    
    function parse_img(html_str) {

            reg = /\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/;

            return reg.exec(html_str);


        }

        function fetech_feed(url) {

            var feeds = {};

            nanoajax.ajax(url, function (stat, code) {
                console.log(code = JSON.parse(code));
                if (stat == 200) {
                    var time = new Date;
                    if (localStorage.feeds) {


                        feeds = JSON.parse(localStorage.feeds);


                    }

                    var tit = code.responseData.feed.title;

                    console.log(tit);

                    feeds[tit] = {
                        entries: code.responseData.feed.entries,
                        updated_time: time.getTime(),
                        feed_url: url
                    }

                    localStorage.feeds = JSON.stringify(feeds);

                }




            });



        }



        function populate_feed(feed_name) {
            var feed_name = (feed_name);
            var html = '<header id="top"><span id="top_title">' + feed_name + '</span></header>';
            document.getElementById('main').innerHTML = html;
            var data = (JSON.parse(localStorage.feeds));

            data = (data[feed_name]);

            var list = {
                feed_title: [],
                feed_img: []
            };


            var tmp;

            var temp;
            var count = data.entries.length

            for (var i = 0; i < count; i++) {

               elm =document.createElement('div');
                elm.setAttribute('class','list');


                temp = parse_img(data.entries[i].content);

                if (temp) {

                    //tmp = {src: temp[0]}

                    list.feed_img.push(temp[0])

                }

                if (temp) {
                    temp[0] = (temp[0]).replace('"', '');
                    temp[0] = (temp[0]).replace('"', '');
                    temp[0] = (temp[0]).replace('src=', '');
                } else {
                    temp = "";

                }

                //console.log( temp[0].replace('src='));
                var img = document.createElement('img');
                setAttributes(img,{"src" : temp[0], "class": "feed_img"});
                
                var feed_title = document.createElement('span');
                feed_title.setAttribute("class","feed_title");
                feed_title.textContent = data.entries[i].title;
//                html += '<img class="feed_img"  src="' + temp[0] + '">';
//
//                html += '<span class="feed_title">' + data.entries[i].title + '</span></div>';

                elm.appendChild(img);
                elm.appendChild(feed_title);
                
 document.getElementById('main').appendChild(elm);
                
            }



//            document.getElementById('main').innerHTML = html;


            return list;
        }

        function populate_subscription() {
            var html = '';
            var feeds = JSON.parse(localStorage.feeds);

            for (feed_name in feeds) {

                if (feeds[feed_name]) {

                    html += '<div class="menu_item" onclick="populate_feed(this.textContent.trim())"><img class="feed_favicon" src="./images/pebble.png"/> <span>' + feed_name + '</span></div>';

                }

            }

            document.getElementById('lists').innerHTML = html;


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


        function show_add_feed() {

           

        }





function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}