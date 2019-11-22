import { SpawnOptionsWithoutStdio, spawn } from 'child_process';

import { EventEmitter } from 'events';
import { parse } from 'shell-quote';

export class Process extends EventEmitter {
	private output = '';

	exec(command: string, options?: SpawnOptionsWithoutStdio) {
		const opts = parse(command) as string[];
		const executor = spawn(opts[0], opts.slice(1), options);
		this.output = '';

		return new Promise(resolve => {
			const receive = (data: Buffer) => {
				this.emit('data', data);
				this.output += data.toString();
			};
			executor.stdout.on('data', receive);
			executor.stderr.on('data', receive);
			executor.on('exit', code => resolve(code));
		});
	}

	getOutput() {
		return this.output;
	}
}
