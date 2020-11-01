// -----------------------------------------------------------
// UTILS
Math.clamp = function(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}

// -----------------------------------------------------------
// STATE

let state = {
    version: '1.0.4',
    game: {
        selectedTopics: [],
        options: {
            wolvesAreUnique: false,
            wolfCount: 1,
            nsfw: false
        },
        devices: {
            local: {
                host: false,
                players: []
            }
        },
        wolves: [],
        phrases: [],
        topic: null,
        subcategory: null,
        turn: 0
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

//---- Setup
function ApplyGameOptions() {
    const previousOptions = state.game.options;

    state.game.devices.local.host = true;

    save_state();
}

function GetRemotePlayerCount() {
    return 0;
}

function GetLocalPlayerCount() {
    return state.game.devices.local.players.length;
}

function GetTotalPlayerCount() {
    return GetLocalPlayerCount()+ GetRemotePlayerCount();
}

function AddLocalPlayer() {
    const localPlayerCount = GetLocalPlayerCount();
    state.game.devices.local.players.push({ name: 'Player ' + localPlayerCount + 1});

    save_state();
}

function RemoveLocalPlayer(index = -1) {
    const totalPlayerCount = GetTotalPlayerCount();

    if (index < 0) {
        state.game.devices.local.players.pop();
    } else if (GetLocalPlayerCount() > index) {
        state.game.devices.local.players.splice(index, 1);
    }

    save_state();
}

function AdjustLocalPlayerCount(adjustment) {
    const localPlayerCountInput = document.getElementById('localPlayerCount');
    localPlayerCountInput.value = '' + (GetLocalPlayerCount() + adjustment);
    UpdateLocalPlayerCount();
}

function UpdateLocalPlayerCount() {
    const localPlayerCountInput = document.getElementById('localPlayerCount');

    let newInputCount = Number(localPlayerCountInput.value);
    if (Number.isNaN(newInputCount) || newInputCount < 1) {
        console.error('UpdateLocalPlayers', 'invalid count value', value);
        newInputCount = GetLocalPlayerCount();
    }

    // limit total players to min of 3
    if (state.game.devices.local.host) {
        const remoteCount = GetRemotePlayerCount();
        if (remoteCount + newInputCount < 3) {
            newInputCount = 3 - remoteCount;
        }
    }

    const currentCount = GetLocalPlayerCount();
    for (let i = 0; i < Math.abs(currentCount - newInputCount); i++) {
        if (currentCount > newInputCount) {
            RemoveLocalPlayer();
        } else if (currentCount < newInputCount) {
            AddLocalPlayer();
        }
    }

    // disable decrement if we are at min TOTAL players
    if (GetTotalPlayerCount() <= 3) {
        document.getElementById('localPlayerCountDecrement').style.display = 'disabled';
    }
}

//---- Assignments
function AssignPhrases() {
    const totalPlayerCount = GetTotalPlayerCount();

    if (totalPlayerCount < 3) {
        console.error('AssignPhrases', 'Not enough players');
        return;
    }

    if (state.game.options.wolfCount > totalPlayerCount / 2) {
        console.error('AssignPhrases', 'Too many wolves');
        return;
    }

    const topicIndex = Math.floor(Math.random() * state.game.selectedTopics.length);
    const topicName = state.game.selectedTopics[topicIndex];
    const topic = topics[topicName];
    if (topic == null || topic.subcategories == null || topic.subcategories.length == 0) {
        console.error('AssignPhrases', 'Topic no subcategories', topicName);
        return;
    } 

    const subcategoryIndex = Math.floor(Math.random() * topic.subcategories.length);
    const subcategory = topic.subcategories[subcategoryIndex];
    
    if (subcategory.phrases == null || subcategory.phrases == null || subcategory.phrases.length < 2) {
        console.error('AssignPhrases', 'Topic has incomplete subcategory', topicName, subcategory.name);
        return;
    }

    state.game.topic = topicName;
    state.game.subcategory = subcategoryIndex;
    state.game.phrases = [];
    state.game.wolves = [];
    
    //if phrase count > 2 then each wolf has its own phrase
    let phraseCount = state.game.options.wolvesAreUnique ? state.game.options.wolfCount : 2;
    for(let i = 0; i < phraseCount; i++) {
        let phraseIndex = -1;
        while (phraseIndex < 0 || state.game.phrases.includes(phraseIndex)) {
            phraseIndex = Math.floor(Math.random() * subcategory.phrases.length);
        }
        state.game.phrases.push(phraseIndex);
    }

    for (let i = 0; i < state.game.options.wolfCount; i++) {
        let wolfIndex = -1;
        while(wolfIndex < 0 || state.game.wolves.includes(wolfIndex)) {
            wolfIndex = Math.floor(Math.random() * totalPlayerCount);
        }
        
        state.game.wolves.push(wolfIndex);
    }

    state.game.turn = 0;

    save_state();
}

function PhraseIndexToText(topic, category, phrase) {
    return topics[topic].subcategories[category].phrases[phrase];
}

function GetPhraseForLocalPlayer(localPlayerIndex) {
    const localPlayerCount = GetLocalPlayerCount();

    if (localPlayerIndex >= localPlayerCount) {
        console.error('GetPhraseForPlayer', 'bad player index')
        return null;
    }

    if (state.game.phrases == null || state.game.phrases.length < 2) {
        console.error('GetPhraseForPlayer', 'bad state');
        return null;
    }

    const wolfIndex = state.game.wolves.indexOf(localPlayerIndex);
    if (wolfIndex < 0) {
        // not wolf
        return PhraseIndexToText(state.game.topic, state.game.subcategory, state.game.phrases[0]);
    } else if (state.game.wolvesAreUnique && state.game.phrases.length > state.game.wolves.length) {
        // wolf and unique phrases are on and viable
        return PhraseIndexToText(state.game.topic, state.game.subcategory, state.game.phrases[wolfIndex + 1]);
    } else {
        // wolves are not unique
        if (state.game.wolvesAreUnique) {
            console.warn('GetPhraseForPLayer', '"wolves are unique" is on but state is not viable');
        }

        return PhraseIndexToText(state.game.topic, state.game.subcategory, state.game.phrases[1]);
    }
}

function TurnAction() {
    if (state.game.turn > GetTotalPlayerCount()) {
       //something to turn on discuss visuals
    } else {
        const phraseElement = document.getElementById('phrase');
        const actionButton = document.getElementById('action-btn');
        if (phraseElement.innerText == '') {
            phraseElement.innerText = GetPhraseForLocalPlayer(state.game.turn);
            actionButton.innerText = 'Ok';
        } else {
            state.game.turn++;
            phraseElement.innerText = '';
            actionButton.innerText = 'Ready';
        }
    }
}

//---- Debrief
// set ganmestarted to false

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
        document.location.href = routes[route];
    } else {
        console.error('Navigate', 'Route does not exist', route);
    }
}

function NavigateBack() {
    Navigate('back');
}

window.onunload = function(event) {
    save_state();
};