var blockWinGrafix = false;

chrome.storage.onChanged.addListener(
    function(changes, namespace)
    {
        if( changes['blockWinGrafix'] ) {
            blockWinGrafix = changes['blockWinGrafix'].newValue;
        }
    }
);

function interceptRequest(request)
{
    if( request.url.indexOf("winGrafix/OWResultsAnimation") === -1 )
        return;

    if(blockWinGrafix === true && request && request.url && request.url.indexOf("winGrafix/OWResultsAnimation") !== -1)
        return {cancel: true};
}

try{
    chrome.webRequest.onBeforeRequest.addListener(interceptRequest, {urls: ["*://*.tetrisfriends.com/*"]}, ['blocking']);
}catch(err){
    alert("Error blocking winGrafix");
}

chrome.storage.sync.get('blockWinGrafix',
    function(chromeStorage)
    {
        blockWinGrafix = chromeStorage.blockWinGrafix;
    }
);
