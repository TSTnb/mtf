// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none 
// @run-at document-start
// @version 4.2.3
// @author morningpee
// ==/UserScript==

var contentFlashSize = new Object();

function talkAboutThatContentFlashSize()
{
    contentFlashSize.originalWidth = contentFlash.width;
    contentFlashSize.originalHeight = contentFlash.height;

    contentFlashSize.scaleFactor = 2;
    contentFlashSize.minimalWidth = contentFlash.width / contentFlashSize.scaleFactor;
    contentFlashSize.minimalHeight = contentFlash.height / contentFlashSize.scaleFactor;

}

function setContentFlashSize()
{
    var contentFlashAspectRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;

    var condensedWidth = contentFlashSize.minimalWidth
    var condensedHeight = contentFlashSize.minimalHeight;

    var scaleFactorX = contentFlashSize.originalWidth / condensedWidth;
    var scaleFactorY = contentFlashSize.originalHeight / condensedHeight;

    $(contentFlash).css("width", condensedWidth + "px");
    $(contentFlash).css("height", condensedHeight + "px");
}

function transformContentFlash()
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

    $(contentFlash).css("transform", "scale( " + scaleFactorX + " ) translate3d( -50%, -50%, 0px)" );
}

addEventListener("DOMContentLoaded",
    function()
    {
        talkAboutThatContentFlashSize()

        var headStr = '';
        headStr += '<meta name="viewport" content="height=100, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">';
        headStr += '<style> :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } body { background: url(//tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; font-family: "Trebuchet MS",Helvetica,Tahoma,Geneva,Verdana,Arial,sans-serif; font-size: 12px; color: #666; margin: 0; text-align: left; display: block; overflow: hidden} #contentFlash { visibility: visible !important; position: absolute; top: 50%; left: 50%; transform-style: preserve-3d; transform-origin: top left; } * { margin: 0; padding: 0; outline: none; -moz-box-sizing: border-box; box-sizing: border-box; }</style>';
        headStr = '<head>' + headStr + '</head>';

        var bodyStr = '';
        bodyStr = $(contentFlash).clone().removeAttr("height").removeAttr("width").append("<param name=quality value=low></object>").append("<param name=scale value=exactfit>").find("param[name=wmode]").attr("value", "opaque").parent()[0].outerHTML;
        bodyStr = '<body>' + bodyStr + '</body>';

        document.documentElement.innerHTML = headStr + bodyStr;

        setContentFlashSize();
        transformContentFlash();

        var startScript = 'gamePrerollComplete();if(contentFlash.outerHTML.indexOf("object") == -1){renderFlash()};';
        if( location.href.indexOf("/Live/game.php") != -1 )
            startScript += ';var sArenaTimes = 5; function startArena(){if(contentFlash.TotalFrames){try{contentFlash.as3_prerollDone()}catch(err){}}else{setTimeout(startArena, 1000); return}; sArenaTimes--; setTimeout(startArena, 1000)}; startArena()';

        document.body.appendChild( document.createElement("script") ).innerHTML = startScript;
        addEventListener("resize", transformContentFlash);
    }
)
