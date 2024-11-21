export const AUTUMN_CORPORATION_IDS: number[] = [98785281, 98784256]

export const USER_AGENT = (env: Env): string => {
    return `${env.APPLICATION_NAME} (${env.APPLICATION_EMAIL})`
}