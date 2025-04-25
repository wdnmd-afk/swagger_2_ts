import axios, {AxiosPromise} from "axios";
import {encryptAes, SHA256withRSA, decrypt} from './methods'

const service = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        gray_version: '2.0',
    },
    timeout: 1800000,
})
const getUUID = () => {
    let d = new Date().getTime()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    return uuid
}
const aesKey: string = 'fd23f538f25a87fb1f68e8835811d240'
const publicSystemConfig = {
    //https://kdcloud.kangdulab.com/weixincenter/wx/mp/scan/redirect
    redirect_uri: 'https://kdcloud.kangdulab.com/weixincenter/wx/mp/scan/redirect',
    //wwf3933eb1ab589448
    appid: 'wwa21fc51537cd285e', // wwa21fc51537cd285e
    staffid: '1554439570467196928',
    clientId: 'kangdulab-admin'
}

const reqResolve = (config) => {
    console.log(config.url)
    config.headers.Authorization = `${localStorage.getItem('token')}`
    if (config.url.includes('/https-api')) {
        let requestUrl = config.url.replace('/https-api', '') as string

        console.log(requestUrl, 'req')
        // config.url = requestUrl
        config.headers.clientId = publicSystemConfig.clientId
        config.headers.timestamp = Date.now()
        config.headers.requestId = getUUID()
        let sign = ''
        sign += 'method=' + (config.method).toUpperCase() + '&'
        sign += 'url=' + requestUrl + '&'
        sign += 'timestamp=' + config.headers.timestamp + '&'
        sign += `clientId=${publicSystemConfig.clientId}&`
        sign += 'requestId=' + config.headers.requestId + '&'
        if (config.method == 'post' && config.headers.isUpload) {
            sign += 'body=&'
        } else if (config.method == 'post' && config.data && !config.headers.isUpload) {
            sign += 'body=' + JSON.stringify(config.data) + '&'
            config.data = encryptAes(JSON.stringify(config.data), aesKey)
        } else if (config.method == 'get') {
            sign += 'body=&'
        }
        const k = `-----BEGIN PRIVATE KEY-----MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJj+EHbKO/0zY5CZRoVKxt4yrD52kp//TFsfgyI/VqOdNdAVNxnAGXA+cPoO3yxa1NgBOAo6+CxP0UDLIlbV8ClGhtdzqrMu6dDUVEFbLQYJE3CDmsBeFQYDj0oxJXeEwPr/9D1H8bLEuIPd+i8ohLOYGPztRozfhjqerKd7X3TbAgMBAAECgYBORrcvv/r/alqHshRlwEONjgmYj9wnJlzvxmi2jgeLALV2uFQPxbx+NERjfFZtADAkMEN24IL3UQM0DnqMSTttaFZli0dF7RjKgaobcwZsUcR9mUj0EneZ78c4IHKJf8YanByvJRleP7slaLqiEy/tiiF4Ap6xowXJU/cloDuccQJBAMd95KmZJbh4EsLQO1C7Q+hxtz+zOCHrYlEk6iXp2F7P9X/xvW9etUJzODRS8rvyoqDeQT4BXgLk9jmcCK7DQ6kCQQDEVEf48npJ/0FQQsa/dvZqj2ujFwhff6glJDCarzBdr4ci02A7dIpSsCR5gC+XbJzFu8JJuwvGWT0NVKYaUIbjAkB9AlsEHEAS9Mts4OgKkw7e3kOi2z/VoZcemi9QStWXtGF3J5k57PNRDLqvrzsEo+tdO2lO3bR3w9q4Bxs5yIrhAkEAmnt25nxlnTQswGrK2H1TCCYyG/JTtFFOjWsck5qmBBHJ061fW2koLkhLaw9iY1QjR7Ol/T4g1cICOCsTSEF04QJBALy0Jxy9kjip8c86KQjzCLQSEMVCJZ2NTXrbux6eXARYon1l0IviEQ2XKXNlwuTrUATHMYo5K1jhPlbEHW7xsB4=-----END PRIVATE KEY-----`
        config.headers.sign = SHA256withRSA(sign, k)
    }
    return config
}
const reqReject = (config) => {
}

/** 响应拦截 */
function resResolve(response) {
    // const SystemStore = useSystemStore()
    // SystemStore.setLoading()
    const {code, requestid, msg, access_token} = response.data
    if (code == '00000') {
        const isHttps = localStorage.getItem('isHttps')
        if (isHttps) {
            response.data.data = decrypt(response.data.data, aesKey)
        }
        return response.data
    }
    return response

}

/** 响应错误拦截 */
function resReject(error) {
    // const SystemStore = useSystemStore()
    // SystemStore.setLoading()
    // const router = useRouter()

    if (error.code === 'ERR_CANCELED') {
        //处理接口被取消了
        return new Promise(() => {
        })
    }
    const {code, msg, body, httpstate, statusCodeValue, statusCode, requestid}: any = error.response!.data

    return Promise.reject(new Error(`requestid:${requestid}\n错误信息:${msg}` || 'Error'))
}

service.interceptors.request.use(reqResolve, reqReject)
service.interceptors.response.use(resResolve, resReject)

class Http {
    public static get(url: string, params: any = ''): AxiosPromise {
        return service.get(url, {
            params,
        })
    }

    public static post(url: string, params: any = {}, loading = false, isUpload = false, headers?: any): AxiosPromise {
        if (JSON.stringify(params) === '{}') {
            return service.post(url)
        }
        return service.post(url, params, {isShowLoading: loading, isUpload, headers})
    }

    public static async postBlob(url: string, param: any) {
        return service({
            method: 'post',
            url,
            data: param,
            responseType: 'blob',
            headers: {},
        })
    }

    public static async postFile(url: string, data: any, loading = false) {
        return service.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                isUpload: true,
            },
            isShowLoading: loading,
        })
    }
}

export {Http}