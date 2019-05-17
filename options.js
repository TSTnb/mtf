function changeBlock() {
    var changeBlock = document.getElementById('changeblock')
    chrome.storage.sync.set({'blockWinGrafix': changeBlock.checked});
}

document.getElementById('changeblock').addEventListener('change', changeBlock);

chrome.storage.sync.get('blockWinGrafix',
    function (chromeStorage) {
        document.getElementById('changeblock').checked = chromeStorage.blockWinGrafix === undefined ? false : chromeStorage.blockWinGrafix;
    }
)


function changeFullScreen() {
    var correctSize = document.getElementById('correctSize')
    chrome.storage.sync.set({'correctSize': correctSize.checked === false});
}

document.getElementById('correctSize').addEventListener('change', changeFullScreen);

chrome.storage.sync.get('correctSize',
    function (chromeStorage) {
        document.getElementById('correctSize').checked = chromeStorage.correctSize === undefined ? false : chromeStorage.correctSize === false;
    }
);

function changeScale() {
    var changeScale = document.getElementById('changescale')
    chrome.storage.sync.set({'downscaleValue': changeScale.value});
    document.getElementById('downscaleValue').textContent = changeScale.value;
}

document.getElementById('changescale').addEventListener('change', changeScale);

chrome.storage.sync.get('downscaleValue',
    function (chromeStorage) {
        document.getElementById('changescale').value = chromeStorage.downscaleValue === undefined ? 1 : chromeStorage.downscaleValue;
        document.getElementById('downscaleValue').textContent = chromeStorage.downscaleValue === undefined ? 1 : chromeStorage.downscaleValue;
    }
);

function changeInGame() {
    var changeInGame = document.getElementById('changeInGame')
    chrome.storage.sync.set({'changeInGame': changeInGame.checked});
}

document.getElementById('changeInGame').addEventListener('change', changeInGame);

chrome.storage.sync.get('changeInGame',
    function (chromeStorage) {
        document.getElementById('changeInGame').checked = chromeStorage.changeInGame === undefined ? true : chromeStorage.changeInGame;
    }
);

function restartKey(e) {
    chrome.storage.sync.set({'restartKey': e.key});
    document.getElementById('restartKey').value = e.key;
}

document.getElementById('restartKey').addEventListener('keyup', restartKey);

chrome.storage.sync.get('restartKey',
    function (chromeStorage) {
        document.getElementById('restartKey').value = chromeStorage.restartKey === undefined ? '[' : chromeStorage.restartKey;
    }
);
