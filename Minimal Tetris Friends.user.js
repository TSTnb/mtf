// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible by removing everything from the page except for the games themselves.
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none 
// @run-at document-start
// @version 2016-03-06,4.0.1
// @author knux
// ==/UserScript==

var contentFlashSize = new Object();

function resizeContentFlash()
{
    
    var windowSizeRatio = innerHeight / innerWidth;
    
    
    var contentFlashSizeRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;
    
    var condensedWidth = contentFlashSize.minimalWidth
    var condensedHeight = contentFlashSize.minimalHeight;
        
    var scaleFactorX;
    var scaleFactorY;
    
    
    if(  contentFlashSizeRatio > windowSizeRatio )
    {
        updatedWidth = Math.round( innerHeight / contentFlashSizeRatio );
        updatedHeight = innerHeight;
    }
    else
    {
        updatedWidth = innerWidth;
        updatedHeight = Math.round( innerWidth * contentFlashSizeRatio );
    }

    scaleFactorX = updatedWidth / condensedWidth;
    scaleFactorY = updatedHeight / condensedHeight;
    
    $(contentFlash).css("width", condensedWidth + "px");
    $(contentFlash).css("height", condensedHeight + "px");
    
    $(contentFlash).css("transform", "scale( " + scaleFactorX + " ) translate(0px, 0px)" );
    
}

function buildHeader()
{

}

function buildBody()
{

}

addEventListener("DOMContentLoaded",
    function()
    {
        contentFlashSize.originalWidth = contentFlash.width;
        contentFlashSize.originalHeight = contentFlash.height;
    
        contentFlashSize.scaleFactor = 2;
        contentFlashSize.minimalWidth = contentFlash.width / contentFlashSize.scaleFactor;
        contentFlashSize.minimalHeight = contentFlash.height / contentFlashSize.scaleFactor;
    
        resizeContentFlash();

        var bodyStr = '';
        var headStr = '';
    
        headStr += '<meta name="viewport" content="height=100, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">';
        headStr += '<style> :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } body { background: url(//tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; font-family: "Trebuchet MS",Helvetica,Tahoma,Geneva,Verdana,Arial,sans-serif; font-size: 12px; color: #666; margin: 0; text-align: left; display: block; overflow: hidden} #contentFlash { visibility: visible !important; transform-origin: top left; } * { margin: 0; padding: 0; outline: none; -moz-box-sizing: border-box; box-sizing: border-box; }</style>';
    
        headStr = '<head>' + headStr + '</head>';
    
        bodyStr = $(contentFlash).clone().removeAttr("height").removeAttr("width").append("<param name=quality value=low></object>").append("<param name=scale value=exactfit>").find("param[name=wmode]").attr("value", "opaque").parent()[0].outerHTML;
        bodyStr = '<body>' + bodyStr + '</body>';
    
        document.documentElement.innerHTML = headStr + bodyStr;
    
        var startScript = 'gamePrerollComplete();if(contentFlash.outerHTML.indexOf("object") == -1){renderFlash()};';
        if( location.href.indexOf("/Live/game.php") != -1 )
            startScript += ';var sArenaTimes = 5; function startArena(){if(contentFlash.TotalFrames){try{contentFlash.as3_prerollDone()}catch(err){}}else{setTimeout(startArena, 1000); return}; sArenaTimes--; setTimeout(startArena, 1000)}; startArena()';

        document.body.appendChild( document.createElement("script") ).innerHTML = startScript;
    }
)

 addEventListener("resize", resizeContentFlash); 

