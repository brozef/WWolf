var routes = {
    home: 'index.html',
    categories: 'categories.html',
    howto: 'howto.html'
};

var state = {
    router: {
        current: null,
        history: []
    },
    game: {}
};

function load_state() {
    var savedState = window.sessionStorage.getItem('state');
    if (savedState) {
        state = JSON.parse(savedState);
    }
}

function save_state() {
    window.sessionStorage.setItem('state', JSON.stringify(state));
}

// GAME



// PAGE ROUTING
function internal_change_route(route) {
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

function Routing_back() {
    var back = state.router.history.pop();

    while(back != null && document.location.href.indexOf(routes[back]) > -1) {
        back = state.router.history.pop();
    }

    if (back == null) {
        back = 'home';
    }

    state.router.current = back;
    internal_change_route(back);
}

function Routing_go(route) {
    if (routes[route]) {
        state.router.history.push(state.router.current);
        state.router.current = route;
        internal_change_route(route);
    } else {
        console.error("attempted route does not exist", route);
    }
}

load_state();