    /**
 * Created by kcamilleri on 01/07/2016.
 */
$(document).ready(
    loadLinkList(),
    loadLocalStorage(),
    setCurrentTime(),
    setWeather(),
    getBackground(),
    setInterval(setCurrentTime, 60000),
    getDailyQuote(),
	$('addToLinkList').on('click', addToLinkList()),
	$('addToLinkList').on('click', resetLinkList())
	
);



var data = [
    {
        "name": "Reddit",
        "url": "http://www.reddit.com",
        "tag": "play",
        "favicon": "https://plus.google.com/_/favicon?domain_url=http://www.reddit.com/"
    },
    {
        "name": "Times Of Malta",
        "url": "http://www.timesofmalta.com",
        "tag": "play",
        "favicon": "https://plus.google.com/_/favicon?domain_url=http://www.timesofmalta.com/"
    }
];

function setBackground(url){
    document.body.style.background = "#f3f3f3 url('"+ url +" ') no-repeat right top";
}
function setBackgroundColor(color){
    //$('.main').css('background', color);
    $('.default-item').css('background', color);
}

function setDailyQuote(quote){
    //$("#quote").append(quote.content + "<p>— " + quote.title + "</p>");
    $("#quote").append('"'+quote.content.replace(/<\/?[^>]+(>|$)/g, '').trim() + '" -<i>' + quote.title + '</i>');
    jQuery("#quote").fitText(4.0);

    //https://github.com/STRML/textFit TEXTFIT WHICH WORKS WITH FLEXBOX
}

function loadLocalStorage(){
    //backgroundColor
    //backgroundUrl
    //data
    if(localStorage.backgroundUrl !== undefined){
        var image = localStorage.getItem('backgroundUrl');
        setBackground(image);

        if(localStorage.backgroundColor !== undefined){
            var color = localStorage.backgroundColor;
            setBackgroundColor(color);
        }
    }
    if(localStorage.dailyQuote !== undefined){
        var quote = JSON.parse(localStorage.dailyQuote);
        setDailyQuote(quote);
    }
}

function getDailyQuote(){
    $.ajax({
        url: "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&callback=",
        dataType: 'json',
        async: false,
        success: function(a) {
            var content = JSON.stringify(a[0].content);
            if(content.length > 250){
                //alert("TooLong");
                return getDailyQuote();
            }
            var title = JSON.stringify(a[0].title);

            content = content.replace('<[^>]*>', '').replace('"','').replace('"','').replace('\\n'," ");
            title = title.replace('<[^>]*>', '').replace('"','').replace('"','').replace('\\n'," ");

            var quote = '{ "content": "'+content+'", "title": "'+title+'"}';

            localStorage.setItem('dailyQuote', quote);
        }
    });

/*
    $.getJSON("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&callback=", function(a) {
        var content = JSON.stringify(a[0].content);
        if(content.length > 250){
            alert("TooLong");
            return getDailyQuote();
        }
        var title = JSON.stringify(a[0].title);

        content = content.replace('<[^>]*>', '').replace('"','').replace('"','').replace('\\n'," ");
        title = title.replace('<[^>]*>', '').replace('"','').replace('"','').replace('\\n'," ");

        var quote = '{ "content": "'+content+'", "title": "'+title+'"}';

        localStorage.setItem('dailyQuote', quote);
    });
*/
}

function setCurrentTime(){
    var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var currentTime = new Date();

    //var currentYear = currentTime.getFullYear();
    var currentMonth = months[currentTime.getMonth()];
    var currentDay = weekdays[currentTime.getDay()];
    var currentDate = currentTime.getDate();

    var hour = currentTime.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    var min  = currentTime.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    var time = $('#time');
    time.empty();

    var date = $('#date');
    date.empty();

    time.append(hour + ":" + min);
    date.append(currentDay + "<br/> " + ordinalSuffix(currentDate) + " " + currentMonth);
}

function loadLinkList(){
    var storedData = localStorage.getItem('data');

    if(storedData !== 'undefined'){
        generateLinkList(JSON.parse(storedData));
    }
}

function generateLinkList(dataList) {
    $('.added-item').remove();
    var listContainer = $('#listContainer');

    if(dataList){
        for(i = 0;i < dataList.length; i++ ){
            var color = localStorage.getItem('color-'+dataList[i].name);
            var colorSplit = color.split(', ');
            var listItem = document.createElement('a');
            $(listItem).attr('class', 'item added-item pixelated');
            $(listItem).css('background-color', color);
            $(listItem).css('background-image', 'url(' + dataList[i].favicon + ')');
            $(listItem).css('background-size', '35%');
            $(listItem).css('background-position', 'bottom right');
            $(listItem).css('background-repeat', 'no-repeat');

            $(listItem).attr('href', dataList[i].url);
            $(listItem).text(dataList[i].name);
            //$(listItem).append('<img width=32 height=32 id="'+i+'" src="'+ dataList[i].favicon+ '"/>');

            listContainer.append(listItem);
        }
    }

/*    $('.item').each(function (){
        $(this).fitText(0.5);
    })*/
    jQuery(".item").fitText(0.5);
}

function resetLinkList(){
    window.localStorage.clear();

    localStorage.setItem('color-Times Of Malta',  "rgb(39, 37, 41)");
    localStorage.setItem('color-Reddit',  "rgb(206, 198, 198)");

    localStorage.setItem('data',  JSON.stringify(data));
}

function addToLinkList(){
    var name = prompt("Name");
    var url = prompt("URL");
    var tag = prompt("Tag");

    // Parse existing link information from localStorage
    var storedData = localStorage.getItem('data');
    console.log(storedData);

    if(url.indexOf('http://') != 0 || url.indexOf('https://') != 0){
        url = "http://" + url;
    }

    var favicon = getFavicon(url);
    var color = setPrimaryColor(favicon, name);

    // Convert parameters to JSON format
    jsonInput = ',{"name": "' + name + '", "url": "' + url + '", "tag": "' + tag + '", "favicon": "' + favicon + '"}';
    var index = storedData.lastIndexOf(']');
    // Include JSON into existing link information
    var retrievedObject = storedData.slice(0, index) + jsonInput + storedData.slice(index, storedData.length);
    console.log(storedData);

    // Overwrite existing JSON data in local storage
    localStorage.setItem('data', retrievedObject);

    generateLinkList(JSON.parse(retrievedObject));
}


function getFavicon(url){
    return 'https://plus.google.com/_/favicon?domain_url=' + url;
}

function launchAllTagged(tag){

}

function getBackground(setBackgroundFunction){

    var fullUrl = "";

    //BING BACKGROUND OF THE DAY
    //UNSPLASH IS A POTENTIAL ALTERNATIVE TO BING
    $.ajax({
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US&JsonType=callback?',
        success: function(result){
            var url = result.images[0].url;
            fullUrl = 'http://www.bing.com' + url;
            getBackgroundColor(fullUrl);
            //getBase64FromImageUrl(fullUrl);
            console.log(fullUrl);
            if(localStorage.backgroundUrl === undefined){
                setBackground(fullUrl);
            }
            localStorage.setItem('backgroundUrl', fullUrl);
        }
    });
}

function getBackgroundColor(url){
    var img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var colorThief = new ColorThief();
        var color = colorThief.getColor(img);
        if(localStorage.backgroundColor === undefined){
            setBackgroundColor(color);
        }
        localStorage.setItem('backgroundColor', 'rgb('+color+')');
    };
    img.src = url;
}

function setPrimaryColor(url, name){
    var img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var colorThief = new ColorThief();
        var color = colorThief.getColor(img);
        alert(color);
        localStorage.setItem('color-' + name,  'rgb('+color+')');
    };
    img.src = url;
}

// Too slow - needs differnt solution
function getBase64FromImageUrl(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =32; //Too slow unfortunately
        canvas.height =32;

        var ctx = canvas.getContext("3d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/jpg");
        var index = 0;

        var compressed = LZString.compress(dataURL);
        alert(compressed.length);
        localStorage.setItem('compressed', compressed);
        console.log(LZString.decompress(localStorage.getItem('compressed')));
    };

    img.src = url;
}


//Docs at http://simpleweatherjs.com v3.1.0
function setWeather() {
    $.simpleWeather({
        location: 'Sliema, MT',
        //location: 'NY',
        woeid: '',
        unit: 'c',
        success: function(weather) {
            var weatherIcon = setWeatherIcon(weather.code);
            //html = '<h2>'+ weatherIcon + ' ' + weather.temp+'&deg;'+weather.units.temp+ ', ' + weather.currently + '</h2>'; //+ ', ' +weather.wind.speed+' '+weather.units.speed+'</h2>';

            $("#weatherIcon").html(weatherIcon);
            $("#weatherTemp").html( weather.temp+'&deg');
            $("#weatherText").html( weather.currently);

        },
        error: function(error) {
            $("#weather").html('<p>'+error+'</p>');
        }
    });
};

function ordinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

$('#searchBox').on('input', function(){
    var searchBox = $('#searchBox');
    var searchValue = searchBox.val();

    if(searchValue.length > 0){
        var suggestions = [];
        $.ajax({
            //http://stackoverflow.com/questions/3178777/get-google-search-suggestions-while-entering-text
            url: "http://toolbarqueries.google.com/complete/search?q=" + searchValue + "&output=toolbar&hl=en",
            dataType: "xml",
            success: function (data) {
                //console.log(data);
                data = (new XMLSerializer()).serializeToString(data);
                var startIndex = 0;
                var endIndex = 0;
                while(startIndex !== -1 && suggestions.length < 4){
                    startIndex = data.indexOf('suggestion data="', startIndex + 1);
                    if(startIndex !== -1){
                        endIndex = data.indexOf('"/>', startIndex);
                        suggestions.push(data.substring(startIndex+17, endIndex));
                    }
                }
                for(var i = 0; i< suggestions.length; i++){
                    console.log(suggestions[i]);
                }
            }
        });

        var options = { data : suggestions }

        searchBox.easyAutocomplete(options);
        searchBox.focus();
    }
});


$('#searchBox').on('change', function() {
    var searchBox = $('#searchBox');
    var searchLabel = $('#searchLabel');

    if(searchBox.val().length > 0 && !searchLabel.hasClass('is-filled')){
        searchLabel.addClass('is-filled');
        searchBox.addClass('is-filled-input');

    }else if(searchBox.val().length < 1 && searchLabel.hasClass('is-filled')){
        searchLabel.removeClass('is-filled');
        searchBox.removeClass('is-filled-input');

    }
});


function setWeatherIcon(condid) {
    var icon = '';
    switch(condid) {
        case '0': icon  = 'wi-tornado';
            break;
        case '1': icon = 'wi-storm-showers';
            break;
        case '2': icon = 'wi-tornado';
            break;
        case '3': icon = 'wi-thunderstorm';
            break;
        case '4': icon = 'wi-thunderstorm';
            break;
        case '5': icon = 'wi-snow';
            break;
        case '6': icon = 'wi-rain-mix';
            break;
        case '7': icon = 'wi-rain-mix';
            break;
        case '8': icon = 'wi-sprinkle';
            break;
        case '9': icon = 'wi-sprinkle';
            break;
        case '10': icon = 'wi-hail';
            break;
        case '11': icon = 'wi-showers';
            break;
        case '12': icon = 'wi-showers';
            break;
        case '13': icon = 'wi-snow';
            break;
        case '14': icon = 'wi-storm-showers';
            break;
        case '15': icon = 'wi-snow';
            break;
        case '16': icon = 'wi-snow';
            break;
        case '17': icon = 'wi-hail';
            break;
        case '18': icon = 'wi-hail';
            break;
        case '19': icon = 'wi-cloudy-gusts';
            break;
        case '20': icon = 'wi-fog';
            break;
        case '21': icon = 'wi-fog';
            break;
        case '22': icon = 'wi-fog';
            break;
        case '23': icon = 'wi-cloudy-gusts';
            break;
        case '24': icon = 'wi-cloudy-windy';
            break;
        case '25': icon = 'wi-thermometer';
            break;
        case '26': icon = 'wi-cloudy';
            break;
        case '27': icon = 'wi-night-cloudy';
            break;
        case '28': icon = 'wi-day-cloudy';
            break;
        case '29': icon = 'wi-night-cloudy';
            break;
        case '30': icon = 'wi-day-cloudy';
            break;
        case '31': icon = 'wi-night-clear';
            break;
        case '32': icon = 'wi-day-sunny';
            break;
        case '33': icon = 'wi-night-clear';
            break;
        case '34': icon = 'wi-day-sunny-overcast';
            break;
        case '35': icon = 'wi-hail';
            break;
        case '36': icon = 'wi-day-sunny';
            break;
        case '37': icon = 'wi-thunderstorm';
            break;
        case '38': icon = 'wi-thunderstorm';
            break;
        case '39': icon = 'wi-thunderstorm';
            break;
        case '40': icon = 'wi-storm-showers';
            break;
        case '41': icon = 'wi-snow';
            break;
        case '42': icon = 'wi-snow';
            break;
        case '43': icon = 'wi-snow';
            break;
        case '44': icon = 'wi-cloudy';
            break;
        case '45': icon = 'wi-lightning';
            break;
        case '46': icon = 'wi-snow';
            break;
        case '47': icon = 'wi-thunderstorm';
            break;
        case '3200': icon = 'wi-cloud';
            break;
        default: icon = 'wi-cloud';
            break;
    }

    return '<i class="wi '+icon+'"></i>';
}
