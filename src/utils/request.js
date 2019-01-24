import Taro from '@tarojs/taro';
import { baseUrl } from '../config';
import store from '../store'

const request_data = {
  channel: 'wxapp',
  accOpenid: 'ZWFvxKSRpQ',
};


export default async (options = { method: 'GET', data: {} }) => {
  let sessionId = Taro.getStorageSync('sessionId')
  let constance_data = options.no_const ? {} : request_data

  let request = (sid) => Taro.request({
    url: baseUrl + options.url,
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

      } else if(+data.code === 201 && !options.no_const) {

        let r = await store.dispatch({
          type: 'common/requestLogin'
        })

        let response = await request(r.sessionId)
        return loopFetch(response)
      } else {
        Taro.showToast({
          title: data.message || '数据请求错误',
          icon: 'none'
        })
        return data
      }

    } else {
      console.log(`网络请求错误，状态码${statusCode}`);
      return {error: 0}
    }
  }

}

