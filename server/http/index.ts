import { navigateTo, useFetch } from 'nuxt/app'

//服务端返回值类型
interface ResOptions<T> {
    code: number
    message: string
    result: T
    success: boolean
}

/**
 * api前端请求封装
 * @param { String } url 请求地址
 * @param { Object } options Ftech第二个参数
 * @param { Object } headers 自定义header头, 单独设置headers区分请求参数，也好设置类型
 */
const customFetch = async (url: string, options?: any, headers?: any) => {
    try {
        // 3.0正式版环2境变量要从useRuntimeConfig里的public拿
        const {
            public: { API_HOST }
        } = useRuntimeConfig()
        // 接口地址
        // const reqUrl = API_HOST + url
        const reqUrl = '/app/v1' + url
        // 设置请求头，允许在调用函数时传入其他自定义 headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        }
        // 设置key
        const data = await $fetch(reqUrl, { ...options, headers: defaultHeaders })
        const res = data as ResOptions<any>
        return res
    } catch (err: any) {
        if (err.response && err.response.status === 401) {
            // 处理 401 错误的逻辑
            console.log('Unauthorized User');
            navigateTo("/")
        } else {
            // 处理其他错误的逻辑
            console.log('error：', err.message);
        }
        return Promise.reject(err)
    }
}

export default class Http {
    get(url: string, params?: any, headers?: any) {
        return customFetch(url, { method: 'get', params }, headers)
    }
    post(url: string, body?: any, headers?: any) {
        return customFetch(url, { method: 'post', body }, headers)
    }
    put(url: string, body?: any, headers?: any) {
        return customFetch(url, { method: 'put', body }, headers)
    }
    delete(url: string, body?: any, headers?: any) {
        return customFetch(url, { method: 'delete', body }, headers)
    }
    postFormData(url: string, body?: any, headers?: any, type?: any) {
        const formBody = new URLSearchParams()
        for (const key in body) {
            formBody.append(key, body[key])
        }
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return customFetch(url, {
            method: type,
            body: formBody.toString()
        }, headers)
    }
}
