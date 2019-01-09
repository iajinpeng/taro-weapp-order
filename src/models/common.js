import Taro from '@tarojs/taro';

import {requestLogin, postUserInfo, requestHomeInfo, requestCouponList, postFormId, getUserMobile} from '../services/common';

export default {
  namespace: 'common',
  state: {
    theme: 2,

    userInfo: {},

    systemInfo: {},

    localInfo: {},
  },

  effects: {
    * requestLogin({}, {put, call}) {
      const wxLoginInfo = yield Taro.login()
      const res =  yield call(requestLogin, {
        accOpenid: 'aGzD0Jmq',
        code: wxLoginInfo.code
      })

      Taro.setStorageSync('sessionId', res.sessionId)
      return res
    },
    * postUserInfo({payload}, {put, call}) {
      return yield call(postUserInfo, payload)
    },
    * requestHomeInfo({payload}, {put, call}) {
      return yield call(requestHomeInfo, payload)
    },
    * requestCouponList({payload}, {put, call}) {
      return yield call(requestCouponList, payload)
    },
    * postFormId({payload}, {put, call}) {
      return yield call(postFormId, payload)
    },
    * getUserMobile({payload}, {put, call}) {
      return yield call(getUserMobile, payload)
    },

  },

  reducers: {
    setUserInfo(state, {payload}) {
      return {...state, userInfo: payload};
    },
    setSistemInfo(state, {payload}) {
      return {...state, systemInfo: payload};
    },
    setLocalInfo(state, {payload}) {
      return {...state, localInfo: payload};
    },
  },

  subscriptions: {
    setup() {

    }
  }

};
