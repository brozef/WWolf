
// -----------------------------------------------------------
// STATE

let state = {
    router: {
        current: null,
        history: []
    },
    game: {}
};

function load_state() {
    const savedState = window.sessionStorage.getItem('state');
    if (savedState) {
        state = JSON.parse(savedState);
    }
}

function save_state() {
    window.sessionStorage.setItem('state', JSON.stringify(state));
}

// -----------------------------------------------------------
// GAME


// -----------------------------------------------------------
// PAGE NAVIGATION

const routes = {
    home: 'index.html',
    categories: 'categories.html',
    howto: 'howto.html'
};

function change_route(route) {
    if (routes[route]) {
        if (route == routes.home) {
            state.router.history = [];
        }
        save_state();
        document.location.href = routes[route];
    } else {
        console.error("INTERNAL route does not exist", route);
    }
}

function NavigateBack() {
    let back = state.router.history.pop();

    while(back != null && document.location.href.indexOf(routes[back]) > -1) {
        back = state.router.history.pop();
    }

    if (back == null) {
        back = 'home';
    }

    state.router.current = back;
    change_route(back);
}

function Navigate(route) {
    if (route == 'back') {
        return NavigateBack();
    }

    if (routes[route]) {
        state.router.history.push(state.router.current);
        state.router.current = route;
        change_route(route);
    } else {
        console.error("attempted route does not exist", route);
    }
}

load_state();