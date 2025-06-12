const url = "https://284e-2001-ee0-5002-9340-7d04-4e21-d949-7425.ngrok-free.app"
module.exports = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    orderInfo: 'pay with MoMo',
    partnerCode: 'MOMO',
    redirectUrl: process.env.REACT_APP_URL + '/payment-success.html',
    // ipnUrl: process.env.MOMO_CALLBACK_URL, //chú ý: cần dùng ngrok thì momo mới post đến url này được
    ipnUrl: url + "/api/payment/callback", //chú ý: cần dùng ngrok thì momo mới post đến url này được
    requestType: 'payWithMethod',
    extraData: '',
    orderGroupId: '',
    autoCapture: true,
    lang: 'vi',
};