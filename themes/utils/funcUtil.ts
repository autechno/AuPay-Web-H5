import { ElNotification } from 'element-plus';

// 复制文本
export const copyText = async (text: string) => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        ElNotification({
            title: '成功',
            message: '链接已复制到剪贴板!',
            type: 'success',
            duration: 2000,
        });
    } catch (err) {
        console.error('复制文本时出错: ', err);
        ElNotification({
            title: '错误',
            message: '复制链接失败!',
            type: 'error',
            duration: 2000,
        });
    }
};
// 设置 headers 的函数
export const setHeadersAuth = (headers, form) => {
    if (form && form.value) {
        if (form.value.emailCodeToken !== undefined && form.value.emailCodeToken !== '') {
            headers['Email-Token'] = form.value.emailCodeToken;
        }
        if (form.value.googleToken !== undefined && form.value.googleToken !== '') {
            headers['Google-Auth-Token'] = form.value.googleToken;
        }
        if (form.value.passwordToken !== undefined && form.value.passwordToken !== '') {
            headers['Assets-Password-Token'] = form.value.passwordToken;
        }
    } else {
        console.error("form or form.value is undefined");
    }
};
// 返回传参
export const getQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    return {
        currencyId: urlParams.get('currencyId'),
        currencyChainId: urlParams.get('currencyChainId'),
    };
};

export const formatAddressString = (input: string, endNumber: number, count: number) => {
    if (input.length > count) {
        const start = input.substring(0, endNumber);
        const end = input.substring(input.length - 4);
        return `${start}...${end}`;
    }
    return input;
}

