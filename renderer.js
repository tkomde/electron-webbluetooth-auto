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

  try {
    console.log('Requesting any Bluetooth Device...');
    ble_device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [BLE_SERVICE_UUID] //only small char-case
      }]
    });
    ble_device.addEventListener('gattserverdisconnected', onDisconnected);
    con_status = 3
    document.getElementById('device-name').innerHTML = ble_device.name || `ID: ${ble_device.id}`
    console.log(ble_device);
    ble_device.addEventListener('gattserverdisconnected', onDisconnected);
    connect();
  } catch(error) {
    console.log(error)
    console.log(`con_status: ${con_status}`)
    //not execute keepConnected() as Timer exist
    window.electronAPI.connectionStatus(-1)
    con_status = 0
  }
}
window.scanAndConnect = scanAndConnect


async function unitTry() {
  window.electronAPI.connectionStatus(3)
  con_status = 3

  //await ble_device.gatt.connect();
  const server = await ble_device.gatt.connect();
  console.log(server);
  const service = await server.getPrimaryService(BLE_SERVICE_UUID);
  console.log(service);
  ble_rw_characteristics = await service.getCharacteristic(BLE_RW_CHARACTERISTIC_UUID)
  console.log(ble_rw_characteristics)
  ble_nr_characteristics = await service.getCharacteristic(BLE_NR_CHARACTERISTIC_UUID)
  console.log(ble_nr_characteristics)
  ble_nr_characteristics.startNotifications();
  //ble_nr_characteristics.addEventListener('characteristicvaluechanged', handleNotifications);
  window.electronAPI.connectionStatus(1)
  con_status = 1
  console.log("Completed BLE connection");
}

async function connect() {
  exponentialBackoff(3 /* max retries */, 2 /* seconds delay */,
  unitTry,
  function success() {},
  function fail() {});
}

function onDisconnected() {
  console.log('Bluetooth Device disconnected');
  window.electronAPI.connectionStatus(0)
  con_status = 0

  //Windows need connect not scan
  if(window.platform === "win32"){
      connect();
  }
}

/* Utils */

// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
async function exponentialBackoff(max, delay, toTry, success, fail) {
  try {
    const result = await toTry();
    success(result);
  } catch(error) {
    if (max === 0) {
      return fail();
    }
    time('Retrying in ' + delay + 's... (' + max + ' tries left)');
    setTimeout(function() {
      exponentialBackoff(--max, delay * 2, toTry, success, fail);
    }, delay * 1000);
  }
}

function time(text) {
  console.log('[' + new Date().toJSON().substr(11, 8) + '] ' + text);
}