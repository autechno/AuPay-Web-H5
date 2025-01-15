import {ref} from "vue";

export const UseBaseStore = defineStore('base', {
    state: () => ({
        storeData: {
        },
        headerData: {}
    }),
    actions: {
        setStoreState(dataInfo: any) {
            this.storeData = dataInfo
        },
        setHeaderState(dataInfo: any) {
            this.headerData = dataInfo
        },
    },
    persist: true
})