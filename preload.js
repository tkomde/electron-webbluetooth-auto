const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
  //bluetoothDisconnected: () => ipcRenderer.send('disconnected-bluetooth'),
  connectionStatus: (status) => ipcRenderer.send('connection-status', status),
  bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', () => callback()),
  bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response)
})

//console.log(`argv ${process.argv}`);
const platform = process.argv
  .filter((arg) => arg.startsWith("--platform="))[0]
  ?.split("=")?.[1];

//ex. window.platform = "darwin"
contextBridge.exposeInMainWorld("platform", platform);