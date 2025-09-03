import tools from "./tools.ts"
const TokenKey = import.meta.env.VITE_VAT_TOKEN_KEY
const cookieConfig = {path:'/'}

export function getToken() {
    return tools.cookie.get(TokenKey)
}

export function get(key: String) {
    return tools.cookie.get(key)
}

export function setToken(token: String) {
    return tools.cookie.set(TokenKey, token, cookieConfig)
}

export function removeToken() {
    return tools.cookie.remove(TokenKey, cookieConfig)
}