var deviceTheme = '';
var currentTheme = localStorage.getItem('savedTheme');

// set the current theme
function changeTheme(themeId, save = false, isDevice = false) {
    // disable the current theme
    var oldNode = document.getElementById(currentTheme);
    if (oldNode) {
        oldNode.disabled = true; 
    }

    // enable the desired theme
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

    // update state
    currentTheme = themeId;
    deviceTheme = isDevice ? themeId : deviceTheme;

    // save to local storage
    if (save) {
        window.localStorage.setItem('savedTheme', currentTheme);
    }
}

//revert to device theme
function clearTheme()
{
    window.localStorage.removeItem('savedTheme');
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