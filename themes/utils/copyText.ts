import { ElNotification } from 'element-plus';

export const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
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
