const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const config = require("./config.json");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
// add auto updater and toast messages for updates and errors

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  const splashWindow = new BrowserWindow({
    width: 256,
    height: 256,
    show: true,
    frame: false,
    transparent: true,
    maximizable: false,
    resizable: false,
  });
  if (config.splashScreen) {
    splashWindow.loadFile("./assets/html/splash.html");
    mainWindow.loadFile("index.html");
    mainWindow.once("ready-to-show", () => {
      setTimeout(() => {
        splashWindow.destroy();
        mainWindow.show();
      }, 1000);
    });
  } else {
    mainWindow.loadFile("index.html");
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });
  }

  //needs to be here to access "mainWindow"
  ipcMain.on('teamNumber:is', function(e, teamNumber) {
    mainWindow.webContents.send('teamNumber:is', teamNumber);
    const window = BrowserWindow.getFocusedWindow();
    window.close();
  })

  //menu system on windows just need this for the camera integration right now
  // Create menu
  if (process.platform !== 'darwin') {
    var menu = Menu.buildFromTemplate([
      {
        label: 'View',
        submenu: [
          {role: 'reload'},
          {role: 'forceReload'},
          {type: 'separator'},
          {role: 'toggleDevTools'},
        ]
      },
      {
        label: 'Window',
        submenu: [
          {role: 'zoomin'},
          {role: 'zoomout'},
          {role: 'resetZoom'},
          {role: 'togglefullscreen'},
          {type: 'separator'},
          {role: 'quit'},
        ]
      },
      {
        label: 'Settings',
        submenu: [
          {label: 'Team Number',
          click() {
            const TNwin = new BrowserWindow({frame: false, 
              transparent: true, 
              width: 400, 
              height: 160, 
              show: true,
              alwaysOnTop: true,
              webPreferences: {
              nodeIntegration: true,
              contextIsolation: false,
            }});
            TNwin.loadFile("./assets/html/changeTeamNumber.html");
            TNwin.on('close', function() {win = null})
            TNwin.show()
          }},
        ]
      },
      {
        label: 'Help',
        submenu: [
          {label: 'Github Page',
          click() {shell.openExternal('https://github.com/FRC-Resources/Foundation')}
          },
          {label: 'NI Drive Station',
          click() {shell.openExternal('https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html')}
          },
          {type: 'separator'},
          {label: 'WPI Network Tables',
          click() {shell.openExternal('https://docs.wpilib.org/en/stable/docs/software/networktables/index.html')}
          },
          {label: 'Wolfebyte Network Tables',
          click() {shell.openExternal('https://libraries.io/npm/wolfbyte-networktables')}
          },
        ]
      }
    ])
    
    Menu.setApplicationMenu(menu);
  }
}
app.on("ready", () => setTimeout(createWindow, 400));
//app.disableHardwareAcceleration();