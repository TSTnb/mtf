function changeBlock(winButton)
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
