
type UserInfo = {
    id: number;
    username: string;
    headPortrait: string;
    nickname: string;
    email: string;
    birthday: string;
    state: number;
    country: string;
    sex: number;
    sign: string;
    userType: number;
    createTime: string;
    loginTime: string;
    userLevel: number;
    transferQR: string;
    bindGoogleAuth: boolean;
    setAssetsPassword: boolean;
    bindGoogleLogin: boolean;
    bindFacebookLogin: boolean;
    bindAppleLogin: boolean;
    currencyUnit: string;
    showHide: number;
};

const initialUserInfo: UserInfo = {
    id: 0,
    username: '',
    headPortrait: '',
    nickname: '',
    email: '',
    birthday: '',
    state: 0,
    country: '',
    sex: 0,
    sign: '',
    userType: 0,
    createTime: '',
    loginTime: '',
    userLevel: 0,
    transferQR: '',
    bindGoogleAuth: false,
    setAssetsPassword: false,
    bindGoogleLogin: false,
    bindAppleLogin: false,
    bindFacebookLogin: false,
    currencyUnit: '',
    showHide: 0
};

export const UseUserStore = defineStore('user', {
    state: () => ({
        appToken: '',
        userInfo: { ...initialUserInfo },
    }),
    actions: {
        setTokenState(token: string) {
            this.appToken = token
        },
        setUserInfo(user: UserInfo) {
            this.userInfo = user
        },
        clearUserState() {
            this.appToken = ''
            this.userInfo = { ...initialUserInfo }
        }
    },
    persist: true
})