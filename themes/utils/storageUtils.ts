export function getHeader() {
    const userStore = UseUserStore()
    const baseStore = UseBaseStore()
    const token = userStore.appToken
    const defaultHeaders = baseStore.headerData
    if(token)
        // return { 'X-Access-Token': token, ...defaultHeaders }
        return { 'Authorization': 'Bearer ' + token, ...defaultHeaders }
    else
        return defaultHeaders
}