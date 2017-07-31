function changeBlock()
{
    var changeBlock = document.getElementById('changeblock')
    chrome.storage.sync.set( {'blockWinGrafix': changeBlock.checked});
}
document.getElementById('changeblock').addEventListener('change', changeBlock);

chrome.storage.sync.get('blockWinGrafix',
    function(chromeStorage)
    {
        document.getElementById('changeblock').checked = chromeStorage.blockWinGrafix;
    }
)

function changeScale()
{
    var changeScale = document.getElementById('changescale')
    chrome.storage.sync.set( {'downscaleEnabled': changeScale.checked});
}
document.getElementById('changescale').addEventListener('change', changeScale);

chrome.storage.sync.get('downscaleEnabled',
    function(chromeStorage)
    {
        document.getElementById('changescale').checked = chromeStorage.downscaleEnabled;
    }
);
