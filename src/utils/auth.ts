import tools from "./tools.ts"
const TokenKey = import.meta.env.VITE_VAT_TOKEN_KEY
const cookieConfig = {path:'/'}

export function getToken(key: String = TokenKey) {
    return tools.cookie.get(key)
}

export function get(key: String) {
    return tools.cookie.get(key)
}

export function setToken(token: String, key: String = TokenKey) {
    return tools.cookie.set(key, token, cookieConfig)
}

export function removeToken(key: String = TokenKey) {
    return tools.cookie.remove(key, cookieConfig)
}


