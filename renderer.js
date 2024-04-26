// BLE variables
let ble_device;
let ble_server;
let ble_service;
let ble_rw_characteristics;
let ble_nr_characteristics;
const BLE_SERVICE_UUID = 'f5dc3761-ce15-4449-8cfa-7af6ad175056';
const BLE_RW_CHARACTERISTIC_UUID = 'f5dc3762-ce15-4449-8cfa-7af6ad175056';
const BLE_NR_CHARACTERISTIC_UUID = 'f5dc3764-ce15-4449-8cfa-7af6ad175056';

//const BLE_SERVICE_UUID = 'd6f25bd1-5b54-4360-96d8-7aa62e04c7ef';
//const BLE_RW_CHARACTERISTIC_UUID = 'd6f25bd2-5b54-4360-96d8-7aa62e04c7ef';
//const BLE_NR_CHARACTERISTIC_UUID = 'd6f25bd4-5b54-4360-96d8-7aa62e04c7ef';

let con_status = 0; //0: disconnected, 1: connected, 2: attempting connect, 3: fetching services/charactistics

async function scanAndConnect () {
  window.electronAPI.connectionStatus(2)
  con_status = 2
  console.log("scanAndConnect presssed.")
  await navigator.bluetooth.requestDevice({
    filters: [{
      services: [BLE_SERVICE_UUID] //only small char-case
    }]
  })
  .then(device => {
    window.electronAPI.connectionStatus(3)
    con_status = 3
    ble_device = device;
    document.getElementById('device-name').innerHTML = device.name || `ID: ${ble_device.id}`
    console.log(device);
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => {
    console.log(server);
    return server.getPrimaryService(BLE_SERVICE_UUID);
  })
  .then(service => {
    console.log(service);
    ble_service = service;
    return Promise.all([
      ble_service.getCharacteristic(BLE_NR_CHARACTERISTIC_UUID)
        .then(characteristic => {
          ble_nr_characteristics = characteristic;
          ble_nr_characteristics.startNotifications();
          //ble_nr_characteristics.addEventListener('characteristicvaluechanged', handleNotifications);
          console.log("characteristic:", characteristic);
        }),
      ble_service.getCharacteristic(BLE_RW_CHARACTERISTIC_UUID)
        .then(characteristic => {
          window.electronAPI.connectionStatus(1)
          con_status = 1

          ble_rw_characteristics = characteristic;
          console.log("characteristic:", characteristic);
        })
    ]);
  })
  .then(() => {
    console.log("Completed BLE connection");
  })
  .catch(error => {
    console.log(error)
    console.log(`con_status: ${con_status}`)
    
    // Sometimes connect succeeds but fails to get characteristic.
    // Therefore, when an error occurs with con_status == 3, it is considered to be equivalent to disconnection and reconnect.
    if(con_status == 3){
      window.electronAPI.connectionStatus(0)
    }else{
      //not execute keepConnected() as Timer exist
      window.electronAPI.connectionStatus(-1)
    }

    con_status = 0
  });

};

//To call in main
window.scanAndConnect = scanAndConnect
document.getElementById('scan_and_connect').addEventListener('click', scanAndConnect)


function cancelRequest () {
  //
  console.log("cancelRequest presssed.")
  window.electronAPI.cancelBluetoothRequest()
}

document.getElementById('cancel').addEventListener('click', cancelRequest)


function disconnect () {
  console.log("Disconnect pressed.")
  ble_device.gatt.disconnect();
}

function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  console.log(`Bluetooth Device disconnected.`);
  window.electronAPI.connectionStatus(0)
}
document.getElementById('disconnect').addEventListener('click', disconnect)


window.electronAPI.bluetoothPairingRequest((event, details) => {
  const response = {}

  switch (details.pairingKind) {
    case 'confirm': {
      response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
      break
    }
    case 'confirmPin': {
      response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
      break
    }
    case 'providePin': {
      const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
      if (pin) {
        response.pin = pin
        response.confirmed = true
      } else {
        response.confirmed = false
      }
    }
  }

  window.electronAPI.bluetoothPairingResponse(response)
})
