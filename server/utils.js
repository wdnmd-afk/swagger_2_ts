import Tesseract from 'tesseract.js'
// const Tesseract = require('tesseract.js');
import { Jimp } from 'jimp';
import path from 'path'
async function recognizeCaptcha(base64String) {
    try {
        // 预处理图片
        const processedBuffer = await preprocessBase64Image(base64String);
        const worker = await Tesseract.createWorker(['eng'],1,
            {
                langPath:path.join(process.cwd(),'server/templates/'),
            },

        );
        await worker.setParameters({tessedit_char_whitelist: '0123456789+-x÷'});

        const result = await worker.recognize(base64String, {

        });


        // 提取算式
        let text = result.data.text.replace(/\s+/g, '');
        console.log('识别结果:', text);

        // 计算结果
        if (text.includes('+') || text.includes('-') || text.includes('x') || text.includes('÷')) {
            // 提取数字和运算符
            const numbers = text.match(/\d+/g).map(Number);
            const operator = text.includes('+') ? '+'
                : text.includes('-') ? '-'
                    : text.includes('x') ? '*'
                        : text.includes('÷') ? '/'
                            : null;
            //只拿识别后的首位数字
            if(!numbers[1] || !operator) return {equation:text,answer:null}
             const first = Number((numbers[0].toString())[0]);
            const second = Number(((numbers[1]).toString())[0]);
            console.log(first,second,'fff',numbers)
            // 计算结果
            if (operator === '+') {
                const answer = first + second;
                return {
                    equation: text,
                    answer: answer
                };
            } else if (operator === '-') {
                const answer = first - second;
                return {
                    equation: text,
                    answer: answer
                };
            } else if (operator === '*') {
                const answer = first * second;
                return {
                    equation: text,
                    answer: answer
                };
            }
        }

        return null;
    } catch (error) {
        console.error('验证码识别失败:', error);
        throw error;
    }
}




async function preprocessBase64Image(base64String) {
    try {
        // 移除 base64 字符串的头部信息(如果有)
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

        // 将 base64 转换为 Buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 使用 Jimp 读取图片
        const image = await Jimp.read(imageBuffer);

        // 图片预处理
        image
            .scale(1.5)  // 稍微放大
            .brightness(0.3)  // 轻微增加亮度
            .greyscale()  // 转换为灰度图
            .normalize(); // 标准化像素值
        // 转回 base64 并返回
        return await image.getBase64('image/png');

    } catch (error) {
        console.error('图片预处理失败:', error);
        throw error;
    }
}

// 添加结果验证
function validateResult(text) {
    // 验证格式是否正确
    if(!/^\d+[\+\-]\d+=\?$/.test(text)) {
        console.log('识别结果格式不正确');
        return false;
    }

    // 验证数字提取
    const numbers = text.match(/\d+/g);
    if(!numbers || numbers.length !== 2) {
        console.log('无法正确提取数字');
        return false;
    }

    return true;
}

export {recognizeCaptcha}




