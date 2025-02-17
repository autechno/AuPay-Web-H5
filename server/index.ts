import Http from './http/index'
// @ts-ignore
class UserApi extends Http {
    /**
     * 登录
     */
    public login(params: any, headers: any): Promise<any> {
        return this.post('/oz-client-auth/auth/login', params, headers)
    }
    public loginValidateEmail(params: any, headers: any): Promise<any> {
        return this.postFormData('/oz-client-auth/auth/validateLoginEmailCode',{validateKey: params.validateKey, emailCode: params.emailCode}, headers, 'post')
    }
    public logout(params: any, headers: any): Promise<any> {
        return this.post('/oz-client-auth/auth/logout', params, headers)
    }
    /**
     * 解绑google登录
     */
    public getUnbindGoogle(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/provider/unbinding/'+params.optToken, params, headers, 'post');
    }
    /**
     * 查询通讯录
     */
    public queryAccountContact(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/transferQrcode/queryAccountContact', params, headers);
    }
    /**
     * 删除通讯录
     */
    public removeAccountContact(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/transferQrcode/removeAccountContact', params, headers, 'post');
    }
    /**
     * 添加通讯录
     */
    public addAccountContact(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/transferQrcode/addAccountContact', params, headers, 'post');
    }
    /**
    /**
     * 绑定google登录
     */
    public setBindGoogle(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/provider/binding/'+params.optToken, params, headers, 'post');
    }
    /**
     * 注册
     */
    public register(params: any, headers: any): Promise<any> {
        return this.post('/oz-client-auth/auth/register', params, headers)
    }
    public setUserInfo(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/base/setUserInfo', params, headers)
    }
    /**
     * 查询用户信息
     */
    public getUserInfo(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/base/getUserInfo', params, headers)
    }
    /**
     * 查询基础配置信息
     */
    public getUserSystemConfig(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/config/getUserSystemConfig', params, headers)
    }
    /**
     * 设置基础配置信息
     */
    public setUserSystemConfig(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/config/setUserSystemConfig', params, headers)
    }
    /**
     * 设置支付密码
     * @param params
     * @param headers
     */
    public setAssetsPassword(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/password/setAssetsPassword', {assetsPassword: params.assetsPassword}, headers, 'post');
    }
    /**
     * 忘记密码-重新设置密码邮箱验证码
     */
    public passwrodResetSet(params: any, headers: any): Promise<any> {
        return this.put('/aupay-user/password/resetPassword', params, headers)
    }
    /**
     * ，验证收款码
     * @param params
     * @param headers
     */
    public getCheckTransferCode(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/transferQrcode/check', params, headers)
    }
    /**
     * 常用地址列表
     */
    public getFrequentlyList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/address/list', params, headers)
    }
    /**
     * 验证是否白名单地址
     */
    public getFrequentlyWhiteCheck(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/address/white/check', params, headers)
    }
    /**
     * 删除常用地址
     */
    public getFrequentlyDelete(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/address/delete/'+ params.optToken+'?id=' + params.id, params, headers)
    }
    /**
     * 编辑常用地址
     */
    public getFrequentlyEdit(params: any,  headers: any): Promise<any> {
        return this.post('/aupay-user/address/edit/'+ params.optToken, params, headers)
    }
    /**
     * 查询常用地址
     */
    public checkAddressDuplicate(params: any,  headers: any): Promise<any> {
        return this.postFormData('/aupay-user/address/checkDuplicate', params, headers, 'post');
    }
    /**
     * 白名单地址状态切换
     */
    public getFrequentlyToggle(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/address/white/toggle/'+ params.optToken, {id: params.id}, headers, 'post');
    }
    /**
     * 修改密码
     */
    public updatePassword(params: any,  headers: any): Promise<any> {
        return this.postFormData('/aupay-user/password/updatePassword/'+ params.optToken, {newPassword: params.newPassword, rawPassword: params.newPassword}, headers, 'post');
    }
    /**
     * 修改资金密码
     */
    public updateAssetsPassword(params: any,  headers: any): Promise<any> {
        return this.postFormData('/aupay-user/password/updateAssetsPassword/'+ params.optToken, { newPassword: params.newPassword}, headers, 'post');
    }
}

/**
 * 消息服务
 */
class MessageApi extends Http {
    /**
     * 获取消息列表
     */
    public messageList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/message/list', params, headers)
    }
    /**
     * 全部标记已读
     */
    public messageReadAll(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/message/readAll', params, headers)
    }
    /**
     * 未读个数
     */
    public messageCount(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/message/count', params, headers)
    }
    /**
     * 获取工单列表
     */
    public ticketList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/ticket/list', params, headers)
    }
    /**
     * 工单详情列表
     */
    public ticketMessageList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-message/ticket/message/list', params, headers)
    }
    /**
     * 工单详情创建
     */
    public ticketMessageCreate(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/ticket/message/create', params, headers)
    }
    /**
     * 创建工单
     */
    public ticketCreate(params: any, headers: any): Promise<any> {
        return this.post('/aupay-message/ticket/create'+ params.content, {}, headers)
    }
    /**
     * 结束工单
     */
    public ticketFixList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-message/ticket/fix', params, headers)
    }
    /**
     * 催促工单
     */
    public ticketPress(params: any, headers: any): Promise<any> {
        return this.get('/aupay-message/ticket/press', params, headers)
    }
}

class SystemApi extends Http {

    /**
     * 发送修改邮箱验证码
     */
    public sendEmail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/email/sendEmailCode', params, headers)
    }
    /**
     * 登录邮箱验证码再一次发送
     */
    public sendLoginEmail(params: any, headers: any): Promise<any> {
        return this.get('/oz-client-auth/auth/sendLoginEmailCode', params, headers)
    }
    /**
     * 检查修改邮箱验证码
     */
    public sendValidateEmail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/email/verifyEmail', params, headers)
    }
    /**
     * 验证Google
     */
    public verifyValidateGoogle(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/verifyGoogle', params, headers)
    }
    /**
     * 重置验证Google
     */
    public resetGoogleAuth(params: any, headers: any): Promise<any> {
        return this.put('/aupay-user/resetGoogleAuth/'+params.optToken, params, headers)
    }
    /**
     * 绑定 Google Auth
     */
    public bindGoogleAuth(params: any, headers: any): Promise<any> {
        if(params.type == 1){
            return this.get('/aupay-user/bindGoogleAuth', {}, headers)
        }else{
            return this.postFormData('/aupay-user/bindGoogleAuth/'+params.optToken, {googleSecret: params.googleSecret,  googleCode: params.googleCode}, headers, 'put')
        }
    }
    public bindGoogleFirstAuth(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/bindGoogleAuthFirstTime', {googleSecret: params.googleSecret, googleCode:  params.googleCode}, headers, 'put');
    }
    /**
     * 发送注册邮箱验证码
     */
    public sendRegEmail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/register/sendRegisterEmailCode', params, headers)
    }
    /**
     * 发送忘记密码邮箱验证码
     */
    public sendResetEmail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/password/sendResetPasswordEmailCode', params, headers)
    }
    /**
     * 验证忘记密码邮箱验证码
     */
    public sendResetValidateEmail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/password/validateResetPasswordEmailCode', params, headers)
    }
    /**
     * 验证忘记密码邮箱验证码
     */
    public sendResetValidateGoogle(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/password/validateResetPasswordGoogleAuth', params, headers)
    }
    /**
     * 获取国家
     */
    public getCountryList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/operation/getCountryCodes', params, headers)
    }
    /**
     * 获取货币和琏
     */
    public getCoinList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/support/coins', params, headers)
    }
    public getCoinChainsList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/support/coinChains', params, headers)
    }
    public getChainsList(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/support/chains', params, headers)
    }

    /**
     * 验证资金密码权限
     */
    public checkPermission(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/permission/checkOptPermission', params, headers)
    }
    /**
     * 验证资金密码
     */
    public verifyAssetsPassword(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/password/verifyAssetsPassword', params, headers)
    }
}

class AssetsApi extends Http {
    /**
     * 获取账户资产
     */
    public accountAssets(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/assets/getAssetsInfo', params, headers)
    }

    /**
     * 获取账户资产地址
     */
    public getAccountRechargeConfig(params: any, headers: any): Promise<any> {
        return this.get('/aupay-wallet/wallet/getAccountRechargeConfig', params, headers)
    }
    /**
     * 获取账户资产
     */
    public getAccountAssetsById(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/assets/getAccountAssetsById', params, headers)
    }
    /**
     * 获取账户资金流水
     */
    public accountAssetsList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/assets/getAssetsRecords', params, headers)
    }
    /**
     * 收入支出合计
     */
    public getIncomeExpense(params: any, headers: any): Promise<any> {
        return this.postFormData('/aupay-user/assets/incomeExpense', params, headers, 'post')
    }
    /**
     * 获取账户资金流水-详情
     */
    public accountAssetsDetail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/assets/getAssetsRecordDetail', params, headers)
    }
    /**
     * 获取账户转账-详情
     */
    public getTransferOrderDetail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-trade/transfer/getTransferOrderDetail', params, headers)
    }
    /**
     * 行情
     */
    public marketList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-operate/market/query', params, headers)
    }
    public marketFocus(params: any, headers: any): Promise<any> {
        return this.post('/aupay-operate/market/focus/toggle?coinId=' + params.coinId + (params.focusId ? '&focusId=' + params.focusId : ''), {}, headers)
    }
    /**
     * 兑换账户资金
     */
    public fastSwapApply(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/fastSwap/apply/'+params.optToken, params, headers)
    }
    /**
     * 兑换账户资金列表
     */
    public fastSwapApplyList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/fastSwap/queryFastSwaps', params, headers);
    }
    /**
     * 兑换账户资金详情
     */
    public fastSwapApplyDetail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-trade/fastSwap/getFastSwapDetail', params, headers);
    }
    /**
     * 账户发起转账
     */
    public transferApply(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/transfer/apply/'+params.optToken, params, headers)
    }
    /**
     * 获取汇率
     */
    public getRateU2Currency(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/rate/usdt2currency', params, headers)
    }
    /**
     * 获取币种兑换汇率
     */
    public getRateCoin2Coin(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/rate/coin2coin', params, headers)
    }
    /**
     * 获取币种兑换汇率
     */
    public getRateCoin2currency(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/rate/coin2currency', params, headers)
    }
    /**
     * 获取币种兑换汇率
     */
    public getFastRateFee(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/fastSwap/fee', params, headers)
    }
    /**
     * 获取币种提现汇率
     */
    public getTransferRateFee(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/transfer/fee', params, headers)
    }
    /**
     * 获取币种转账汇率
     */
    public getWithdrawRateFee(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/withdraw/fee', params, headers)
    }
    /**
     * 提取现金
     */
    public getWithdrawApply(params: any, headers: any): Promise<any> {
        return this.post('/aupay-trade/withdraw/apply/'+params.optToken, params, headers)
    }
    /**
     * 转换
     */
    public calculate(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/rate/calculate', params, headers);
    }

}

export default {
    userApi: new UserApi(),
    systemApi: new SystemApi(),
    assetsApi: new AssetsApi(),
    messageApi: new MessageApi()
}
