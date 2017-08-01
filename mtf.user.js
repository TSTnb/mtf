// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/*
// @grant none
// @run-at document-end
// @version 4.7.8
// @author morningpee
// ==/UserScript==

/* if game mode */
chrome.storage.onChanged.addListener(
    function(changes, namespace)
    {
        if( changes.downscaleValue ) {
            downscaleValue = changes.downscaleValue.newValue;
            window.onresize(downscaleValue);
        }
    }
);

if( location.pathname.match(/\/games\/.*\/game\.php.*/) !== null)
{
    try {
        chrome.storage.sync.get('downscaleValue',
            function(chromeStorage)
            {
                downscaleValue = chromeStorage.downscaleValue;
                mtfBootstrap();
            }
        );
    } catch(err) {
        /* if running as a userscript */
        mtfBootstrap();
    }
}

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

    document.body.appendChild( document.createElement('style') ).textContent = '* { margin: 0; } :root{ image-rendering: optimizeSpeed; image-rendering: -moz-crisp-edges; image-rendering: -o-crisp-edges; image-rendering: -webkit-optimize-contrast; image-rendering: pixelated; image-rendering: optimize-contrast; -ms-interpolation-mode: nearest-neighbor; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed, object, #contentFlash { transform-origin: top left; position: absolute; top: 50%; left: 50%; visibility: initial !important; }';
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
        if(flashObjectChildren[flashIndex].name && flashObjectChildren[flashIndex].name.toLowerCase() === paramName)
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
    addParameter(contentFlash, 'quality', 'low');
    if(location.href.match(/games\/(.*)\/game.php/)[1] !== 'NBlox')
        addParameter(contentFlash, 'scale', 'noscale');

    /* windows npapi flash cannot handle css transforms + wmode gpu */
    if(downscaleValue > 1 && navigator.userAgent.match(/windows.*firefox/i) !== null) {
        addParameter(contentFlash, 'wmode', 'opaque');
    } else {
        addParameter(contentFlash, 'wmode', 'gpu');
    }

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
    document.body.appendChild( document.createElement('script') ).textContent = '(' + mtfInit + ')(' + downscaleValue + ')';
}

function mtfInit(downscaleValue)
{

    gameFileName = [];
    gameFileName['Ultra']    = 'OWGameUltra.swf';
    gameFileName['Sprint']   = 'OWGameSprint.swf';
    gameFileName['Survival'] = 'OWGameSurvival.swf';
    gameFileName['Marathon'] = 'OWGameMarathon.swf';
    gameFileName['Live']     = 'OWGameTetrisLive.swf';
    gameFileName['Battle2P'] = 'OWGameBattle2pMaps.swf';
    gameFileName['Battle6P'] = 'OWGameBattle6P.swf';
    gameFileName['Sprint5P'] = 'OWGameSprint5p.swf';
    gameFileName['Rally8P']  = 'OWRally8P.swf';
    gameFileName['Mono']     = 'OWGameColorBlind.swf';
    gameFileName['NBlox']    = 'OWGameNBlox.swf';

    gameName = location.href.match(/games\/(.*)\/game.php/)[1];

    correctSize = true;
    gameSize = [];
    gameSize['Ultra']       = [760, 560];
    gameSize['Sprint']      = [760, 560];
    gameSize['Survival']    = [760, 560];
    gameSize['Marathon']    = [760, 560];
    gameSize['Live']        = [946, 560];
    gameSize['Battle2P']    = [760, 560];
    gameSize['Battle6P']    = [760, 560];
    gameSize['Sprint5P']    = [760, 560];
    gameSize['Rally8P']     = [760, 560];
    gameSize['Mono']        = [760, 560];
    gameSize['NBlox']       = [760, 560];

    gameProductId = [];
    gameProductId['Ultra']      = 23;
    gameProductId['Sprint']     = 84;
    gameProductId['Survival']   = 12;
    gameProductId['Marathon']   = 10;
    gameProductId['Battle2P']   = 100;
    gameProductId['Battle6P']   = 86;
    gameProductId['Sprint5P']   = 101;
    gameProductId['Rally8P']    = 4;
    gameProductId['Mono']       = 102;
    gameProductId['NBlox']      = 85;

    gameReplayerName = [];
    gameReplayerName['Ultra']       = 'ultraWebsiteReplay.swf';
    gameReplayerName['Sprint']      = 'sprintWebsiteReplay.swf';
    gameReplayerName['Survival']    = 'survivalWebsiteReplay.swf';
    gameReplayerName['Marathon']    = 'marathonWebsiteReplay.swf';
    gameReplayerName['Battle2P']    = 'battleWebsiteReplay.swf';
    gameReplayerName['Battle6P']    = 'battle6PWebsiteReplay.swf';
    gameReplayerName['Sprint5P']    = 'sprint_5PWebsiteReplay.swf';
    gameReplayerName['Mono']        = 'colorblindWebsiteReplay.swf';

    gameNumberAIPlayers = [];
    gameNumberAIPlayers['Ultra']    = 0;
    gameNumberAIPlayers['Sprint']   = 0;
    gameNumberAIPlayers['Survival'] = 0;
    gameNumberAIPlayers['Marathon'] = 0;
    gameNumberAIPlayers['Battle2P'] = 1;
    gameNumberAIPlayers['Battle6P'] = 5;
    gameNumberAIPlayers['Sprint5P'] = 4;
    gameNumberAIPlayers['Rally8P']  = 0; //Rally8P does not support replays
    gameNumberAIPlayers['Mono']     = 0;

    function runOnContentFlashLoaded()
    {
        /*assume loaded, since we just copy it from the page*/
        var percentLoaded = "0";
        try{
            percentLoaded = contentFlash.PercentLoaded();

            /* this line will fail if it is not loaded */
            if(gameName !== 'NBlox')
                contentFlash.TGetProperty('/', 0);
        }
        catch(e){
            percentLoaded = "0";
        }

        if( percentLoaded != "100" )
           return setTimeout( runOnContentFlashLoaded, 300 );

        getContentFlashSize();

        try {
            scaleContentFlash();
        } catch(err) {
            alert(err);
        }
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

        contentFlashSize.correctedWidth = contentFlashSize.originalWidth;
        contentFlashSize.correctedHeight = contentFlashSize.originalHeight;

        contentFlash.style.width = contentFlashSize.originalWidth + 'px';
        contentFlash.style.height = contentFlashSize.originalHeight + 'px';
    }

    transformContentFlash = function()
    {
        contentFlash.style.transformStyle = 'preserve-3d';
        contentFlash.style.transform = "scale3d( " + contentFlashSize.scaleFactor + "," + contentFlashSize.scaleFactor + "," + contentFlashSize.scaleFactor + " )";
    }

    noTransformContentFlash = function()
    {
        contentFlash.style.transformStyle = '';
        contentFlash.style.transform = '';
    }

    scaleContentFlash = function(scaleFactor)
    {
        scaleFactor = parseInt(scaleFactor)
        if(typeof scaleFactor === 'number' && isNaN(scaleFactor) === false)
        {
            downscaleValue = scaleFactor;
        }

        contentFlashSize.scaleFactor = downscaleValue;

        contentFlashSize.minimalWidth = contentFlashSize.correctedWidth / contentFlashSize.scaleFactor;
        contentFlashSize.minimalHeight = contentFlashSize.correctedHeight / contentFlashSize.scaleFactor;

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
        contentFlashSize.correctedWidth = correctSize === true && updatedWidth > gameSize[gameName][0]? gameSize[gameName][0]: updatedWidth;
        contentFlashSize.correctedHeight = correctSize === true && updatedHeight > gameSize[gameName][1]? gameSize[gameName][1]: updatedHeight;

        contentFlashSize.correctedScaleFactor = contentFlashSize.scaleFactor * (contentFlashSize.originalWidth / contentFlashSize.correctedWidth);

        scaleFactorX = contentFlashSize.correctedWidth / contentFlashSize.minimalWidth;
        scaleFactorY = contentFlashSize.correctedHeight / contentFlashSize.minimalHeight;

        contentFlash.style.width = (contentFlashSize.correctedWidth / contentFlashSize.scaleFactor) + 'px';
        contentFlash.style.height = (contentFlashSize.correctedHeight / contentFlashSize.scaleFactor)+ 'px';

        contentFlash.style.marginLeft = -(contentFlashSize.correctedWidth / 2) + 'px';
        contentFlash.style.marginTop = -((updatedHeight + contentFlashSize.correctedHeight) / 2) / 2 + 'px';

        if(gameName !== 'NBlox')
        {
            contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 / contentFlashSize.correctedScaleFactor);
            contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 / contentFlashSize.correctedScaleFactor);

            contentFlash.TSetProperty("/", contentFlashSize.T_PAN_X_INDEX, contentFlashSize.originalWidth / contentFlashSize.correctedScaleFactor * (contentFlashSize.correctedScaleFactor - 1) / 2);
            contentFlash.TSetProperty("/", contentFlashSize.T_PAN_Y_INDEX, contentFlashSize.originalHeight / contentFlashSize.correctedScaleFactor * (contentFlashSize.correctedScaleFactor - 1) / 2);
        }


        if(downscaleValue > 1) {
            transformContentFlash();
        }else {
            noTransformContentFlash();
        }
    }

    js_tetrisShowResults = function(results)
    {

        var aiNames = [];
        var aiAvatars = [];

        if( gameReplayerName[gameName] === undefined )
            return;

        var resultsArray = results.split(",");
        var currentRank = resultsArray[1].split("&")[0];

        if( gameNumberAIPlayers[gameName] === 0 )
            gameData = results.split(',').pop().match(/^(.*)<awards>/)[1];
        else
        {
            gameData = []
            var currentSubject;
            for(var i = 0; i < resultsArray.length; i++)
                {
                    try{
                        currentSubject = resultsArray[i].match(/^([^<]+)<?/)[1];
                        if( currentSubject.length < 20)
                            continue;
                        atob(currentSubject);
                        gameData.push(currentSubject);
                        if( gameData.length > 1)
                        {
                            aiNames.push(resultsArray[i - 2]);
                            aiAvatars.push("/data/images/avatars/40X40/" + resultsArray[i - 1]);
                        }
                    }catch(err){}
                }

        }


        var gameReplayer = document.createElement('embed');
        gameReplayer.setAttribute('id', 'gameReplayer');
        gameReplayer.setAttribute('allowscriptaccess', 'always');
        gameReplayer.setAttribute('name', 'plugin');
        gameReplayer.setAttribute('type', 'application/x-shockwave-flash');
        gameReplayer.setAttribute('src', location.protocol + '//' + location.host + '/data/games/replayer/' + (gameNumberAIPlayers[gameName] === 0? 'OWTetrisReplayWidget.swf': 'OWTetrisMPReplayWidget.swf') );
        contentFlash = document.body.appendChild(gameReplayer);

        correctSize = false;
        gameSize[gameName] = [616, 355];
        runOnReplayerLoaded(gameData, currentRank, aiNames, aiAvatars);
    }

    getLastMatch = function(playerRegex, playerSubject)
    {
        var returnValue;
        while( matches = playerRegex.exec(playerSubject) )
        {
            returnValue = matches.reverse()[1]
        }
        return returnValue;
    }


    runOnReplayerLoaded = function(gameData, currentRank, aiNames, aiAvatars)
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
           return setTimeout( function(){ runOnReplayerLoaded(gameData, currentRank, aiNames, aiAvatars) }, 50 );
        getContentFlashSize();

        var loadReplayerArguments = [gameProductId[gameName] + "", location.protocol + '//' + location.host + '/data/games/' + gameName + '/' + gameReplayerName[gameName]];

        if( gameNumberAIPlayers[gameName] === 0 )
            contentFlash.as3_loadReplayer(loadReplayerArguments[0], loadReplayerArguments[1]);
        else
            contentFlash.as3_loadReplayer(loadReplayerArguments[0], loadReplayerArguments[1], gameNumberAIPlayers[gameName]);

        if( gameNumberAIPlayers[gameName] === 0 )
            return contentFlash.as3_startReplay(gameData);

        var avatarPrefix = "/data/images/avatars/40X40/"
        var playerName = getLastMatch(/username\s+=\s+("|')([^"']+)("|')/g, (tetrisShowResults + ""));
        var playerAvatar = avatarPrefix + getLastMatch(/userAvatar\s+=\s+("|')([^"']+)("|')/g, (tetrisShowResults + ""));

        var aiGameData = [];

        for(var i = 0; i < gameNumberAIPlayers[gameName]; i++)
        {
            aiGameData.push( gameData[i + 1] );
        }

        contentFlash.as3_startReplay(gameData[0], playerName, playerAvatar, currentRank, currentRank, aiGameData, aiNames, aiAvatars);
    }

    replayReady = function()
    {
        downscaleValue = 1;
        scaleContentFlash();
        document.body.removeChild( document.getElementById('contentFlash') );
        contentFlash.style.visibility = "visible";
    }

    runOnContentFlashLoaded();
    window.onresize = scaleContentFlash;
    keepAlive();
}

    function loadGame()
    {
        var gameLoading = document.getElementsByClassName("game_loading")[0];
        gameLoading.parentNode.removeChild(gameLoading);
        document.getElementById("game_container").style.height = "auto";
        document.getElementById("contentFlash").style.visibility = "visible";
    }

document.addEventListener("readystatechange",
    function(){
        try{
            /* intrusive ads not handled by uBlock Origin */
            var ad = document.getElementById("home_custom_ad_container");
            ad.parentNode.removeChild(ad);
            document.getElementById("container").getElementsByTagName("iframe")[0].parentNode.textContent = "";
            loadGame();
        }catch(err){}
    }
);
