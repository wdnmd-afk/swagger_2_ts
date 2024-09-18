import axios,{AxiosPromise} from "axios";
const service = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        gray_version: '2.0',
    },
    timeout: 1800000,
})

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
        return service.post(url, params, { isShowLoading: loading, isUpload, headers })
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