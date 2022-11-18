//Required and config
const electron = require('electron');
const {ipcRenderer} = electron;
const ntClient = require("wolfbyte-networktables");
const client = new ntClient.Client();
var config = null;
try {
  config = require('./config.json');
} catch (error) {
  console.log(error.stack)
}

//Team number setup
var savedTeamNumber = null;
const teamNumberTextParagraph = document.getElementById('teamNumberText');
teamNumberText = document.createTextNode(null);
teamNumberTextParagraph.appendChild(teamNumberText);

//FMS and teleop, auto, test, practice; setup
var SetFMSMode = "standard";

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
        let teamNumberIPandPort = (savedTeamNumber.substring(0,2) + '.' + savedTeamNumber.substring(2,4));
        IPandPortHTTP = ('http://10.' + teamNumberIPandPort + '.2:1181/stream.mjpg');
    } else {
        IPandPortHTTP = ('http://' + IPandPort + '/stream.mjpg');
    }
    console.log(IPandPortHTTP);
    img.src = IPandPortHTTP;
}

//Team number changes
ipcRenderer.on('teamNumber:is', function(e, teamNumber) {
  console.log("ran")
  console.log("Team number is: "+ teamNumber)
  savedTeamNumber = teamNumber;
  teamNumberText = document.createTextNode('Team Number: ' + teamNumber);
  teamNumberTextParagraph.replaceChildren(teamNumberText, teamNumberText)
})

//Disconnect from camera
function disconectVideoStream() {
  console.log('disconnect');
  img.src = './assets/img/no-cam-feed.jpg';
  console.log(savedTeamNumber)
}

//Network Table connection and output
function connect() {
  client.start((isConnected, err) => {
    console.log({ isConnected, err });
  }, "0.0.0.0");

  client.addListener((key, val, type, id) => {
    if (key.startsWith("/FMSInfo/")) {
      console.log({ key, val, type, id });
      if (key == "/FMSInfo/IsRedAlliance" && (id == "add" || id=="update")) {
        if(val) {
          document.getElementById("AllainceColour").innerHTML = "Red";
        } else {
          document.getElementById("AllainceColour").innerHTML = "Blue";
        }
      }
      if (key == config.FMSControlString && (id == "add" || id=="update")) {
        switch(val) {
          case 32:
            document.getElementById("CurrentMode").innerHTML = "Teleop Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 33:
            document.getElementById("CurrentMode").innerHTML = "Teleop Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 34:
            document.getElementById("CurrentMode").innerHTML = "Autonomous Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 35:
            document.getElementById("CurrentMode").innerHTML = "Autonomous Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 36:
            document.getElementById("CurrentMode").innerHTML = "Test Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 37:
            document.getElementById("CurrentMode").innerHTML = "Test Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Disconnected";
            break;
          case 48:
            document.getElementById("CurrentMode").innerHTML = "Teleop Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
          case 49:
            document.getElementById("CurrentMode").innerHTML = "Teleop Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
          case 50:
            document.getElementById("CurrentMode").innerHTML = "Autonomous Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
          case 51:
            document.getElementById("CurrentMode").innerHTML = "Autonomous Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
          case 52:
            document.getElementById("CurrentMode").innerHTML = "Test Disabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
          case 53:
            document.getElementById("CurrentMode").innerHTML = "Test Enabled";
            document.getElementById("isFMSConnected").innerHTML = "Connected";
            break;
        }
      }
    }
    if (key.startsWith("/SmartDashboard/")) {
      console.log({ key, val, type, id });
      if (id == "add") {
        addSmartDashboardData(key, val);
        var newKey = key.replace("/SmartDashboard/", "");
      }
      if (id == "update") {
        updateSmartDashboardData(key, val);
      }
    } else {
      return;
    }
  });
}

function addSmartDashboardData(key, val){
  key = key.slice(16)
  console.log("ASMD ran, Label: "+key+" Value: "+val)
  var html="";
  
  html="<tr><td align='left' valign='top' style='overflow:hidden;' nowrap='nowrap' max-width='200px' width='200px'>"+key+"</td><td id='"+key+" Value"+"'>"+val+"</td></tr>";
  
  document.getElementById('Smartdashboard Table Result').innerHTML+=html;

  document.getElementById('Smartdashboard Label').value="";
  document.getElementById('Smartdashboard Value').value=""; 
}

function updateSmartDashboardData(key, val){
  key = key.slice(16)
  document.getElementById(key+" Value").innerHTML = val;
}