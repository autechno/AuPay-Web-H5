import {getHeader} from "@/utils/storageUtils";

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
    userLevel: number;
    transferQR: string;
    bindGoogleAuth: boolean;
    setAssetsPassword: boolean;
    bindGoogleLogin: boolean;
    bindFacebookLogin: boolean;
    bindAppleLogin: boolean;
    currencyUnit: string;
    showHide: number;
    systemLanguage: string
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
    userLevel: 0,
    transferQR: '',
    bindGoogleAuth: false,
    setAssetsPassword: false,
    bindGoogleLogin: false,
    bindAppleLogin: false,
    bindFacebookLogin: false,
    currencyUnit: '',
    showHide: 0,
    systemLanguage: ''
};
const { userApi } = useServer();

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
        },
        async fetchUserInfo() {
            const headers = getHeader();
            try {
                const [infoRes, configRes] = await Promise.all([
                    userApi.getUserInfo({}, headers),
                    userApi.getUserSystemConfig({}, headers)
                ]);
                if (infoRes.code === 200) {
                    const combinedData: UserInfo = {
                        ...infoRes.data,
                        currencyUnit: configRes.data.currencyUnit,
                        showHide: configRes.data.showHide,
                        systemLanguage: configRes.data.systemLanguage
                    };
                    this.userInfo(combinedData);
                } else {
                    console.error('获取用户信息失败:', infoRes.message);
                }
            } catch (error) {
                console.error('请求失败:', error);
            }
        }
    },
    persist: true
})
