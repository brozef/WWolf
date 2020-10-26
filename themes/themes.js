var deviceTheme = localStorage.getItem('deviceTheme');
var currentTheme = localStorage.getItem('savedTheme');
var isCustomTheme = currentTheme != null;

function changeTheme(themeId, save = false, isDevice = false) {
    if (isDevice) {
        deviceTheme = themeId;
        window.localStorage.setItem('deviceTheme', themeId);
        if (isCustomTheme) {
            return; // dont change if were on a custom theme
        }
    }

    // disable the current theme
    var oldNode = document.getElementById(currentTheme);
    if (oldNode) {
        oldNode.disabled = true; 
    }

    // enable the new theme
    var cssNode = document.getElementById(themeId);
    if (cssNode) {
        cssNode.disabled = false;
    } else {
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = themeId;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = 'themes/'+themeId+'.css';
        link.media = 'all';
        head.appendChild(link);
    }

    // update current state
    currentTheme = themeId;

    // save to local storage
    if (save) {
        window.localStorage.setItem('savedTheme', currentTheme);
        isCustomTheme = true;
    }
}

function clearTheme()
{
    //revert to device theme
    window.localStorage.removeItem('savedTheme');
    isCustomTheme = false;
    changeTheme(deviceTheme);
}

// load the previous used theme
if (currentTheme){
    changeTheme(currentTheme);
} else if (deviceTheme){
    changeTheme(deviceTheme);
}

// device theme current setting
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    changeTheme('dark', false, true);
} else {
    changeTheme('light', false, true);
}

// device theme change listeners
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
        changeTheme('dark', false, true);
    } else {
        changeTheme('light', false, true);
    }
});