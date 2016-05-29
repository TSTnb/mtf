var headStr = '<style> body { background: url(//tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; font-family: "Trebuchet MS",Helvetica,Tahoma,Geneva,Verdana,Arial,sans-serif; font-size: 12px; color: #666; margin: 0; text-align: center; display: block; } object { margin: 20px; visibility: visible !important}* { margin: 0; padding: 0; outline: none; -moz-box-sizing: border-box; box-sizing: border-box; } </style>';
var bodyStr = contentFlash.outerHTML.replace("</object>", "<param name='quality' value='low'></object>").replace('<param name="wmode" value="window">', '<param name="wmode" value="direct">');
document.documentElement.innerHTML = 
  '<head>' + headStr + '</head>' +
  '<body>' + bodyStr + '</body>';

  var startScript = 'gamePrerollComplete();if(contentFlash.outerHTML.indexOf("object") == -1){renderFlash()};';
  if( location.href.indexOf("/Live/game.php") != -1 )
      startScript += ';var sArenaTimes = 5; function startArena(){if(contentFlash.TotalFrames){try{contentFlash.as3_prerollDone()}catch(err){}}else{setTimeout(startArena, 1000); return}; sArenaTimes--; setTimeout(startArena, 1000)}; startArena()';

document.body.appendChild( document.createElement("script") ).innerHTML =  startScript;
