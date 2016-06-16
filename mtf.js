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
    windowSizeRatio = innerHeight / innerWidth;
    contentFlashSizeRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;
    
    if(  contentFlashSizeRatio > windowSizeRatio )
    {
        updatedHeight = innerHeight;
        updatedWidth = Math.round( innerHeight / contentFlashSizeRatio );
    }
    else
    {
        updatedHeight = Math.round( innerWidth * contentFlashSizeRatio );
        updatedWidth = innerWidth;
    }

    contentFlash.style.height = updatedHeight + "px";
    contentFlash.style.width = updatedWidth + "px";
    contentFlash.style.marginTop = -updatedHeight / 2 + "px";
    contentFlash.style.marginLeft = -updatedWidth / 2 + "px";
}

function startScriptFunction(){
   gamePrerollComplete();
   if(contentFlash.outerHTML.indexOf("object") == -1){
       renderFlash();
   }
   if( location.href.indexOf("/Live/game.php") != -1 ){
       var sArenaTimes = 5;
       function startArena() {
           if(contentFlash.TotalFrames)
           {
               try{
                   contentFlash.as3_prerollDone();
               }catch(err){}
           }else
           {
               setTimeout(startArena, 1000);
               return;
           }
           sArenaTimes--;
           setTimeout(startArena, 1000);
       };
       startArena();
   }
}

addEventListener("DOMContentLoaded",
    function()
    {
        contentFlashSize.originalWidth = contentFlash.width;
        contentFlashSize.originalHeight = contentFlash.height;
        resizeContentFlash();

        var headStr = '<style> body { background: url(//tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; font-family: "Trebuchet MS",Helvetica,Tahoma,Geneva,Verdana,Arial,sans-serif; font-size: 12px; color: #666; margin: 0; text-align: center; display: block; overflow: hidden} #contentFlash { visibility: visible !important; position: absolute; top: 50%; left: 50%; } * { margin: 0; padding: 0; outline: none; -moz-box-sizing: border-box; box-sizing: border-box; }</style>';



        var bodyObject = contentFlash.cloneNode();
        bodyObject.
        bodyObject.appendChild( document.createElement("param") ).outerHTML = "<param name=quality value=low>";
        bodyObject.appendChild( document.createElement("param") ).outerHTML = "<param name=wmode value=direct>";
        bodyStr = bodyObject.outerHTML
        document.documentElement.innerHTML = 
            '<head>' + headStr + '</head>' +
            '<body>' + bodyStr + '</body>';
        /*implicit typecast to get function scope contents as string*/
        var startScriptString = startScriptFunction + '';
        /*strip wrapping function declaration*/
        startScriptString = startScriptString.slice( startScriptString.indexOf('{') + 2, startScriptString.length - 2);
        document.body.appendChild( document.createElement("script") ).innerHTML =  startScriptString;
    }
)

addEventListener("resize", resizeContentFlash);
