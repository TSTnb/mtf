// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @include http://*tetrisfriends.com/data/games/Ultra/OWGameUltra.swf
// @grant none 
// @run-at document-start
// @version 4.2.4
// @author morningpee
// ==/UserScript==

window.stop();

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

var contentFlashSize = new Object();

function talkAboutThatContentFlashSize(contentFlash)
{
    contentFlashSize.originalWidth = 760;
    contentFlashSize.originalHeight = 560;

    contentFlashSize.scaleFactor = 2;
    contentFlashSize.minimalWidth = 760 / contentFlashSize.scaleFactor;
    contentFlashSize.minimalHeight = 560 / contentFlashSize.scaleFactor;
}

function setContentFlashSize(contentFlash)
{
    contentFlash.style.width = contentFlashSize.minimalWidth + "px";
    contentFlash.style.height = contentFlashSize.minimalHeight + "px";
}

function transformContentFlash(contentFlash)
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

    scaleFactorX = updatedWidth / contentFlashSize.minimalWidth
    scaleFactorY = updatedHeight / contentFlashSize.minimalHeight;
    contentFlash.style.transform = "scale( " + scaleFactorX + " ) translate3d( -50%, -50%, 0px)";
}

function buildContentFlash(sourceDocument, flashVarsParamString)
{
    var contentFlash = sourceDocument.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("src", "http://www.tetrisfriends.com/data/games/Ultra/OWGameUltra.swf");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "opaque");
    contentFlash.setAttribute("flashvars", flashVarsParamString);

    talkAboutThatContentFlashSize(contentFlash);
    setContentFlashSize(contentFlash);
    transformContentFlash(contentFlash);

    return contentFlash;
}

/* html5 */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

mtfWrapper = document.createElement("html");
mtfWrapper.appendChild( document.createElement("head") );
mtfBody = mtfWrapper.appendChild( document.createElement("body") )
    .appendChild(
       mtfFrame = document.createElement("iframe")
    );
mtfBody.appendChild( document.createElement('style') ).innerHTML = '* { margin: 0; } iframe { border: 0; width: 100vw; height: 100vh; }';
document.replaceChild( mtfWrapper, document.documentElement );
mtfDocument = document.implementation.createHTMLDocument("Minimal Tetris Friends");


mtfDocument.head.innerHTML = '<meta name="viewport" content="height=100, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />';
mtfDocument.body.appendChild( document.createElement('style') ).innerHTML = ':root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; top: 50vh; left: 50vw; transform-style: preserve-3d; transform-origin: top left; }';
contentFlash = buildContentFlash( mtfDocument, buildFlashVarsParamString() );
mtfDocument.body.appendChild( contentFlash );

mtfFrame.src = "data:text/html," + mtfDocument.documentElement.outerHTML;
addEventListener("resize", function(){ transformContentFlash.call( frames[0], frames[0].contentFlash ) } );
