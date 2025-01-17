import {getHeader} from "@/utils/storageUtils";
const { userApi } = useServer();
export const UseUserStore = defineStore('user', {
    state: () => ({
        appToken: '',
        userInfo: {},
    }),
    actions: {
        setTokenState(token: string) {
            this.appToken = token
        },
        setUserInfo(user: any) {
            this.userInfo = user
        },
        clearUserState() {
            this.appToken = ''
            this.userInfo = {}
        },
        async fetchUserInfo() {
            const headers = getHeader();
            try {
                const [infoRes, configRes] = await Promise.all([
                    userApi.getUserInfo({}, headers),
                    userApi.getUserSystemConfig({}, headers)
                ]);
                if (infoRes.code === 200) {
                    const combinedData = {
                        ...infoRes.data,
                        currencyUnit: configRes.data.currencyUnit,
                        showHide: configRes.data.showHide,
                        systemLanguage: configRes.data.systemLanguage
                    };
                    this.setUserInfo(combinedData);
                    return true;
                } else {
                    console.error('获取用户信息失败:', infoRes.message);
                    return false;
                }
            } catch (error) {
                console.error('请求失败:', error);
                return false;
            }
        }
    },
    persist: true
})
