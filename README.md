# electron-webbluetooth-auto

Automatically connect BLE device at app startup with electron.

## Run

- npm i
- npx electron .

## How it works

- In main process, call renderer scanAndConnect() function by executeJavaScript() with userGesture = true 
- Reconnect at...
  - Disconnected.
  - Scan timeout(Stop Scan once and Scan again.).

## TODO

It may be locked if it stops with con_status == 3.

## Link

[Electron Documentation - webContents - select-bluetooth-device](https://electronjs.org/docs/api/web-contents#event-select-bluetooth-device)
[Electron Documentation - webContents - executejavascriptcode-usergesture](https://electronjs.org/docs/api/web-contents#contentsexecutejavascriptcode-usergesture)
[Web Bluetooth / Automatic Reconnect Sample](https://googlechrome.github.io/samples/web-bluetooth/automatic-reconnect.html)

## License

MIT