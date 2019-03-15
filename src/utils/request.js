import Taro from '@tarojs/taro';
import store from '../store'

export default async (options = { method: 'GET', data: {} }) => {
  let {domain, accOpenid} = store.getState().common.ext

  let sessionId = Taro.getStorageSync('sessionId')
  let idKey = Taro.getStorageSync('idKey')
  let constance_data = options.no_const ? {} : {
    channel: 'wxapp',
    accOpenid
  }

  let request = (data = {}) => {
    const {sid, idkey} = data
    return Taro.request({
      url: domain + options.url,
      data: {
        sessionId: sid || sessionId,
        idKey: idkey || idKey,
        ...constance_data,
        ...options.data,
      },
      header: {
        'Content-Type': 'application/json',
      },
      method: options.method.toUpperCase(),
    })
  }

  let resp = await request().then(res => res).catch(err => ({error: 1, ...err}));

  if (resp.error !== 1) {
    return loopFetch(resp)
  } else {
    Taro.showToast({
      title: '您当前网络似乎有些问题',
      icon: 'none',
      duration: 1500
    })
    return {error: 1, timeout: 1}
  }

  async function loopFetch(res) {

    const { statusCode, data } = res;

    if (statusCode >= 200 && statusCode < 300) {
      if (+data.code === 200) {

        return data.data;

      } else if(+data.code === 201 && !options.no_const) { //未登录
        if (Taro.getStorageSync('stopLogin') === 1) {

          // 并发请求正在登陆
          let response = await (() => {
            return new Promise((resolve) => {
              Taro.eventCenter.on('loginedRequest', ({sid, idkey}) => {
                request({sid, idkey}).then(re => {
                  resolve(re)
                })
              })
            })
          })()
          return loopFetch(response)
        } else {

          //无并发请求正在登陆，执行登陆请求
          Taro.removeStorageSync('userInfo')

          let r = await store.dispatch({
            type: 'common/requestLogin'
          })

          let response = await request({sid: r.sessionId, idkey: r.idKey})
          return loopFetch(response)
        }
      } else {

        return data
      }

    } else {
      console.log(`网络请求错误，状态码${statusCode}`);
      return {error: 1}
    }
  }

}

