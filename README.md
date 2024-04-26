# electron-webbluetooth-auto

- Automatically connect BLE device at startup with electron.
- Automatically reconnect BLE device with electron.

## Run

- npm i
- npx electron .

## How it works

- In main process, call renderer scanAndConnect() function by executeJavaScript() with userGesture = true 
- Reconnection is done using a different approach because of the different behavior of each OS platform as follows
  - In the case of Windows
      - It is necessary to reconnect to a device instance that has already been obtained (even if another requestDevice() is made, it is not found).
  - In case of Mac
      - Devices that have been disconnected for a while are forgotten, so it is necessary to restart over again from requestDevice().

## Link

[Electron Documentation - webContents - select-bluetooth-device](https://electronjs.org/docs/api/web-contents#event-select-bluetooth-device)
[Electron Documentation - webContents - executejavascriptcode-usergesture](https://electronjs.org/docs/api/web-contents#contentsexecutejavascriptcode-usergesture)
[Web Bluetooth / Automatic Reconnect Sample](https://googlechrome.github.io/samples/web-bluetooth/automatic-reconnect.html)

## License

MIT