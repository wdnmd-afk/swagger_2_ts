import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import jsrsasign from 'jsrsasign'
function SHA256withRSA(newStr: string, k: string) {
    let rsa = new jsrsasign.RSAKey()
    // SHA256withRSA私钥
    // const k = `-----BEGIN PRIVATE KEY-----MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJj+EHbKO/0zY5CZRoVKxt4yrD52kp//TFsfgyI/VqOdNdAVNxnAGXA+cPoO3yxa1NgBOAo6+CxP0UDLIlbV8ClGhtdzqrMu6dDUVEFbLQYJE3CDmsBeFQYDj0oxJXeEwPr/9D1H8bLEuIPd+i8ohLOYGPztRozfhjqerKd7X3TbAgMBAAECgYBORrcvv/r/alqHshRlwEONjgmYj9wnJlzvxmi2jgeLALV2uFQPxbx+NERjfFZtADAkMEN24IL3UQM0DnqMSTttaFZli0dF7RjKgaobcwZsUcR9mUj0EneZ78c4IHKJf8YanByvJRleP7slaLqiEy/tiiF4Ap6xowXJU/cloDuccQJBAMd95KmZJbh4EsLQO1C7Q+hxtz+zOCHrYlEk6iXp2F7P9X/xvW9etUJzODRS8rvyoqDeQT4BXgLk9jmcCK7DQ6kCQQDEVEf48npJ/0FQQsa/dvZqj2ujFwhff6glJDCarzBdr4ci02A7dIpSsCR5gC+XbJzFu8JJuwvGWT0NVKYaUIbjAkB9AlsEHEAS9Mts4OgKkw7e3kOi2z/VoZcemi9QStWXtGF3J5k57PNRDLqvrzsEo+tdO2lO3bR3w9q4Bxs5yIrhAkEAmnt25nxlnTQswGrK2H1TCCYyG/JTtFFOjWsck5qmBBHJ061fW2koLkhLaw9iY1QjR7Ol/T4g1cICOCsTSEF04QJBALy0Jxy9kjip8c86KQjzCLQSEMVCJZ2NTXrbux6eXARYon1l0IviEQ2XKXNlwuTrUATHMYo5K1jhPlbEHW7xsB4=-----END PRIVATE KEY-----`
    // 将私钥 转成16进制
    rsa = jsrsasign.KEYUTIL.getKey(k)
    // 采用SHA256withRSA进行加密
    const sig = new jsrsasign.KJUR.crypto.Signature({
        alg: 'SHA256withRSA'
    })
    // 算法初始化
    sig.init(rsa)

    // 对123456进行加密
    sig.updateString(newStr)
    // 加密后的16进制转成base64，这就是签名了
    return jsrsasign.hextob64(sig.sign())
}
function encryptAes(data: any, aesKey: string) {
    if (aesKey && data) {
        const key = CryptoJS.enc.Utf8.parse(aesKey)
        return CryptoJS.AES.encrypt(data, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        } as any).toString()
    } else {
        return data
    }
}
function decrypt(encryptedBase64Str: string, aesKey: string) {
    const val = CryptoJS.enc.Base64.parse(encryptedBase64Str)
    const src = CryptoJS.enc.Base64.stringify(val)
    const options = {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }
    const key = CryptoJS.enc.Utf8.parse(aesKey)
    const decryptedData = CryptoJS.AES.decrypt(src, key, options)
    const decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
}
function setEncrypt(data: string, key: string) {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(key)
    return encryptor.encrypt(data)
}
export { encryptAes, setEncrypt, decrypt, SHA256withRSA }
