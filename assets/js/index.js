//Required and config
const electron = require('electron');
const {ipcRenderer} = electron;
const Store = require("electron-store");
const storage = new Store();
//nt4 ts client
const { NetworkTables, NetworkTableTypeInfos, NetworkTablesTopic } = require('ntcore-ts-client');

// Constants for control mode data
const teleop = [32, 33, 48, 49];
const autonomous = [34, 35, 50, 51];
const test = [36, 37, 52, 53];

// config data
const ShowSmartdashboardData = storage.get("ShowSmartdashboardData");
const ShowShuffleboardData = storage.get("ShowShuffleboardData");

// Field setup
var fieldc;
var fieldctx;

// Team number setup
var savedTeamNumber;
ipcRenderer.send('teamNumber:request');
const teamNumberTextParagraph = document.getElementById('teamNumberText');
teamNumberText = document.createTextNode(null);
teamNumberTextParagraph.appendChild(teamNumberText);

//Camera system setup
let img = document.getElementById('videoStream');
const IPForm = document.getElementById('IPandPortForm');
IPForm.addEventListener('submit', getIP);
let IPandPortHTTP = null;
let IP = null;

//Connect to camera
function getIP() {
    const IPandPort = document.getElementById('IPandPort').value;
    var IP;
    if(IPandPort == "") {
        if(savedTeamNumber == 'localhost') {
          IPandPortHTTP = ('http://localhost:1181/stream.mjpg');
          IP = ('0.0.0.0');
        }
        else if(savedTeamNumber < 10) {
          let teamNumberIPandPort = ('0.0' + savedTeamNumber);
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
          IP = ('10.' +  teamNumberIPandPort + '.2');
        }
        else if(savedTeamNumber < 100) {
          let teamNumberIPandPort = ('0.' + savedTeamNumber);
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
          IP = ('10.' +  teamNumberIPandPort + '.2');
        }
        else if(savedTeamNumber < 1000) {
          let teamNumberIPandPort = ('0'+savedTeamNumber.substring(0,1) + '.' + savedTeamNumber.substring(1,3));
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
          IP = ('10.' +  teamNumberIPandPort + '.2');
        } else {
          let teamNumberIPandPort = (savedTeamNumber.substring(0,2) + '.' + savedTeamNumber.substring(2,4));
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
          IP = ('10.' +  teamNumberIPandPort + '.2');
        }
    } else {
        IPandPortHTTP = ('http://' + IPandPort + '/stream.mjpg');
    }
    console.log(IPandPortHTTP);
    console.log(IP)
    return IP;
}

//Team number changes
ipcRenderer.on('teamNumber:is', function(e, teamNumber) {
  console.log("Team number is: "+ teamNumber)
  savedTeamNumber = teamNumber;
  teamNumberText = document.createTextNode('Team Number: ' + teamNumber);
  teamNumberTextParagraph.replaceChildren(teamNumberText, teamNumberText)
})

//Conect to camera
function connectVideoStream() {
  console.log('connect');
  img.src = IPandPortHTTP;
  console.log(savedTeamNumber);
}

//Disconnect from camera
function disconectVideoStream() {
  console.log('disconnect');
  img.src = './assets/img/no-cam-feed.jpg';
  console.log(savedTeamNumber);
}

//Network Table disconnect
function ntcoreDisconnect() {
  //currently not working
  console.log('THIS IS BUGGED, dicsonnecting from ntcore not iplimented just refresh the page for now');
  document.getElementById('Smartdashboard Table Result').innerHTML=""
  document.getElementById('Shuffleboard Table Result').innerHTML=""
}
//Network table connection and output
function ntcoreConnect() {
  IP = getIP();
  ntcore = NetworkTables.createInstanceByURI(uri = IP, port = 5810);

  // from storage read the array of keys (0), their types (1), and the rate (2) to subscribe to
  const keys = storage.get("keys", []);

  // create a map of topics
  const topics = new Map();
  // subscribe to all keys
  for (const key of keys) {
    const topic = ntcore.createTopic(key[0], key[1]);
    topic.subscribe((value) => {
      //console.log(`Got ${key[0]}: ${value}`);
      console.log(key[0] + " " + value);

      if (key[0].startsWith("/FMSInfo/")) {
        if (key[0] == "/FMSInfo/IsRedAlliance") {
          if(value) {
            document.getElementById("AllainceColour").innerHTML = "Red";
          } else {
            document.getElementById("AllainceColour").innerHTML = "Blue";
          }
        }
        if (key[0] == storage.get("FMSControlString")) {
          let mode = "Unknown";
          let enabled = "Disabled";
          let fms = "Disconnected";
  
          if(teleop.includes(value)) {
            mode = "Teleop";
          } else if(autonomous.includes(value)) {
            mode = "Autonomous";
          } else if(test.includes(value)) {
            mode = "Test";
          }
  
          if(value % 2 == 1) enabled = "Enabled";
          if(value >= 48) fms = "Connected";
  
          document.getElementById("CurrentMode").innerHTML = `${mode} ${enabled}`;
          document.getElementById("isFMSConnected").innerHTML = fms;
        }
      } else if (key[0].startsWith("/SmartDashboard/")) {
        if(ShowSmartdashboardData){
          tempKey = key.slice(16)
          try {
            updateSmartDashboardData(key[0], value, key[3]);
          } catch {
            addSmartDashboardData(key[0], value);
          }
        }
      } else if (key[0].startsWith("/Shuffleboard/")) {
        if(ShowShuffleboardData){
          tempKey = key.slice(14)
          try {
            updateShuffleboardData(key[0], value);
          } catch {
            addShuffleboardData(key[0], value);
          }
        }
      }
    }, true, {periodic: key[2]});
    topics.set(key, topic);
  }
}

if(!ShowSmartdashboardData){
  deleteSmartDashboardHTML();
}
if(!ShowShuffleboardData){
  deleteShuffleboardHTML();
}

function addSmartDashboardData(key, val){
  key = key.slice(16)
  if(!storage.get("SmartdashboardIgnoreStrings").includes(key)){
    console.log("ASMD, Label: "+key+" Value: "+val)
    if(key == "Field/Robot"){
      if(document.getElementById("Field Canvas") == null){
        console.log('Adding Field');
        var html="";
        html = "<canvas id='Field Canvas' style='border:2px solid black' width='660' height='324'></canvas>";
        document.getElementById("Button Break").insertAdjacentHTML("beforebegin", html);
        fieldc = document.getElementById("Field Canvas");
        fieldctx = fieldc.getContext("2d");
        console.log(fieldc);
        console.log(fieldctx);
        console.log("adding Field");
      }
    }
    var html="";
    var label=key;
    storage.get("SmartdashboardHideSubstrings").some(string => {
      if (key.includes(string)) {
        label=key.slice(string.length);
      }});
    html="<tr><td align='left' valign='top' style='overflow:hidden;' nowrap='nowrap'>"+label+"</td><td id='"+key+" Value"+"'>"+val+"</td></tr>";
    if(document.getElementById(key+" Value") == null){
      document.getElementById('Smartdashboard Table Result').innerHTML+=html;
    }
  
    document.getElementById('Smartdashboard Label').value="";
    document.getElementById('Smartdashboard Value').value=""; 
  } 
}

function updateSmartDashboardData(key, val, decimals=2){
  key = key.slice(16)
  // check if val is a number and round it if it is
  // IF AN ARRAY BUT NOT CONTAINING A NUMBER UHHHHH IDK MAN NOT SURE IF ITLL EXPLODE
  // TODO: FIX THIS
  // but like, why would you send an array of strings to smartdashboard
  if(decimals != null && !isNaN(val) || Array.isArray(val) && !isNaN(val[0])){
    val = roundTo(val, decimals)
  }
  document.getElementById(key+" Value").innerHTML = val;
  if(key == "Field/Robot"){
    console.log("Field draw "+ val);
    drawRobotRot(val[0], val[1], val[2], 20, 20);
  }
}

function addShuffleboardData(key, val){
  key = key.slice(14)
  if(!storage.get("ShuffleboardIgnoreStrings").some(string => key.includes(string))){
    console.log("ASMD, Label: "+key+" Value: "+val)
    var html="";
    var label=key;
    storage.get("ShuffleboardHideSubstrings").some(string => {
      if (key.includes(string)) {
        label=key.slice(string.length);
      }});
    html="<tr><td align='left' valign='top' style='overflow:hidden;' nowrap='nowrap'>"+label+"</td><td id='"+key+" Value"+"'>"+val+"</td></tr>";
    if(document.getElementById(key+" Value") == null){
      document.getElementById('Shuffleboard Table Result').innerHTML+=html;
    }
  
    document.getElementById('Shuffleboard Label').value="";
    document.getElementById('Shuffleboard Value').value=""; 
  } 
}

function updateShuffleboardData(key, val){
  key = key.slice(14)
  document.getElementById(key+" Value").innerHTML = val;
}

function deleteSmartDashboardHTML(){
  document.getElementById('Smartdashboard thead').remove();
  document.getElementById('Smartdashboard Table Result').innerHTML=""
}
function deleteShuffleboardHTML(){
  document.getElementById('Shuffleboard thead').remove();
  document.getElementById('Shuffleboard Table Result').innerHTML=""
}

// Field display
function drawRobotRot(x ,y, theta, width, height) {
  fieldctx.clearRect(0, 0, 660, 324);
  fieldctx.save();
  fieldctx.translate((x*41.25)+width/2, (324+(-y*41.25))+height/2);
  fieldctx.rotate(-theta * Math.PI / 180);
  drawRobot(24, 20);
  fieldctx.restore();
}
function drawRobot(length, width){
  fieldctx.fillStyle = 'rgba(0,0,255,0.5)';
  fieldctx.fillRect(length/2*(-1), width/2*(-1), length, width);
}

function setTargetLocation(){
  var x = document.getElementById("Target X").value;
  var y = document.getElementById("Target Y").value;
  console.log(x,y);
  client.Assign(x, "/SmartDashboard/Target X");
  client.Assign(y, "/SmartDashboard/Target Y");
}

function roundTo(n, digits) {
  // if digits is not defined or is not a number set to 0
  if (typeof digits !== 'number') {
      digits = 0;
  }
  // if n is an array apply to each element
  if (Array.isArray(n)) {
      return n.map(function (x) {
          return roundTo(x, digits);
      });
  }
  var negative = false;
  if (digits === undefined) {
      digits = 0;
  }
  if (n < 0) {
      negative = true;
      n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
      n = (n * -1).toFixed(digits);
  }
  return n;
}