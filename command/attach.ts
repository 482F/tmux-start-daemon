import { Command } from 'cliffy/command/mod.ts'
import { tmux } from '../lib/tmux.ts'
import { commandOption } from '../common.ts'

export const attachCommand = new Command()
  .option(...commandOption.sessionName)
  .action(async function ({ sessionName }) {
    await tmux.attach(sessionName)
  })
