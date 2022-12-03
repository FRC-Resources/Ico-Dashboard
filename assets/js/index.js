//Required and config
const electron = require('electron');
const {ipcRenderer} = electron;
const ntClient = require('wolfbyte-networktables');
const client = new ntClient.Client();
const Store = require("electron-store");
const storage = new Store();

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
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
let img = document.getElementById('videoStream');
const IPForm = document.getElementById('IPandPortForm');
IPForm.addEventListener('submit', submitIPForm);
let IPandPortHTTP = null;
disconnectBtn.addEventListener('click', disconectVideoStream);
connectBtn.addEventListener('click', submitIPForm);

//Connect to camera
function submitIPForm(e) {
    e.preventDefault();
    const IPandPort = document.getElementById('IPandPort').value;
    if(IPandPort == "") {
        if(savedTeamNumber < 10) {
          let teamNumberIPandPort = ('0.0' + savedTeamNumber);
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
        }
        else if(savedTeamNumber < 100) {
          let teamNumberIPandPort = ('0.' + savedTeamNumber);
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
        }
        else if(savedTeamNumber < 1000) {
          let teamNumberIPandPort = ('0'+savedTeamNumber.substring(0,1) + '.' + savedTeamNumber.substring(1,3));
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
        } else {
          let teamNumberIPandPort = (savedTeamNumber.substring(0,2) + '.' + savedTeamNumber.substring(2,4));
          IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
        }
    } else {
        IPandPortHTTP = ('http://' + IPandPort + '/stream.mjpg');
    }
    console.log(IPandPortHTTP);
    img.src = IPandPortHTTP;
}

//Team number changes
ipcRenderer.on('teamNumber:is', function(e, teamNumber) {
  console.log("Team number is: "+ teamNumber)
  savedTeamNumber = teamNumber;
  teamNumberText = document.createTextNode('Team Number: ' + teamNumber);
  teamNumberTextParagraph.replaceChildren(teamNumberText, teamNumberText)
})

//Disconnect from camera
function disconectVideoStream() {
  console.log('disconnect');
  img.src = './assets/img/no-cam-feed.jpg';
  console.log(savedTeamNumber);
}

//Network Table disconnect
function wolfebyteDisconnect() {
  wolfebyteConnect(true);
  document.getElementById('Smartdashboard Table Result').innerHTML=""
  document.getElementById('Shuffleboard Table Result').innerHTML=""
  client.stop();
}

//Network Table connection and output
function wolfebyteConnect(disconnect) {
  if(!disconnect){
    client.start((isConnected, err) => {
      console.log({ isConnected, err });
    }, "0.0.0.0");
  }
  client.addListener((key, val, type, id) => {
    if(disconnect) {
      client.removeListener(key)
      return;
    }
    if (key.startsWith("/FMSInfo/")) {
      if (key == "/FMSInfo/IsRedAlliance" && (id == "add" || id == "update")) {
        if(val) {
          document.getElementById("AllainceColour").innerHTML = "Red";
        } else {
          document.getElementById("AllainceColour").innerHTML = "Blue";
        }
      }
      if (key == storage.get("FMSControlString") && (id == "add" || id == "update")) {
        let mode = "Unknown";
        let enabled = "Disabled";
        let fms = "Disconnected";

        if(teleop.includes(val)) {
          mode = "Teleop";
        } else if(autonomous.includes(val)) {
          mode = "Autonomous";
        } else if(test.includes(val)) {
          mode = "Test";
        }

        if(val % 2 == 1) enabled = "Enabled";
        if(val >= 48) fms = "Connected";

        document.getElementById("CurrentMode").innerHTML = `${mode} ${enabled}`;
        document.getElementById("isFMSConnected").innerHTML = fms;
      }
    } else if (key.startsWith("/SmartDashboard/")) {
      if(ShowSmartdashboardData){
        if (id == "add") {
          console.log({ key, val, type, id });
          addSmartDashboardData(key, val);
        }
        if (id == "update") {
          updateSmartDashboardData(key, val);
        }
      }
    } else if (key.startsWith("/Shuffleboard/")) {
      if(ShowShuffleboardData){
        if (id == "add") {
          console.log({ key, val, type, id });
          addShuffleboardData(key, val);
        }
        if (id == "update") {
          updateShuffleboardData(key, val);
        }
      }
    }
  });
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

function updateSmartDashboardData(key, val){
  key = key.slice(16)
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