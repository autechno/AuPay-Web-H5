// formatCurrencyUtils.ts

// 常量，存储货币和链的信息
const storeData = {
    coin: [
        { name: 'BTC', title: 'BTC', code: 0 },
        { name: 'ERC-20', title: 'ERC-20', code: 2 },
        { name: 'TRC-20', title: 'TRC-20', code: 3 },
    ],
    cryptocurrencies: [
        { name: 'BTC', title: 'Bitcoin', code: 1 },
        { name: 'ETH', title: 'Ethereum', code: 2 },
        { name: 'USDT', title: 'TetherUS', code: 3 },
        { name: 'TRX', title: 'TRON', code: 4 },
        { name: 'OZC', title: 'OZCoin', code: 5 },
        { name: 'TOTO', title: 'TOTO', code: 6 },
    ],
    currency: [
        {
            name: '人民币',
            code: 'CNY',
            sign: '¥',
        },
       {
            name: '美元',
            code: 'USD',
            sign: '$',
        }
    ],
    language: [
        {
            name: '人民币',
            code: 'EN',
        },
        {
            name: '中文',
            code: 'CN',
        }
    ]
};

// 状态常量
export const Status = {
    CREATED: 0,    // 已提交 待处理
    WAITING: 1,    // 处理中 中间状态
    SUCCESS: 2,    // 成功
    FAILED: 3,     // 失败
    EXCEPTION: 4,  // 处理异常
    SUSPEND: 5,    // 挂起
    APPLY: 10,     // 发起申请 待审批
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

export const StatusEnum = {
    OPEN: '未解决',
    IN_PROGRESS: '进行中',
    RESOLVED: '已解决',
    CLOSED: '已关闭',
};

export const ConversationStatusEnum = {
    ACTIVE: '进行中',
    INACTIVE: '已结束',
};

export const StaffReplyStatusEnum = {
    PENDING: '待回复',
    REPLIED: '已回复',
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
 * 获取货币信息
 * @param {number} currencyId - 货币ID
 * @returns {Object} 包含货币信息
 */
export const getCurrencyInfo = (currencyId: number) => {
    const currencyKeyValue = storeData.cryptocurrencies.find(c => c.code === currencyId) || null;
    return currencyKeyValue;
};

/**
 * 获取链信息
 * @param {number} currencyChain - 货币链ID
 * @returns {Object} 包含链信息
 */
export const getCoinInfo = (currencyChain: number) => {
    const coinKeyValue = storeData.coin.find(c => c.code === currencyChain) || null;
    return coinKeyValue;
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
 * 获取状态名称
 * @param {number} statusId - 状态ID
 * @returns {string} 状态名称
 */
export const getStatusName = (statusId: number): string => {
    const status = Object.entries(Status).find(([key, value]) => value === statusId);
    return status ? status[0] : '未知状态';
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

// 根据 code 查询法定货币
export const getCurrencyByCode = (code: string, type: string) => {
    const currency = storeData.currency.find(item => item.code === code);
    if(currency){
        return currency[type];
    }
};

// 根据 code 查询语言
export const getLanguageByCode = (code: string) => {
    const language = storeData.language.find(item => item.code === code);
    return language ? language : null; // 返回找到的语言或 null
};

// 获取状态文本的函数
export const getStatusText = (status: keyof typeof StatusEnum): string => {
    return StatusEnum[status] || '未知状态';
};

export const getConversationStatusText = (status: keyof typeof ConversationStatusEnum): string => {
    return ConversationStatusEnum[status] || '未知状态';
};

export const getStaffReplyStatusText = (status: keyof typeof StaffReplyStatusEnum): string => {
    return StaffReplyStatusEnum[status] || '未知状态';
};