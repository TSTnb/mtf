// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/*
// @grant none
// @run-at document-end
// @version 4.6.3
// @author morningpee
// ==/UserScript==

/* if game mode */
if( location.pathname.match(/Ultra|Sprint|Survival|Marathon|Live/) !== null)
    mtfBootstrap();

function mtfBootstrap()
{
    contentFlash = document.getElementById('contentFlash');

    window.stop();

    /*start fresh with html5 document */
    document.doctype&&
        document.replaceChild( document.implementation.createDocumentType('html', '', ''), document.doctype );

    document.replaceChild(
        document.implementation.createHTMLDocument(document.title).documentElement,
        document.documentElement
    );

    document.body.appendChild( document.createElement('style') ).textContent = '* { margin: 0; } :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed, object { position: absolute; top: 50%; left: 50%; }';
    buildFlashVarsParamString();
}

function buildFlashVarsParamString()
{
    var flashVars = new Object();

    var flashVarsRequest = new XMLHttpRequest();
    flashVarsRequest.addEventListener('load', function(){ try{ haveFlashVars(this.responseText, flashVars); } catch(err){alert(err);} } );

    var ASYNCHRONOUS_REQUEST = true;
    flashVarsRequest.open('GET', location.href, ASYNCHRONOUS_REQUEST);
    flashVarsRequest.send();
}

function addParameter(flashObject, paramName, paramValue)
{
    var paramElement;
    var useExisting = false;
    var flashObjectChildren = flashObject.children;
    for(var flashIndex = 0; flashIndex < flashObjectChildren.length; flashIndex++)
        if(flashObjectChildren[flashIndex].name.toLowerCase() === paramName)
        {
            useExisting = true;
            paramElement = flashObjectChildren[flashIndex];
        }

    if(useExisting === false)
         paramElement = document.createElement("param")

    paramElement.setAttribute("name", paramName);
    paramElement.setAttribute("value", paramValue);
    flashObject.appendChild(paramElement);
}

function buildContentFlash(flashVarsParamString)
{
    addParameter(contentFlash, 'wmode', 'gpu');
    addParameter(contentFlash, 'quality', 'low');

    contentFlash.style.visibility = 'hidden';

    return contentFlash;
}

function haveFlashVars(responseText, flashVars)
{
    flashVars.startParam = 'clickToPlay';

    var rawFlashVars = responseText.match(/flashVars.*?=.*?({[\s\S]*?})/)[1];

    flashVars.sessionId = rawFlashVars.match(/sessionId.*?:.*?encodeURIComponent\('(.*?)'\)/)[1];
    flashVars.sessionToken = rawFlashVars.match(/sessionToken.*?:.*?encodeURIComponent\('(.*?)'\)/)[1];
    flashVars.timestamp = rawFlashVars.match(/timestamp.*?:.*?(\d+)/)[1];

    try{
        flashVars.friendUserIds = rawFlashVars.match(/friendUserIds.*?'((\d+,)*\d*)'/)[1];
        flashVars.blockedToByUserIds = rawFlashVars.match(/blockedToByUserIds.*?'((\d+,)*\d*)'/)[1];
    }catch(err)
    {
        /* If this failed, the user is not logged in. */
    }

    function getParameter(parameter){
       var query = window.location.search.substring(1);
       var vars = query.split('&');
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split('=');
               if(pair[0] === parameter){return pair[1];}
       }
       return '';
    };

    var urlParameters = ['autoJoinRoomId', 'autoJoinRoomName', 'das', 'ar'];
    for(i in urlParameters)
    {
        flashVars[ urlParameters[i] ] = getParameter( urlParameters[i] );
        if( flashVars[ urlParameters[i] ] === '' )
            delete flashVars[ urlParameters[i] ];
    }

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');

    buildContentFlash();
    document.body.appendChild( contentFlash );

    /* necessary on firefox to access contentFlash.PercentLoaded() */
    document.body.appendChild( document.createElement('script') ).textContent = '(' + mtfInit + ')()';
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

    correctSize = true;
    gameSize = [];
    gameSize['Ultra'] = [760, 560];
    gameSize['Sprint'] = [760, 560];
    gameSize['Survival'] = [760, 560];
    gameSize['Marathon'] = [760, 560];
    gameSize['Live'] = [946, 560];

    gameProductId = [];
    gameProductId['Ultra'] = 23;
    gameProductId['Sprint'] = 84;
    gameProductId['Survival'] = 12;
    gameProductId['Marathon'] = 10;

    runOnContentFlashLoaded();
    addEventListener('resize', transformContentFlash );
    keepAlive();

    function runOnContentFlashLoaded()
    {
        var percentLoaded = '0';
        try{
            /* this line will fail if it is not loaded */
            percentLoaded = contentFlash.PercentLoaded();

        }
        catch(e){
            percentLoaded = '0';
        }

        if( percentLoaded != '100' )
           return setTimeout( runOnContentFlashLoaded, 300 );
        getContentFlashSize();

        scaleContentFlash();
        transformContentFlash();
    }


    function transformContentFlash()
    {
        contentFlash.style.visibility = 'initial';
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
        correctedWidth = correctSize === true && updatedWidth > gameSize[gameName][0]? gameSize[gameName][0]: updatedWidth;
        correctedHeight = correctSize === true && updatedHeight > gameSize[gameName][1]? gameSize[gameName][1]: updatedHeight;

        scaleFactorX = correctedWidth / contentFlashSize.minimalWidth;
        scaleFactorY = correctedHeight / contentFlashSize.minimalHeight;

        contentFlash.style.marginLeft = -(correctedWidth / 2) + 'px';
        contentFlash.style.marginTop = -((updatedHeight + correctedHeight) / 2) / 2 + 'px';

        contentFlash.style.width = correctedWidth + 'px';
        contentFlash.style.height = correctedHeight + 'px';
    }

    function keepAlive()
    {
        var keepAliveRequest = new XMLHttpRequest();
        var ASYNCHRONOUS_REQUEST = true;
        keepAliveRequest.open('GET', '/users/ajax/refresh_session.php', ASYNCHRONOUS_REQUEST);
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

        contentFlash.style.width = contentFlashSize.originalWidth + 'px';
        contentFlash.style.height = contentFlashSize.originalHeight + 'px';
    }

    function scaleContentFlash()
    {
        contentFlashSize.scaleFactor = 1;

        contentFlashSize.minimalWidth = contentFlashSize.originalWidth / contentFlashSize.scaleFactor;
        contentFlashSize.minimalHeight = contentFlashSize.originalHeight / contentFlashSize.scaleFactor;

        contentFlash.style.width = contentFlashSize.minimalWidth + 'px';
        contentFlash.style.height = contentFlashSize.minimalHeight + 'px';
    }

    js_tetrisShowResults = function(results)
    {
        gameData = results.split(',').pop().match(/^(.*)<awards>/)[1];
        var gameReplayer = document.createElement('embed');
        gameReplayer.setAttribute('id', 'gameReplayer');
        gameReplayer.setAttribute('allowscriptaccess', 'always');
        gameReplayer.setAttribute('name', 'plugin');
        gameReplayer.setAttribute('type', 'application/x-shockwave-flash');
        gameReplayer.setAttribute('src', location.protocol + '//' + location.host + '/data/games/replayer/OWTetrisReplayWidget.swf');
        contentFlash = document.body.appendChild(gameReplayer);
        contentFlash.style.visibility = "hidden";

        correctSize = false;
        gameSize[gameName] = [616, 355];
        runOnReplayerLoaded(gameData);
    }

    runOnReplayerLoaded = function(gameData)
    {
        var percentLoaded = '0';
        try{
            /* this line will fail if it is not loaded */
            percentLoaded = contentFlash.PercentLoaded();
        }
        catch(e){
            alert(e);
            percentLoaded = '0';
        }

        if( percentLoaded != '100' )
           return setTimeout( function(){ runOnReplayerLoaded(gameData ) }, 50 );
        getContentFlashSize();
        contentFlash.as3_loadReplayer(gameProductId[gameName], location.protocol + '//' + location.host + '/data/games/' + gameName + '/' + gameName.toLowerCase() + 'WebsiteReplay.swf');
        contentFlash.as3_startReplay(gameData);
    }

    replayReady = function()
    {
        scaleContentFlash();
        /* if we don't wait to transform it, the replayer loads improperly */
        transformContentFlash();
        document.body.removeChild( document.getElementById('contentFlash') );
        contentFlash.style.visibility = "visible";
    }
}


document.addEventListener("readystatechange",
    function(){
        try{
            /* intrusive ads not handled by uBlock Origin */
            var ad = document.getElementById("home_custom_ad_container");
            ad.parentNode.removeChild(ad);
            document.getElementById("container").getElementsByTagName("iframe")[0].parentNode.textContent = "";
        }catch(err){}
    }
);
