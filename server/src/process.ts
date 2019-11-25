import { SpawnOptionsWithoutStdio, spawn, ChildProcess } from 'child_process';

import { EventEmitter } from 'events';
import { parse } from 'shell-quote';

export class Process extends EventEmitter {
    private output = '';
    private process?: ChildProcess;

    exec(command: string, options?: SpawnOptionsWithoutStdio) {
        this.output = '';
        const opts = parse(command) as string[];

        return new Promise(resolve => {
            this.process = spawn(opts[0], opts.slice(1), options);
            this.process.stdout.on('data', this.received.bind(this));
            this.process.stderr.on('data', this.received.bind(this));
            this.process.on('exit', code => resolve(code));
        });
    }

    kill(): boolean | undefined {
        this.process?.kill();
        const killed = this.process?.killed;
        this.process = undefined;

        return killed;
    }

    getOutput() {
        return this.output;
    }

    private received(data: Buffer) {
        this.emit('data', data);
        this.output += data.toString();
    }
}
