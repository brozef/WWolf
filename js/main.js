// -----------------------------------------------------------
// UTILS
Math.clamp = function(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}

// -----------------------------------------------------------
// STATE

let state = {
    version: '1.0.1',
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
        icon: 'url("https://icons-for-free.com/iconfiles/png/512/astronomy+planet+science+space+icon-1320195089993574465.png")',
        subcategories: [
            {
                name: 'enities',
                phrases: ['Elon Musk', 'Neil Armstrong', 'Buzz Lightyear', 'Buzz Aldrin', 'Nasa']
            },
            {
                name: 'planets & bodies',
                phrases: ['Nasa', 'Uranus', 'Earth', 'Moon', 'Mars', 'Sun', 'Stars']
            }
        ]
    },
    nature: {
        icon: 'url("https://image.flaticon.com/icons/png/128/2990/2990966.png")',
        subcategories: [
            {
                name: 'fauna & flora',
                phrases: ['Cat', 'Dog', 'Budgie', 'Bug', 'Lion']
            },
            {
                name: 'places',
                phrases: ['Waterfall', 'Mountain', 'Beach', 'Desert', 'Oasis']
            }
        ]
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

//---- Setup

//---- Assign
function AssignPhrases() {
    if (state.game.players == null || state.game.players.length < 3) {
        console.error('Assignment: Not enough players');
        return;
    }

    if (state.game.wolfCount > state.game.players.length / 2) {
        console.error('Assignment: Too many wolves');
    }

    const topicIndex = Math.floor(Math.random() * state.game.selectedTopics.length);
    const topicName = state.game.selectedTopics[topicIndex];
    const topic = topics[topicName];
    if (topic == null || topic.subcategories == null || topic.subcategories.length == 0) {
        console.error('Assignment: Topic no subcategories', topicName);
        return;
    } 

    const subcategoryIndex = Math.floor(Math.random() * topic.subcategories.length);
    const subcategory = topic.subcategories[subcategoryIndex];
    
    if (subcategory.phrases == null || subcategory.phrases == null || subcategory.phrases.length < 2) {
        console.error('Assignment: Topic has incomplete subcategory', topicName, subcategory.name);
        return;
    }

    state.game.topic = topic;
    state.game.subcategory = subcategory.name;
    state.game.phrases = [];
    state.game.wolves = [];
    
    //if phrase count > 2 then each wolf has its own phrase
    let phraseCount = state.game.wolvesAreUnique ? state.game.wolfCount : 2;
    for(let i = 0; i < phraseCount; i++) {
        let phraseIndex = -1;
        while (phraseIndex < 0 || state.game.phrases.includes(phraseIndex)) {
            phraseIndex = Math.floor(Math.random() * subcategory.phrases.length);
        }
        state.game.phrases.push(phraseIndex);
    }

    for (let i = 0; i < state.game.wolfCount; i++) {
        let wolfIndex = -1;
        while(wolfIndex < 0 || state.game.wolves.includes(wolfIndex)) {
            wolfIndex = Math.floor(Math.random() * state.game.players.length);
        }
        
        state.game.wolves.push(wolfIndex);
    }
}

//---- Debrief

// -----------------------------------------------------------
// PAGE NAVIGATION

const routes = {
    home: 'index.html',
    categories: 'categories.html',
    howto: 'howto.html',
    setup: 'setup.html',
    game: 'game.html',
    debrief: 'debrief.html'
};

function Navigate(route) {
    if (route == 'back') {
        window.history.back();
    } else if (routes[route]) {
        history.pushState(route, route, routes[route]);
        document.location.href = routes[route];
    } else {
        console.error("Route does not exist", route);
    }
}

function NavigateBack() {
    Navigate('back');
}

window.onunload = function(event) {
    save_state();
};