module.exports = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    orderInfo: 'pay with MoMo',
    partnerCode: 'MOMO',
    redirectUrl: process.env.REACT_APP_URL + '/payment-success.html',
    // ipnUrl: process.env.MOMO_CALLBACK_URL, //chú ý: cần dùng ngrok thì momo mới post đến url này được
    ipnUrl: "https://402e-171-243-48-150.ngrok-free.app/api/payment/callback", //chú ý: cần dùng ngrok thì momo mới post đến url này được
    requestType: 'payWithMethod',
    extraData: '',
    orderGroupId: '',
    autoCapture: true,
    lang: 'vi',
};