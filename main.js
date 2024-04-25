const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')

let bluetoothPinCallback
let selectBluetoothCallback

let createMainIsFirstTime = true;

async function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //open developer console
  mainWindow.webContents.openDevTools();

  //Workaround: it seems that the event listener remains for some reason when you click on x on a Mac
  if (createMainIsFirstTime) {
    createMainIsFirstTime = false;

    mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
      event.preventDefault()
      selectBluetoothCallback = callback
      const result = deviceList.find((device) => {
        console.log(device)
        return (device.deviceName.indexOf("JINS") === 0 || device.deviceName.indexOf("ESR") === 0)
      })
      if (result) {
        callback(result.deviceId)
      } else {
        //console.log("Still not found")
      }
    })

    ipcMain.on('cancel-bluetooth-request', (event) => {
      selectBluetoothCallback('')
    })

    // Listen for a message from the renderer to get the response for the Bluetooth pairing.
    ipcMain.on('bluetooth-pairing-response', (event, response) => {
      bluetoothPinCallback(response)
    })

    mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
      bluetoothPinCallback = callback
      // Send a message to the renderer to prompt the user to confirm the pairing.
      mainWindow.webContents.send('bluetooth-pairing-request', details)
    })
  }

  mainWindow.loadFile('index.html')

  //Attempt to connect at startup
  await mainWindow.webContents.executeJavaScript(
    `scanAndConnect();`,
    true
  );
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
