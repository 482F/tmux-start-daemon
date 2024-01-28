import $ from 'dax/mod.ts'

function escapeSessionName(sessionName: string) {
  return sessionName.replaceAll(/[\.:]/g, '-')
}

export const tmux = {
  async newWindow(
    sessionName: string,
    windowName: string,
    command: string,
    { preventStop = false } = {},
  ) {
    const escapedSessionName = escapeSessionName(sessionName)
    const [isSessionExists, isWindowExists] = await Promise.all([
      tmux.getSessionNames().then((ns) => ns.includes(escapedSessionName)),
      tmux.getWindowNames(escapedSessionName).then((ns) => ns.includes(windowName)),
    ])

    if (isSessionExists && isWindowExists) {
      return
    }

    const namedPipePath = await Deno.makeTempFile()
    await Deno.remove(namedPipePath).catch(() => {})
    await $`mkfifo ${namedPipePath}`
    const pipePromise = Deno.open(namedPipePath)

    const preventStopCommand = 'read -p "press Enter..."'
    const innerCommand = [
      `tmux pipe-pane -O -t "\$TMUX_PANE" "cat > ${namedPipePath}"`,
      command,
      `rm ${namedPipePath}`,
      preventStop ? `${preventStopCommand}` : undefined,
    ]
      .filter(Boolean)
      .join(';')

    const tmuxCommand = isSessionExists
      ? `new-window -t ${$.escapeArg(escapedSessionName)}`
      : `new-session -s ${$.escapeArg(escapedSessionName)}`

    $.raw`tmux -2 ${tmuxCommand} -n ${$.escapeArg(windowName)} -d ${
      $.escapeArg(innerCommand)
    }`
      .spawn()

    return {
      readableStream: await pipePromise.then((pipe) => pipe.readable),
      async sendKeys(keys: string) {
        await $`tmux send-keys -t ${escapedSessionName}:${windowName} ${keys}`
      },
    }
  },
  async attach(sessionName: string) {
    const escapedSessionName = escapeSessionName(sessionName)
    await $`tmux a -t ${escapedSessionName}`.env({ TMUX: '' })
  },
  async stop(sessionName: string, windowName: string) {
    const escapedSessionName = escapeSessionName(sessionName)
    await $`tmux kill-session -t ${escapedSessionName}:${windowName}`
  },
  async getSessionNames(): Promise<string[]> {
    return await $`tmux list-sessions -F#S`
      .text()
      .then((r) => r.split('\n'))
  },
  async getWindowNames(sessionName: string): Promise<string[]> {
    const escapedSessionName = escapeSessionName(sessionName)
    const result = await $`tmux list-windows -t ${escapedSessionName} -F#S`
      .quiet()
      .noThrow()
    if (result.code !== 0) {
      return []
    } else {
      return result
        .stdout
        .split('\n')
    }
  },
}
