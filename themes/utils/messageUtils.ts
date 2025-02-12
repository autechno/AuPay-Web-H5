import { ElMessage } from 'element-plus';

const DEFAULT_ERROR_MESSAGE = '请求失败，请重试';
const DEFAULT_VALIDATION_MESSAGE = '表单验证失败';

// 显示成功消息的函数
export const showSuccessMessage = (code: number, message: string): void => {
    // TODO 后期处理CODE
    ElMessage.success(message);
};

// 显示错误消息的函数
export const showErrorMessage = (code: number, message: string): void => {
    // TODO 后期处理CODE
    ElMessage.error(message);
};

// 显示异常错误消息的函数
export const showCatchErrorMessage = (): void => {
    ElMessage.error( DEFAULT_ERROR_MESSAGE);
};


// 显示表单验证失败消息的函数
export const showValidationErrorMessage = (): void => {
    ElMessage.error( DEFAULT_VALIDATION_MESSAGE);
};

