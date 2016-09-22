// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none
// @run-at document-start
// @version 4.2.5 Firefox-only
// @author morningpee
// ==/UserScript==


window.stop();

/*start fresh with html5 document */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

document.replaceChild(
        document.implementation.createHTMLDocument( document.title ).documentElement,
        document.documentElement
);

function buildFlashVarsParamString()
{
    var flashVars = new Object();
    flashVars.apiUrl = "http://api.tetrisfriends.com/api";
    flashVars.startParam = "clickToPlay";

	if( gameName === "Live" )
		flashVars.isPrerollEnabled = "true";

    var flashVarsRequest = new XMLHttpRequest();
    flashVarsRequest.addEventListener("load", function(){ try{ haveFlashVars(this.responseText, flashVars); } catch(err){alert(err);} } );

    var ASYNCHRONOUS_REQUEST = true;
    flashVarsRequest.open('GET', '/users/ajax/profile_my_tetris_style.php?id=1', ASYNCHRONOUS_REQUEST);
    flashVarsRequest.send();
}

function getContentFlashSize()
{
    contentFlashSize = new Object();

    contentFlashSize.T_WIDTH_SCALE_INDEX = 2;
    contentFlashSize.T_HEIGHT_SCALE_INDEX = 3;

    contentFlashSize.T_WIDTH_INDEX = 8;
    contentFlashSize.T_HEIGHT_INDEX = 9;

	/* canvas size is off \: */
	if( gameName === "Live" )
		contentFlashSize.originalWidth = 946;
	else
		contentFlashSize.originalWidth = contentFlash.TGetProperty('/', contentFlashSize.T_WIDTH_INDEX);

    contentFlashSize.originalHeight = contentFlash.TGetProperty('/', contentFlashSize.T_HEIGHT_INDEX);

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

function showContentFlash()
{
	if( gameName === "Live" )
		contentFlash.as3_prerollDone();

    contentFlash.style.visibility = "initial";
}

function computeContentFlashScale()
{
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

    return { width: updatedWidth, height: updatedHeight };
}

function resizeContentFlash()
{
    var contentFlashDimensions = computeContentFlashScale();
    contentFlash.style.width = contentFlashDimensions.width + "px";
    contentFlash.style.height = contentFlashDimensions.height + "px";

}

function transformContentFlash()
{
    var contentFlashDimensions = computeContentFlashScale();

    scaleFactorX = updatedWidth / contentFlashSize.minimalWidth;
    scaleFactorY = updatedHeight / contentFlashSize.minimalHeight;

    /*we need to use translate3d instead of translate for 3d acceleration*/
    contentFlash.style.transform = "scale3d( " + scaleFactorX + "," + scaleFactorX + "," + scaleFactorX + " ) translate3d(-50% , -50% , 0px)";
}

function buildContentFlash(flashVarsParamString)
{
    var contentFlash = document.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "direct");
    contentFlash.setAttribute("flashvars", flashVarsParamString);
    contentFlash.setAttribute("quality", "low");
    contentFlash.setAttribute("salign", "tl"); /* Live in particular needs this */
    contentFlash.setAttribute("scale", "noborder");

    contentFlash.style.visibility = "hidden";

    return contentFlash;
}

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

    var isFirefox = navigator.userAgent.search(/webkit/i) == -1;
    if( isFirefox )
    {
        scaleContentFlash();
        transformContentFlash();
		addEventListener("resize", transformContentFlash );
    }
	else
	{
		resizeContentFlash();
		addEventListener("resize", resizeContentFlash );
	}

    showContentFlash();
}

function mtfInit()
{
    contentFlash.LoadMovie(0, "http://www.tetrisfriends.com/data/games/" + gameName + "/" + getGameFileName( gameName ) );
    runOnContentFlashLoaded();
}

function getGameFileName( gameName )
{
	var gameFileName;

	var gameFileNames =
		{ 	 Battle2P:		"OWGameBattle2pMaps.swf"
			,ColorFull:		"OWGameColorBlind.swf"
			,Live:			"OWGameTetrisLive.swf"
			,Mono:			"OWGameColorBlind.swf"
			,NBlox:			"nbloxWebsite.swf"
			,Sprint5P:		"OWGameSprint5p.swf"
			,TetrisConnect:	"OWGameConnect.swf"
		};

	if( typeof gameFileNames[ gameName ] === "string" )
		gameFileName = gameFileNames[ gameName ];
	else
		gameFileName = "OWGame" + gameName + ".swf";

	return gameFileName;
}

gameName = location.href.match(/games\/(.*)\/game.php/)[1];

document.body.appendChild( document.createElement('style') ).innerHTML = '* { margin: 0; } :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; transform-style: preserve-3d; transform-origin: top left; top: 50%; left: 50%; transform: translate3d( -50%, -50%, 0 ); width: 100%; height: 100%; }';

buildFlashVarsParamString();

function haveFlashVars(responseText, flashVars)
{
    flashVars = Object.assign( flashVars, eval( responseText.match(/flashVars = {[\s\S]*timestamp.*}/)[0] ) );
    delete flashVars.viewerId;

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');

    document.body.appendChild( buildContentFlash( flashVarsParamString ) );
    mtfInit();
}

