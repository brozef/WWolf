// -----------------------------------------------------------
// UTILS
Math.clamp = function(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}

// -----------------------------------------------------------
// STATE

let state = {
    version: '1.0.9',
    selectedTopics: [],
    options: {
        wolvesKnow: false,
        wolvesAreUnique: false,
        wolfCount: 1,
        nsfw: false
    },
    devices: [{
        host: false,
        players: []
    }],
    wolves: [],
    phrases: [],
    topic: null,
    subcategory: null,
    turn: -1
};

function load_state() {
    let savedJson = window.sessionStorage.getItem('state');
    if (savedJson) {
        let savedState = JSON.parse(savedJson);
        if (state.version == savedState.version) {
            state = savedState;
        } else {
            // conversion ?
        }
    } else {
        savedJson = window.localStorage.getItem('state');
        if (savedJson) {
            let savedState = JSON.parse(savedJson);
            if (state.version == savedState.version) {
                state = { ...state, ...savedState };
            } else {
                // conversion ?
            }
        }
    }
}

function save_state() {
    window.sessionStorage.setItem('state', JSON.stringify(state));
    window.localStorage.setItem('state', JSON.stringify({ 
        version: state.version,
        options: state.options, 
        selectedTopics : state.selectedTopics 
    }));
}

load_state();

// -----------------------------------------------------------
// GAME

//---- Topics
const topics = [
    {
        name: "space",
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
    {
        name: "nature",
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
];

function SelectTopic(topic, deselect = false) {
    if (topics[topic] != null) {
        const selected = state.selectedTopics.indexOf(topic);
        let topicCheckbox = document.getElementById(topics[topic].name);
        if (selected < 0 && !deselect) {
            state.selectedTopics.push(topic);
            if (topicCheckbox) {
                topicCheckbox.checked = true;
            }
        } else if (selected > -1 && deselect) {
            state.selectedTopics.splice(selected, 1);
            if (topicCheckbox) {
                topicCheckbox.checked = false;
            }
        }
    }
    
    if (state.selectedTopics.length == 0) {
        document.getElementById('next-top').style.display = 'none';
        document.getElementById('next-bottom').style.display = 'none';
    } else {
        document.getElementById('next-top').style.display = '';
        document.getElementById('next-bottom').style.display = '';
    }

    save_state();
}

function SelectAllTopics() {
    state.selectedTopics = [];
    topics.forEach((item, index) => {
        SelectTopic(index);        
    });
}

function DeselectAllTopics() {
    topics.forEach((item, index) => {
        SelectTopic(index, true);  
    });
    state.selectedTopics = [];
}

function FillTopicList() {
    SelectTopic(-1, true);

    let topicListElement = document.getElementById('topic-list');
    if (topicListElement) {
        topicListElement.innerHTML = '';

        topics.forEach((item, index) => {
            let topicElement = document.createElement('li');
            let topicCheckbox = document.createElement('input');
            let topicLabel = document.createElement('label');

            topicElement.style.backgroundImage = item.icon;

            topicCheckbox.id = item.name;
            topicCheckbox.type = 'checkbox';            
            if (state.selectedTopics.includes(index)) {
                topicCheckbox.checked = true;
            }
            topicCheckbox.onchange = (e) => { 
                e.target.checked ? SelectTopic(index) : SelectTopic(index, true);  
            };

            topicLabel.htmlFor = item.name;
            topicLabel.innerText = item.name;

            topicElement.appendChild(topicCheckbox);
            topicElement.appendChild(topicLabel);
            topicListElement.appendChild(topicElement);
        });
    }
}

//---- Setup

function UpdateOptions() {
    if (state.selectedTopics.length == 0) {
        Navigate('topics');
        return;
    }

    const previousOptions = state.options;

    const nswfElement = document.getElementById('nsfw');
    const wolvesKnowElement = document.getElementById('wolves-know');
    const uniqueWolvesElement = document.getElementById('unique-wolves');
    const wolfCountElement = document.getElementById('wolf-count');

    const maxWolves = Math.ceil(GetTotalPlayerCount() / 2) - 1;

    state.options.wolfCount = Math.clamp(Number(wolfCountElement.value), 1, maxWolves);
    state.options.wolvesAreUnique = uniqueWolvesElement.checked;
    state.options.wolvesKnow = wolvesKnowElement.checked;
    state.options.nsfw = nswfElement.checked;

    wolfCountElement.value = state.options.wolfCount;

    // disable decrement if we are at min wolves
    if (state.options.wolfCount == 1) {
        document.getElementById('wolf-count-dec').disabled = true;
    } else {

        document.getElementById('wolf-count-dec').disabled = false;
    }

    if (state.options.wolfCount >= maxWolves) {
        document.getElementById('wolf-count-inc').disabled = true;
    } else {

        document.getElementById('wolf-count-inc').disabled = false;
    }

    state.devices[0].host = true;

    save_state();
}

function LoadOptions() {
    const nswfElement = document.getElementById('nsfw');
    const wolvesKnowElement = document.getElementById('wolves-know');
    const uniqueWolvesElement = document.getElementById('unique-wolves');
    const wolfCountElement = document.getElementById('wolf-count');

    wolfCountElement.value = state.options.wolfCount;
    nswfElement.checked = state.options.nsfw;
    wolvesKnowElement.checked = state.options.wolvesKnow;
    uniqueWolvesElement.checked = state.options.wolvesAreUnique;

    UpdateOptions();
}

function AdjustWolfCount(adjustment) {
    const wolfCountInput = document.getElementById('wolf-count');
    wolfCountInput.value = '' + (state.options.wolfCount + adjustment);
    UpdateOptions();
}

function GetRemotePlayerCount() {
    return 0;
}

function GetLocalPlayerCount() {
    return state.devices[0].players.length;
}

function GetTotalPlayerCount() {
    return GetLocalPlayerCount()+ GetRemotePlayerCount();
}

function AddLocalPlayer() {
    const localPlayerCount = GetLocalPlayerCount();
    state.devices[0].players.push({ name: 'Player ' + (localPlayerCount + 1)});

    save_state();
}

function RemoveLocalPlayer(index = -1) {
    const totalPlayerCount = GetTotalPlayerCount();

    if (index < 0) {
        state.devices[0].players.pop();
    } else if (GetLocalPlayerCount() > index) {
        state.devices[0].players.splice(index, 1);
    }

    save_state();
}

function AdjustLocalPlayerCount(adjustment) {
    const localPlayerCountInput = document.getElementById('localPlayerCount');
    localPlayerCountInput.value = '' + (GetLocalPlayerCount() + adjustment);
    UpdateLocalPlayerCount();
}

function UpdateLocalPlayerCount(useState = false) {
    let localPlayerCountInput = document.getElementById('localPlayerCount');

    const currentCount = GetLocalPlayerCount();
    let newInputCount = useState ? currentCount : Number(localPlayerCountInput.value);

    if (Number.isNaN(newInputCount) || newInputCount < 1) {
        console.warn('UpdateLocalPlayers', 'invalid count value', newInputCount);
        newInputCount = currentCount > 3 ? currentCount : 3;
    }

    // limit total players to min of 3
    if (state.devices[0].host) {
        const remoteCount = GetRemotePlayerCount();
        if (remoteCount + newInputCount < 3) {
            newInputCount = 3 - remoteCount;
        }
    }

    for (let i = 0; i < Math.abs(currentCount - newInputCount); i++) {
        if (currentCount > newInputCount) {
            RemoveLocalPlayer();
        } else if (currentCount < newInputCount) {
            AddLocalPlayer();
        }
    }

    localPlayerCountInput.value = newInputCount;

    // disable decrement if we are at min TOTAL players
    if (GetTotalPlayerCount() <= 3) {
        document.getElementById('localPlayerCountDecrement').disabled = true;
    } else {
        document.getElementById('localPlayerCountDecrement').disabled = false;
    }

    UpdateOptions();
}

//---- Assignments
function AssignPhrases() {
    const totalPlayerCount = GetTotalPlayerCount();

    if (totalPlayerCount < 3) {
        console.error('AssignPhrases', 'Not enough players');
        Navigate('topics');
        return;
    }

    if (state.options.wolfCount >= totalPlayerCount / 2) {
        console.error('AssignPhrases', 'Too many wolves');
        return;
    }

    const topicIndex = Math.floor(Math.random() * state.selectedTopics.length);
    const topicID = state.selectedTopics[topicIndex];
    const topic = topics[topicID];
    if (topic == null || topic.subcategories == null || topic.subcategories.length == 0) {
        console.error('AssignPhrases', 'Topic no subcategories', topic.name);
        return;
    } 

    const subcategoryIndex = Math.floor(Math.random() * topic.subcategories.length);
    const subcategory = topic.subcategories[subcategoryIndex];
    
    if (subcategory.phrases == null || subcategory.phrases == null || subcategory.phrases.length < 2) {
        console.error('AssignPhrases', 'Topic has incomplete subcategory', topic.name, subcategory.name);
        return;
    }

    state.topic = topicIndex;
    state.subcategory = subcategoryIndex;
    state.phrases = [];
    state.wolves = [];
    
    //if phrase count > 2 then each wolf has its own phrase
    let phraseCount = state.options.wolvesAreUnique ? state.options.wolfCount + 1 : 2;
    for(let i = 0; i < phraseCount; i++) {
        let phraseIndex = -1;
        while (phraseIndex < 0 || state.phrases.includes(phraseIndex)) {
            phraseIndex = Math.floor(Math.random() * subcategory.phrases.length);
            if (subcategory.phrases[phraseIndex].nsfw && !state.options.nsfw) {
                phraseIndex = -1;
            }
        }
        state.phrases.push(phraseIndex);
    }

    for (let i = 0; i < state.options.wolfCount; i++) {
        let wolfIndex = -1;
        while(wolfIndex < 0 || state.wolves.includes(wolfIndex)) {
            wolfIndex = Math.floor(Math.random() * totalPlayerCount);
        }
        
        state.wolves.push(wolfIndex);
    }

    state.turn = -1;

    save_state();
}

function PhraseIndexToText(topic, category, phrase) {
    return topics[topic].subcategories[category].phrases[phrase];
}

function IsLocalPlayerWolf(localPlayerIndex) {
    const wolfIndex = state.wolves.indexOf(localPlayerIndex);
    return wolfIndex > -1;
}

function GetPhraseForLocalPlayer(localPlayerIndex) {
    const localPlayerCount = GetLocalPlayerCount();

    if (localPlayerIndex >= localPlayerCount) {
        console.error('GetPhraseForPlayer', 'bad player index')
        return null;
    }

    if (state.phrases == null || state.phrases.length < 2) {
        console.error('GetPhraseForPlayer', 'bad state');
        return null;
    }

    const wolfIndex = state.wolves.indexOf(localPlayerIndex);
    if (wolfIndex < 0) {
        // not wolf
        return PhraseIndexToText(state.topic, state.subcategory, state.phrases[0]);
    } else if (state.wolvesAreUnique && state.phrases.length > state.wolves.length) {
        // wolf and unique phrases are on and viable
        return PhraseIndexToText(state.topic, state.subcategory, state.phrases[wolfIndex + 1]);
    } else {
        // wolves are not unique
        if (state.wolvesAreUnique) {
            console.warn('GetPhraseForPLayer', '"wolves are unique" is on but state is not viable');
        }

        return PhraseIndexToText(state.topic, state.subcategory, state.phrases[1]);
    }
}

function GetPlayerNameFromIndex(playerIndex) {
    let subtractor = 0;
    for (let i = 0; i < state.devices.length; i++){
        const index = playerIndex - subtractor;
        if (state.devices[i].players.length > index) {
            return state.devices[i].players[index].name;
        } else {
            subtractor += state.devices[i].players.length;
        }
    }

    return 'Unknown Player';
}

function TurnAction() {
    const nameElement = document.getElementById('player-name');
    const phraseElement = document.getElementById('phrase');
    const actionButton = document.getElementById('action-btn');
    const wolfElement = document.getElementById('wolf');
    if (phraseElement.innerText == '' && state.turn > -1) {
        phraseElement.innerText = GetPhraseForLocalPlayer(state.turn);
        if (state.options.wolvesKnow && IsLocalPlayerWolf(state.turn)){
            wolfElement.style.display = '';
        }
        actionButton.innerText = 'Ok';
    } else {
        state.turn++;
        nameElement.innerText = GetPlayerNameFromIndex(state.turn);
        phraseElement.innerText = '';
        wolfElement.style.display = 'none';
        actionButton.innerText = 'Ready';
    }
    
    if (state.turn >= GetTotalPlayerCount()) {
        const assignElement = document.getElementById('assignment');
        assignElement.style.display = 'none';

        const discussElement = document.getElementById('discuss');
        discussElement.style.display = '';
    }
}

//---- Debrief
function Reveal() {
    if (!confirm('Reveal the wolves?')) {
        return;
    }

    const debriefElement = document.getElementById('reveal');
    debriefElement.style.display = '';

    const discussElement = document.getElementById('discuss');
    discussElement.style.display = 'none';

    const phraseElement = document.getElementById('villagers');
    phraseElement.innerText = PhraseIndexToText(state.topic, state.subcategory, state.phrases[0]);

    const wolvesElement = document.getElementById('wolves');

    for(let i = 1; i < state.phrases.length; i++) {
        let text = PhraseIndexToText(state.topic, state.subcategory, state.phrases[i]) + ' (';
        if (!state.options.wolvesAreUnique) {
            state.wolves.forEach((wolfPlayerIndex, index) => {
                if (index > 0) {
                    text += ', ';
                }

                text += GetPlayerNameFromIndex(wolfPlayerIndex);
            });
        } else {
            text += GetPlayerNameFromIndex(i - 1);
        }
        text += ')';

        let wolfPhrase = document.createElement('li');
        wolfPhrase.innerText = text;
        wolvesElement.appendChild(wolfPhrase);
    }

    state.confirmBackMessage = null;
}

// -----------------------------------------------------------
// PAGE NAVIGATION

const routes = {
    home: 'index.html',
    topics: 'categories.html',
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

function ConfirmBackNavigation(message) {
    state.confirmBackMessage = message;
}

window.onbeforeunload = event => {
    if (state.confirmBackMessage) {
        event.preventDefault();
        return state.confirmBackMessage;
    }
}

window.onpagehide = event => {
    if (event.persisted) {
        state.confirmBackMessage = null;
        save_state();
    }
}