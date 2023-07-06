import * as fs from 'fs';
import { ConsoleLogger, LogLevel, RP2040 } from 'rp2040js';
import { bootromB1 } from './bootrom';
import { loadHex } from './intelhex';
//import { GDBTCPServer } from '../src/gdb/gdb-tcp-server';

// Create an array with the compiled code of blink
// Execute the instructions from this array, one by one.
console.log("Running Tests");

const hex = fs.readFileSync('HelloPico.hex', 'utf-8');
const mcu = new RP2040();
mcu.loadBootrom(bootromB1);
loadHex(hex, mcu.flash, 0x10000000);

//const gdbServer = new GDBTCPServer(mcu, 3333);
//console.log(`RP2040 GDB Server ready! Listening on port ${gdbServer.port}`);

// TODO: collect uart bytes and compare
mcu.uart[0].onByte = (value) => {
  process.stdout.write(new Uint8Array([value]));
};

mcu.core.PC = 0x10000000;
mcu.execute();
