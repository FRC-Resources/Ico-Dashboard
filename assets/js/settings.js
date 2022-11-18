const Store = require("electron-store");
const storage = new Store();

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

function saveBounds(bounds){
    storage.set("windowSize", bounds);
}

function savePosition(position){
    storage.set("windowPosition", [position[0], position[1]]);
}

module.exports = {
    getWindowSize: getWindowSize,
    getWindowPositon: getWindowPositon,
    saveBounds: saveBounds,
    savePosition: savePosition
}