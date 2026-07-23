import tools from "./tools"
const TokenKey = import.meta.env.VITE_VAT_TOKEN_KEY
const cookieConfig = {path:'/'}

export function getToken(key = TokenKey) {
    return tools.cookie.get(key)
}

export function get(key) {
    return tools.cookie.get(key)
}

export function setToken(token, key = TokenKey) {
    return tools.cookie.set(key, token, cookieConfig)
}

export function removeToken(key = TokenKey) {
    return tools.cookie.remove(key, cookieConfig)
}


