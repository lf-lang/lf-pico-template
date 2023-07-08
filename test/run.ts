import * as fs from 'fs';
import * as path from 'path';
import { ConsoleLogger, LogLevel, RP2040 } from 'rp2040js';
import { bootromB1 } from './bootrom';
import { loadHex } from './intelhex';
//import { GDBTCPServer } from '../src/gdb/gdb-tcp-server';

const binDir = '../target/bin'
const curDir = '.'
const hexDir = `${curDir}/hex`
console.log("==== Running Tests ====");

async function readBinDir(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        // TODO: maybe use async await 
        try {
            const dirFiles = fs.readdirSync(path, { withFileTypes: true });
            const hexFiles: string[] = dirFiles
                .filter((dirent) => dirent.isFile())
                .map((dirent) => dirent.name)
                .filter((fname) => fname.split('.').pop() === 'hex');
            console.log(hexFiles);
            resolve(hexFiles);
        } catch {
            reject("ERROR: invalid dir read");
        }
    });
}

async function runTestHex(path: string): Promise<string> {
    return new Promise<string>((resolve) => {
        const hex = fs.readFileSync(path, 'utf-8');
        const mcu = new RP2040();
        const uartOut = [];
        mcu.loadBootrom(bootromB1);
        loadHex(hex, mcu.flash, 0x10000000);
        mcu.uart[0].onByte = (value) => {
            uartOut.push(value);
        }; 
        mcu.core.PC = 0x10000000;
        //
        // TODO: wrap execute in timeout
        mcu.execute();
        setTimeout(() => {
            if(!mcu.executing) {
                resolve('SUCCESS');
            } else {
                mcu.stop();
                resolve('FAIL');
            }
        }, 12000); // 5 seconds
    });
    //const gdbServer = new GDBTCPServer(mcu, 3333);
    //console.log(`RP2040 GDB Server ready! Listening on port ${gdbServer.port}`);
}

async function runAllTestHex(hexPaths: string[]): Promise<string> {
    const testRuns = hexPaths.map((path) => runTestHex(path));
    const results = await Promise.allSettled(testRuns);
    return new Promise<string>((resolve) => {
        console.log(results);
        resolve('SUCCESS');
    });
}


// TODO read out hex path list
readBinDir(curDir)
    .then((files) => {
        const paths = files.map((fname) => `${curDir}/${fname}`); 
        console.log(paths);
        runAllTestHex(paths)
            .then((result) => {
                console.log(result);
            });
    })
    .catch((error) => console.log(error));

