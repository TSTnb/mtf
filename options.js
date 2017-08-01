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
    chrome.storage.sync.set( {'downscaleValue': changeScale.value});
    document.getElementById('downscaleValue').textContent = changeScale.value;
}
document.getElementById('changescale').addEventListener('change', changeScale);

chrome.storage.sync.get('downscaleValue',
    function(chromeStorage)
    {
        document.getElementById('changescale').value = chromeStorage.downscaleValue;
        document.getElementById('downscaleValue').textContent = chromeStorage.downscaleValue;
    }
);
