export const commandOption = {
  sessionName: [
    '--session-name <sessionName:string>',
    'session name',
    { default: Deno.cwd() },
  ],
} as const
