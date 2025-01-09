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
        return this.post('/oz-client-auth/auth/validateLoginEmailCode?validateKey='+params.validateKey+'&emailCode='+params.emailCode, headers);
    }

    public logout(params: any, headers: any): Promise<any> {
        return this.post('/oz-client-auth/auth/logout', params, headers)
    }

    /**
     * 注册
     * @param params
     * @param headers
     */
    public register(params: any, headers: any): Promise<any> {
        return this.post('/oz-client-auth/auth/register', params, headers)
    }
    /**
     * 设置支付密码
     * @param params
     * @param headers
     */
    public setAssetsPassword(params: any, headers: any): Promise<any> {
        let url = '/aupay-user/password/setAssetsPassword?assetsPassword=' + params.assetsPassword
        return this.post(url, {}, headers)
    }

    /**
     * 忘记密码-重新设置密码邮箱验证码
     */
    public passwrodResetSet(params: any, headers: any): Promise<any> {
        return this.put('/aupay-user/password/resetPassword', params, headers)
    }

    /**
     * 获取用户信息
     * @param params
     * @param headers
     */
    public getUserInfo(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/base/getUserInfo', params, headers)
    }

}

class SystemApi extends Http {
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
     * 绑定 Google Auth
     */
    public bindGoogleAuth(params: any, headers: any): Promise<any> {
        if(params.type == 1){
            return this.get('/aupay-user/bindGoogleAuth', {}, headers)
        }else{
            return this.put('/aupay-user/bindGoogleAuth?googleSecret='+params.googleSecret+'&googleCode='+params.googleCode, {}, headers)
        }
    }
    /**
     * 获取消息列表
     */
    public messageList(params: any, headers: any): Promise<any> {
        return this.post('/message/list', params, headers)
    }
    /**
     * 获取工单列表
     */
    public ticketList(params: any, headers: any): Promise<any> {
        return this.post('/ticket/list', params, headers)
    }
    /**
     * 工单详情列表
     */
    public ticketMessageList(params: any, headers: any): Promise<any> {
        return this.get('/ticket/message/list', params, headers)
    }
    /**
     * 工单详情创建
     */
    public ticketMessageCreate(params: any, headers: any): Promise<any> {
        return this.post('/ticket/message/create', params, headers)
    }
    /**
     * 创建工单
     */
    public ticketCreate(params: any, headers: any): Promise<any> {
        return this.post('/ticket/create'+ params.content, {}, headers)
    }
    /**
     * 结束工单
     */
    public ticketFixList(params: any, headers: any): Promise<any> {
        return this.get('/ticket/fix', params, headers)
    }
    /**
     * 催促工单
     */
    public ticketPress(params: any, headers: any): Promise<any> {
        return this.get('/ticket/press', params, headers)
    }

    /**
     * 获取汇率
     */
    public getRate(params: any, headers: any): Promise<any> {
        return this.get('/aupay-operate/rate/usdt2currency', params, headers)
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
     * 获取账户资金流水
     */
    public accountAssetsList(params: any, headers: any): Promise<any> {
        return this.post('/aupay-user/assets/getAssetsRecords', params, headers)
    }
    /**
     * 获取账户资金流水-详情
     */
    public accountAssetsDetail(params: any, headers: any): Promise<any> {
        return this.get('/aupay-user/assets/getAssetsRecordDetail', params, headers)
    }
    /**
     * 行情
     */
    public marketList(params: any, headers: any): Promise<any> {
        return this.post('/market/query', params, headers)
    }
    public marketFocus(params: any, headers: any): Promise<any> {
        return this.post('/market/focus/toggle?coinId=' + params.coinId + (params.focusId ? '&focusId=' + params.focusId : ''), {}, headers)
    }
}

export default {
    userApi: new UserApi(),
    systemApi: new SystemApi(),
    assetsApi: new AssetsApi(),
}
