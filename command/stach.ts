import { Command } from 'cliffy/command/mod.ts'
import { tmux } from '../lib/tmux.ts'
import { commandOption } from '../common.ts'

export const stachCommand = new Command()
  .option(...commandOption.sessionName)
  .arguments('<commands...>')
  .action(async function ({ sessionName }, ...commands) {
    await tmux.newWindow(
      sessionName,
      sessionName,
      commands.join(' '),
      { preventStop: true },
    ) ?? {}
    await tmux.attach(sessionName)
  })
