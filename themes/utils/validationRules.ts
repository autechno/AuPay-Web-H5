// 字段验证

export const rules = {
    email: [
        { required: true, message: '邮箱不能为空', trigger: 'blur' },
        { type: 'email', message: '邮箱格式输入有误，请重新输入', trigger: ['blur'] }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码不能低于8位',  trigger: 'blur' },
        { max: 16, message: '密码不能大于16位',  trigger: 'blur' },
        {
            pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?])[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>\/?]{8,16}$/,
            message: '至少包含一个大写字母，至少包含一个特殊字符',
            trigger: 'blur'
        }
    ],
    loginPassword: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码不能低于8位',  trigger: 'blur' },
        { max: 16, message: '密码不能大于16位',  trigger: 'blur' },
    ],
    assetsPassword: [
        { required: true, message: '资金密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码不能低于8位',  trigger: 'blur' },
        { max: 16, message: '密码不能大于16位',  trigger: 'blur' },
        {
            pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?])[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>\/?]{8,16}$/,
            message: '至少包含一个大写字母，至少包含一个特殊字符',
            trigger: 'blur'
        }
    ],
    checkAssetsPassword: [
        { required: true, message: '资金密码不能为空', trigger: 'blur' },
        { min: 6, message: '密码不能低于8位',  trigger: 'blur' },
        { max: 16, message: '密码不能大于16位',  trigger: 'blur' }
    ],
    emailCode: [
        { required: true, message: '邮箱验证码不能为空', trigger: 'blur' },
    ],
    googleCode: [
        { required: true, message: 'google验证码不能为空', trigger: 'blur' },
    ],
    nickname: [
        { required: true, message: "请输入昵称", trigger: "blur" },
        { min: 2, max: 20, message: "昵称长度必须在 2 到 20 个字符之间", trigger: "blur" }
    ],
    transferQR: [
        { required: true, message: "请输入auPay收款码", trigger: "blur" },
        { min: 7, max: 20, message: "auPay收款码长度必须在 7 到 20 个字符之间", trigger: "blur" },
        {
            pattern: /^[A-Za-z0-9]{7,20}$/,
            message: "收款码只能包含数字和大小写字母",
            trigger: "blur"
        }
    ],
    country: [
        { required: true, message: "请选择国家", trigger: "change" }
    ],
    currencyUnit: [
        { required: true, message: '请选择货币单位', trigger: 'change' }
    ],
    showHide: [
        { required: true, message: '请选择是否隐藏余额', trigger: 'change' }
    ],
    systemLanguage: [
        { required: true, message: '请选择语言', trigger: 'change' }
    ],
    name: [
        { required: true, message: '名称不能为空', trigger: 'blur' }
    ],
    address: [
        { required: true, message: '地址不能为空', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value && value.includes(' ')) {
                    callback(new Error('地址不能包含空格'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    toAddress: [
        { required: true, message: '地址不能为空', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value && value.includes(' ')) {
                    callback(new Error('地址不能包含空格'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    currencyChainId: [
        { required: true, message: '链不能为空', trigger: 'blur' }
    ],
    currencyId: [
        { required: true, message: '货币不能为空', trigger: 'blur' },
    ],
    currencyChain: [
        { required: true, message: '链不能为空', trigger: 'blur' },
    ],
    inputAmount: [
        { required: true, message: '数量不能为空', trigger: 'blur' },
    ],
    amount: [
        { required: true, message: '数量不能为空', trigger: 'blur' },
    ],
};
