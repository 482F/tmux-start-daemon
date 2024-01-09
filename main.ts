#!/usr/bin/env -S deno run --allow-run=tmux,mkfifo --allow-env --allow-read --allow-write
import { Command, CompletionsCommand } from 'cliffy/command/mod.ts'

import { startCommand } from './command/start.ts'
import { attachCommand } from './command/attach.ts'
import { stachCommand } from './command/stach.ts'
import { stopCommand } from './command/stop.ts'

await new Command()
  .name('tsd')
  .action(function () {
    this.showHelp()
  })
  .command('start', startCommand)
  .command('attach', attachCommand)
  .command('stach', stachCommand)
  .command('stop', stopCommand)
  .command('completions', new CompletionsCommand())
  .hidden()
  .parse(Deno.args)
