// -----------------------------------------------------------
// STATE

let state = {
    version: '1.0.0',
    router: {
        current: null,
        history: []
    },
    game: {
        selectedTopics: []
    }
};

function load_state() {
    const savedJson = window.sessionStorage.getItem('state');
    if (savedJson) {
        let savedState = JSON.parse(savedJson);
        if (state.version == savedState.version) {
            state = savedState;
        } else {
            // conversion ?
        }
    }
}

function save_state() {
    window.sessionStorage.setItem('state', JSON.stringify(state));
}

load_state();

// -----------------------------------------------------------
// GAME

//---- Topics
const topics = {
    space: {
        icon: 'url("https://icons-for-free.com/iconfiles/png/512/astronomy+planet+science+space+icon-1320195089993574465.png")'
    },
    nature: {
        icon: 'url("https://image.flaticon.com/icons/png/128/2990/2990966.png")'
    }
};

function SelectTopic(topic, deselect = false) {
    const index = state.game.selectedTopics.indexOf(topic);

    let topicCheckbox = document.getElementById(topic);
    if (index < 0 && !deselect) {
        state.game.selectedTopics.push(topic);
        if (topicCheckbox) {
            topicCheckbox.checked = true;
        }
    } else if (index > -1 && deselect) {
        state.game.selectedTopics.splice(index, 1);
        if (topicCheckbox) {
            topicCheckbox.checked = false;
        }
    }
    
    if (state.game.selectedTopics.length == 0) {
        document.getElementById('next-top').style.display = 'none';
        document.getElementById('next-bottom').style.display = 'none';
    } else {
        document.getElementById('next-top').style.display = '';
        document.getElementById('next-bottom').style.display = '';
    }

    save_state();
}

function SelectAllTopics() {
    state.game.selectedTopics = [];
    Object.keys(topics).forEach(key => {
        SelectTopic(key);        
    });
}

function DeselectAllTopics() {
    Object.keys(topics).forEach(key => {
        SelectTopic(key, true);  
    });
    state.game.selectedTopics = [];
}

function FillTopicList() {
    SelectTopic(null, true);

    let topicListElement = document.getElementById('topic-list');
    if (topicListElement) {
        topicListElement.innerHTML = '';

        Object.keys(topics).forEach(key => {
            let topicElement = document.createElement('li');
            let topicCheckbox = document.createElement('input');
            let topicLabel = document.createElement('label');

            topicElement.style.backgroundImage = topics[key].icon;

            topicCheckbox.id = key;
            topicCheckbox.type = 'checkbox';            
            if (state.game.selectedTopics.includes(key)) {
                topicCheckbox.checked = true;
            }
            topicCheckbox.onchange = (e) => { 
                e.target.checked ? SelectTopic(key) : SelectTopic(key, true);  
            };

            topicLabel.htmlFor = key;
            topicLabel.innerText = key;

            topicElement.appendChild(topicCheckbox);
            topicElement.appendChild(topicLabel);
            topicListElement.appendChild(topicElement);
        });
    }
}

//---- Options

//---- Lobby


// -----------------------------------------------------------
// PAGE NAVIGATION

const routes = {
    home: 'index.html',
    categories: 'categories.html',
    howto: 'howto.html',
    setup: 'setup.html'
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