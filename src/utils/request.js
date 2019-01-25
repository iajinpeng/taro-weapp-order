import Taro from '@tarojs/taro';
import store from '../store'

export default async (options = { method: 'GET', data: {} }) => {
  let {domain, accOpenid} = store.getState().common.ext

  let sessionId = Taro.getStorageSync('sessionId')
  let constance_data = options.no_const ? {} : {
    channel: 'wxapp',
    accOpenid
  }

  let request = (sid) => Taro.request({
    url: domain + options.url,
    data: {
      sessionId: sid || sessionId,
      ...constance_data,
      ...options.data,
    },
    header: {
      'Content-Type': 'application/json',
    },
    method: options.method.toUpperCase(),
  })

  let resp = await request();

  return loopFetch(resp)

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
              Taro.eventCenter.on('loginedRequest', (sid) => {
                request(sid).then(re => {
                  resolve(re)
                })
              })
            })
          })()
          Taro.removeStorageSync('stopLogin')
          return loopFetch(response)
        } else {

          //无并发请求正在登陆，执行登陆请求
          Taro.removeStorageSync('userInfo')

          let r = await store.dispatch({
            type: 'common/requestLogin'
          })

          let response = await request(r.sessionId)
          return loopFetch(response)
        }
      } else {

        return data
      }

    } else {
      console.log(`网络请求错误，状态码${statusCode}`);
      return {error: 0}
    }
  }

}

