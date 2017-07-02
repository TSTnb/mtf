// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Survival/game.php*
// @include http://*tetrisfriends.com/games/Marathon/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none
// @run-at document-start
// @version 4.4.9
// @author morningpee
// ==/UserScript==

window.stop();

/*start fresh with html5 document */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

document.replaceChild(
        document.implementation.createHTMLDocument(document.title).documentElement,
        document.documentElement
);

function buildFlashVarsParamString()
{
    var flashVars = new Object();

    var flashVarsRequest = new XMLHttpRequest();
    flashVarsRequest.addEventListener("load", function(){ try{ haveFlashVars(this.responseText, flashVars); } catch(err){alert(err);} } );

    var ASYNCHRONOUS_REQUEST = true;
    flashVarsRequest.open('GET', location.protocol + '//' + location.host + '/users/ajax/profile_my_tetris_style.php', ASYNCHRONOUS_REQUEST);
    flashVarsRequest.send();
}

function buildContentFlash(flashVarsParamString)
{
    var contentFlash = document.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "gpu");
    contentFlash.setAttribute("flashvars", flashVarsParamString);
    contentFlash.setAttribute("quality", "low");
    contentFlash.setAttribute("salign", "tl"); /* Live in particular needs this */
    contentFlash.setAttribute("scale", "noscale");

    contentFlash.style.visibility = "hidden";

    return contentFlash;
}

function mtfInit()
{

    gameFileName = [];
    gameFileName['Ultra'] = 'OWGameUltra.swf';
    gameFileName['Sprint'] = 'OWGameSprint.swf';
    gameFileName['Survival'] = 'OWGameSurvival.swf';
    gameFileName['Marathon'] = 'OWGameMarathon.swf';
    gameFileName['Live'] = 'OWGameTetrisLive.swf';
    gameName = location.href.match(/games\/(.*)\/game.php/)[1];

    gameSize = [];
    gameSize['Ultra'] = [760, 560];
    gameSize['Sprint'] = [760, 560];
    gameSize['Survival'] = [760, 560];
    gameSize['Marathon'] = [760, 560];
    gameSize['Live'] = [946, 560];

    contentFlash.setAttribute("src", "http://www.tetrisfriends.com/data/games/" + gameName + "/" + gameFileName[ gameName ]);
    runOnContentFlashLoaded();
    addEventListener("resize", transformContentFlash );
    keepAlive();

    function runOnContentFlashLoaded()
    {
        var percentLoaded = "0";
        try{
            percentLoaded = contentFlash.PercentLoaded();

            /* this line will fail if it is not loaded */
            contentFlash.TGetProperty('/', 0);
        }
        catch(e){
            percentLoaded = "0";
        }

        if( percentLoaded != "100" )
           return setTimeout( runOnContentFlashLoaded, 300 );
        getContentFlashSize();

        scaleContentFlash();
        transformContentFlash();
    }


    function transformContentFlash()
    {
        contentFlash.style.visibility = "initial";
        var windowAspectRatio = innerHeight / innerWidth;

        var contentFlashAspectRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;

        var scaleFactorX;
        var scaleFactorY;

        if(  contentFlashAspectRatio > windowAspectRatio )
        {
            updatedWidth = Math.round( innerHeight / contentFlashAspectRatio );
            updatedHeight = innerHeight;
        }
        else
        {
            updatedWidth = innerWidth;
            updatedHeight = Math.round( innerWidth * contentFlashAspectRatio );
        }

        /* do not scale if it would be larger than the original size */
        correctedWidth = updatedWidth > gameSize[gameName][0]? gameSize[gameName][0]: updatedWidth;
        correctedHeight = updatedHeight > gameSize[gameName][1]? gameSize[gameName][1]: updatedHeight;

        scaleFactorX = correctedWidth / contentFlashSize.minimalWidth;
        scaleFactorY = correctedHeight / contentFlashSize.minimalHeight;

        contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 * scaleFactorX);
        contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 * scaleFactorY);

        contentFlash.style.marginLeft = -(correctedWidth / 2) + "px";
        contentFlash.style.marginTop = -((updatedHeight + correctedHeight) / 2) / 2 + "px";

        contentFlash.style.width = correctedWidth + "px";
        contentFlash.style.height = correctedHeight + "px";
        contentFlash.TSetProperty("/", contentFlashSize.T_PAN_X_INDEX, (contentFlashSize.minimalWidth - correctedWidth) / 2);
        contentFlash.TSetProperty("/", contentFlashSize.T_PAN_Y_INDEX, (contentFlashSize.minimalHeight - correctedHeight) / 2);
    }

    function keepAlive()
    {
        var keepAliveRequest = new XMLHttpRequest();
        var ASYNCHRONOUS_REQUEST = true;
        keepAliveRequest.open('GET', "/users/ajax/refresh_session.php", ASYNCHRONOUS_REQUEST);
        keepAliveRequest.send();
        setTimeout(keepAlive, 30 * 1000);
    }

    function getContentFlashSize()
    {
        contentFlashSize = new Object();

        contentFlashSize.T_PAN_X_INDEX = 0;
        contentFlashSize.T_PAN_Y_INDEX = 1;

        contentFlashSize.T_WIDTH_SCALE_INDEX = 2;
        contentFlashSize.T_HEIGHT_SCALE_INDEX = 3;

        contentFlashSize.T_WIDTH_INDEX = 8;
        contentFlashSize.T_HEIGHT_INDEX = 9;

        contentFlashSize.originalWidth = gameSize[gameName][0];
        contentFlashSize.originalHeight = gameSize[gameName][1];

        contentFlash.style.width = contentFlashSize.originalWidth + "px";
        contentFlash.style.height = contentFlashSize.originalHeight + "px";
    }

    function scaleContentFlash()
    {
        contentFlashSize.scaleFactor = 1;

        contentFlashSize.minimalWidth = contentFlashSize.originalWidth / contentFlashSize.scaleFactor;
        contentFlashSize.minimalHeight = contentFlashSize.originalHeight / contentFlashSize.scaleFactor;

        contentFlash.style.width = contentFlashSize.minimalWidth + "px";
        contentFlash.style.height = contentFlashSize.minimalHeight + "px";

        contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
        contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
    }
}

document.body.appendChild( document.createElement('style') ).textContent = '* { margin: 0; } :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; top: 50%; left: 50%; }';

buildFlashVarsParamString();

function haveFlashVars(responseText, flashVars)
{
    function getParameter(parameter){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == parameter){return pair[1];}
       }
       return '';
    };

    flashVars.startParam = "clickToPlay";

    flashVars.sessionId = responseText.match(/sessionId.*?:.*?encodeURIComponent\('(.*?)'\)/)[1];
    flashVars.sessionToken = responseText.match(/sessionToken.*?:.*?encodeURIComponent\('(.*?)'\)/)[1];
    flashVars.timestamp = responseText.match(/timestamp.*?:.*?(\d+)/)[1];
    flashVars.apiUrl = encodeURIComponent('http://api.tetrisfriends.com/api');

    var urlParameters = ['autoJoinRoomId', 'autoJoinRoomName'];
    for(i in urlParameters)
    {
        flashVars[ urlParameters[i] ] = getParameter( urlParameters[i] );
        if( flashVars[ urlParameters[i] ] === '' )
            delete flashVars[ urlParameters[i] ];
    }

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');

    document.body.appendChild( buildContentFlash( flashVarsParamString ) );
    /* necessary on firefox to access contentFlash.PercentLoaded() */
    document.body.appendChild( document.createElement("script") ).textContent = "(" + mtfInit + ")()";

}
