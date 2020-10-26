function changeTheme(dark) {
    var cssId = dark ? 'themecss.dark' : 'themecss.light';
    if (document.getElementById(cssId))
    {
        document.getElementById(cssId).disabled = false;
        document.getElementById(dark ? 'themecss.light' : 'themecss.dark' ).disabled = true;
    }
    else
    {
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = cssId;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = dark ? './dark.css' : './light.css';
        link.media = 'all';
        head.appendChild(link);
    }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    changeTheme(true);
} else {
    changeTheme(false);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
        changeTheme(true);
    } else {
        changeTheme(false);
    }
});