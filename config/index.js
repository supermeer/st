// baseUrl: 'http://10.189.3.50:19000'
// baseUrl: 'http://10.0.106.58:19000'
// baseUrl: 'https://www.yours-x.com/character'
const accountInfo = wx.getAccountInfoSync();
const version = accountInfo.miniProgram.version;
// let baseUrl = 'https://www.yours-x.com/character-test'
let baseUrl = 'https://www.yours-x.com/character-audit'
if (version) {
  baseUrl = 'https://www.yours-x.com/character'
}

export const config = {
  useMock: false,
  baseUrl: baseUrl
}

export const cdnBase =
  'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp'
