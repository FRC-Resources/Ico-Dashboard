const Store = require("electron-store");
const storage = new Store();

// Window size memory
function getWindowSize(){
    const defaultBounds = [800, 650];

    const size = storage.get("windowSize");

    if(size) {
        return size;
    }
    else {
        storage.set("windowSize", defaultBounds);
        return defaultBounds;
    }
}
function saveBounds(bounds){
    storage.set("windowSize", bounds);
}

// Window position memory
function getWindowPositon(){
    const defaultPosition = [0, 0];

    const position = storage.get("windowPosition");
    
    if(position) {
        return position;
    }
    else {
        storage.set("windowPosition", defaultPosition);
        return defaultPosition;
    }
}
function savePosition(position){
    storage.set("windowPosition", [position[0], position[1]]);
}

// Team number memory
function getTeamNumber(){
    const defaultTeamNumber = 0;

    const teamNumber = storage.get("teamNumber");

    if(teamNumber) {
        return teamNumber;
    }
    else {
        storage.set("teamNumber", defaultTeamNumber);
        return defaultTeamNumber;
    }
}
function saveTeamNumber(teamNumber){
    storage.set("teamNumber", teamNumber);
}

module.exports = {
    getWindowSize: getWindowSize,
    saveBounds: saveBounds,
    getWindowPositon: getWindowPositon,
    savePosition: savePosition,
    getTeamNumber: getTeamNumber,
    saveTeamNumber: saveTeamNumber
}