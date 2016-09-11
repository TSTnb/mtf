// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none
// @run-at document-start
// @version 4.2.4
// @author morningpee
// ==/UserScript==

window.stop();

/*start fresh with html5 document */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

document.replaceChild(
        document.implementation.createHTMLDocument("Minimal Tetris Friends").documentElement,
        document.documentElement
);

function buildFlashVarsParamString()
{
    var flashVars = new Object();
    flashVars.apiUrl = "http://api.tetrisfriends.com/api";
    flashVars.startParam = "clickToPlay";

    var request = new XMLHttpRequest();
    var SYNCHRONOUS_REQUEST=false;
    request.open('GET', 'http://www.tetrisfriends.com/users/ajax/profile_my_tetris_style.php', SYNCHRONOUS_REQUEST);
    request.send(null);

    if (request.status === 200) {
        flashVars = Object.assign( flashVars, eval( request.responseText.match(/flashVars = {[\s\S]*timestamp.*}/)[0] ) );
        delete flashVars.viewerId;
    }

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');
    return flashVarsParamString;
}

function getContentFlashSize()
{
    contentFlashSize = new Object();

    contentFlashSize.T_WIDTH_SCALE_INDEX = 2;
    contentFlashSize.T_HEIGHT_SCALE_INDEX = 3;

    contentFlashSize.T_WIDTH_INDEX = 8;
    contentFlashSize.T_HEIGHT_INDEX = 9;

    contentFlashSize.originalWidth = contentFlash.TGetProperty('/', contentFlashSize.T_WIDTH_INDEX);
    contentFlashSize.originalHeight = contentFlash.TGetProperty('/', contentFlashSize.T_HEIGHT_INDEX);

    contentFlash.style.width = contentFlashSize.originalWidth + "px";
    contentFlash.style.height = contentFlashSize.originalHeight + "px";
}

function scaleContentFlash()
{
    contentFlashSize.scaleFactor = 2;
    contentFlashSize.translateConstant = -100 / contentFlashSize.scaleFactor / 2;

    contentFlashSize.minimalWidth = contentFlashSize.originalWidth / contentFlashSize.scaleFactor;
    contentFlashSize.minimalHeight = contentFlashSize.originalHeight / contentFlashSize.scaleFactor;

    contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
    contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
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

    scaleFactorX = updatedWidth / contentFlashSize.minimalWidth;
    scaleFactorY = updatedHeight / contentFlashSize.minimalHeight;

    /*we need to use translate3d instead of translate for 3d acceleration*/
    contentFlash.style.transform = "scale( " + scaleFactorX + " ) translate3d( " + contentFlashSize.translateConstant + "% , " + contentFlashSize.translateConstant + "% , 0px)";
}

function buildContentFlash(flashVarsParamString)
{
    var contentFlash = document.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "opaque");
    contentFlash.setAttribute("flashvars", flashVarsParamString);

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

    var isFirefox = navigator.userAgent.indexOf(/webkit/i) == -1;
    if( isFirefox )
    {
        scaleContentFlash();
        transformContentFlash();
    }
}

function mtfInit()
{
    contentFlash.LoadMovie(0, "http://tetrisow-a.akamaihd.net/data5_0_0_3/games/Ultra/OWGameUltra.swf");
    runOnContentFlashLoaded();
}

document.body.appendChild( document.createElement('style') ).innerHTML = '* { margin: 0; }';

document.body.appendChild( document.createElement('script') ).innerHTML = mtfInit.toString() + getContentFlashSize.toString() + scaleContentFlash.toString() + transformContentFlash.toString() + runOnContentFlashLoaded.toString();
document.body.appendChild( document.createElement('style') ).innerHTML = ':root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; top: 50vh; left: 50vw; transform-style: preserve-3d; transform-origin: top left; }';

document.body.appendChild( buildContentFlash( buildFlashVarsParamString() ) );
document.body.appendChild( document.createElement('script') ).innerHTML = "mtfInit()";

addEventListener("resize", transformContentFlash );
