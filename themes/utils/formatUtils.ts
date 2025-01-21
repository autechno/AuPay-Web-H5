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
    ]
};

// 状态常量
export const StatusEnum = {
    ACCOUNT: {
        0: '已提交 待处理',
        1: '处理中 中间状态',
        2: '成功',
        3: '失败',
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
    }
};

// 类型常量
export const TransactionType = {
    RECHARGE: { id: 1, name: "充值" },
    WITHDRAW: { id: 2, name: "提款" },
    FAST_SWAP_IN: { id: 71, name: "闪兑-兑入" },
    FAST_SWAP_OUT: { id: 72, name: "闪兑-兑出" },
    TRANSFER_IN: { id: 81, name: "转账-转入" },
    TRANSFER_OUT: { id: 82, name: "转账-转出" },
    FEE_IN: { id: 91, name: "费用-收入" },
    FEE_OUT: { id: 92, name: "费用-支出" },
    SYS_USER_TO_TRANSFER: { id: 3, name: "用户资金归集" },
    SYS_TRANSFER_TO_WITHDRAW: { id: 4, name: "提款钱包补充资金" },
    SYS_TRANSFER_TO_STORE: { id: 5, name: "中转钱包资产归集" },
    SYS_GAS_TO_OPERATOR: { id: 6, name: "补充gas费" },
    PLATFORM_IN: { id: 101, name: "平台注资" },
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
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取交易类型名称
 * @param {number} typeId - 类型ID
 * @returns {string} 类型名称
 */
export const getTransactionTypeName = (typeId: number): string => {
    const type = Object.values(TransactionType).find(t => t.id === typeId);
    return type ? type.name : '未知类型';
};

/**
 * 根据 code 查询法定货币
 * @param code
 * @param type
 */
export const getCurrencyByCode = (code: string, type: string) => {
    const currency = storeData.currency.find(item => item.code === code);
    if(currency){
        return currency[type];
    }
};
/**
 * 获取货币信息
 * @param {number} currencyId - 货币ID
 * @returns {Object} 包含货币信息
 */
export const getCurrencyChainsInfo = (currencyId: number, type: string) => {
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

