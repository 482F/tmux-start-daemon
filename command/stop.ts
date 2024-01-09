import { Command } from 'cliffy/command/mod.ts'
import { tmux } from '../lib/tmux.ts'
import { commandOption } from '../common.ts'

export const stopCommand = new Command()
  .option(...commandOption.sessionName)
  .action(async function ({ sessionName }) {
    await tmux.stop(sessionName, sessionName)
  })
