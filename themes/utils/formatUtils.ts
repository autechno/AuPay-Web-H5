// 常量，存储货币和链的信息
const storeData = {
    chains : [
        {"code": 0, "name": "BTC", "title": "比特币链" },
        {"code": 2, "name": "Ethereum", "title": "以太坊"  },
        {"code": 3, "name": "TRON", "title": "波厂" }
    ],
    currencyChains : [
        { name: 'BTC', title: 'Bitcoin', code: 1 },
        { name: 'ETH', title: 'Ethereum', code: 2 },
        { name: 'USDT', title: 'TetherUS', code: 3 },
        { name: 'TRX', title: 'TRON', code: 4 },
        { name: 'OZC', title: 'OZCoin', code: 5 },
        { name: 'TOTO', title: 'TOTO', code: 6 },
    ],
    searchStatus: [
        { name: 'All', title: '全部', code: '' },
        { name: 'Y', title: '是', code: true },
        { name: 'N', title: '否', code: false },
    ],
    hideBalance: [
        { name: 'Y', title: '显示', code: 1 },
        { name: 'N', title: '隐藏', code: 2 },
    ],
    currency: [
        { name: '人民币',  code: 'CNY', sign: '¥' },
        { name: '美元', code: 'USD', sign: '$' }
    ],
    language: [
        { name: '英文', code: 'EN', },
        { name: '中文', code: 'CN',}
    ],
    country: [
        { name: "中国", code: "China" },
        { name: "美国", code: "USA" },
    ],
    trade: [
        { code: 1, name: "充值", title: "RECHARGE" },
        { code: 2, name: "提款", title: "WITHDRAW" },
        { code: 71, name: "闪兑-兑入", title: "FAST_SWAP_IN" },
        { code: 72, name: "闪兑-兑出", title: "FAST_SWAP_OUT" },
        { code: 81, name: "转账-转入", title: "TRANSFER_IN" },
        { code: 82, name: "转账-转出", title: "TRANSFER_OUT" },
        { code: 91, name: "费用-收入", title: "FEE_IN" },
        { code: 92, name: "费用-支出", title: "FEE_OUT" },
        { code: 3, name: "用户资金归集", title: "SYS_USER_TO_TRANSFER" },
        { code: 4, name: "提款钱包补充资金", title: "SYS_TRANSFER_TO_WITHDRAW" },
        { code: 5, name: "中转钱包资产归集", title: "SYS_TRANSFER_TO_STORE" },
        { code: 6, name: "补充gas费", title: "SYS_GAS_TO_OPERATOR" },
        { code: 101, name: "平台注资", title: "PLATFORM_IN" },
    ],

};

// 状态常量
export const StatusEnum = {
    ACCOUNT: {
        0: '待处理',
        1: '交易中',
        2: '交易成功',
        3: '交易失败',
        4: '处理异常',
        5: '挂起',
        10: '发起申请 待审批',
    },
    WORK:{
        OPEN: '未解决',
        IN_PROGRESS: '进行中',
        RESOLVED: '已解决',
        CLOSED: '已关闭',
        ACTIVE: '进行中',
        INACTIVE: '已结束',
        PENDING: '待回复',
        REPLIED: '已回复',
    },
    FLASH:{
        1: '兑换中',
        2: '兑换成功',
        3: '兑换失败',
    },

};

/**
 * 格式化数字为货币格式
 * @param {number} amount - 要格式化的数字
 * @param {string} [locale='en-US'] - 可选，区域设置，默认为 'en-US'
 * @param {number} [minimumFractionDigits=2] - 可选，最小小数位数，默认为 2
 * @param {number} [maximumFractionDigits=2] - 可选，最大小数位数，默认为 2
 * @returns {string} 格式化后的字符串
 */
export const formatCurrency = (
    amount: number,
    locale: string = 'en-US',
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 2
): string => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
};

/**
 * 将 ISO 8601 日期字符串转换为自定义格式
 * @param {string} isoDate - ISO 8601 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取货币信息
 * @param {number} currencyId - 货币ID
 * @returns {Object} 包含货币信息
 */
export const getDataInfo = (currencyId: number, type: string) => {
    const currencyKeyValue = storeData[type].find(c => c.code === currencyId) || null;
    return currencyKeyValue;
};
/**
 * 获取数据列表
 */
export const getDataList = (type: string) => {
    return storeData[type];
};

// 获取状态文本的函数
export const getStatusText = (status: any, type: any): string => {
    return StatusEnum[type][status] || '未知状态';
};

