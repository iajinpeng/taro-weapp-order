import Taro from '@tarojs/taro';

import {requestLogin, postUserInfo, requestHomeInfo,
  requestCouponList, postFormId, getUserMobile, getNotice} from '../services/common';

import amapFile from '../utils/amap-wx'
import {mapKey} from '../config'

export default {
  namespace: 'common',
  state: {
    theme: 1,

    userInfo: {},

    systemInfo: {},

    localInfo: {},

    menu_banner: [],
    menu_cart: {},
  },

  effects: {
    * requestLogin({}, {put, call}) {
      const wxLoginInfo = yield Taro.login()
      const res =  yield call(requestLogin, {
        accOpenid: 'ZWFvxKSRpQ',
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
    * getNotice({payload}, {put, call}) {
      return yield call(getNotice, payload)
    },
    * getSetLocalInfo({}, {put, call}) {

      const getRegeo  = () => {
        return new Promise((resolve, reject) => {
          const myAmapFun = new amapFile.AMapWX({key: mapKey})
          myAmapFun.getRegeo({
            success(data) {
              let addressInfo = data[0].regeocodeData.addressComponent
              let locationCity = addressInfo.city.replace('市', '')
              let location = addressInfo.streetNumber.location
              let [longitude, latitude] = location.split(',')

              resolve({location, longitude, latitude, locationCity})
            }
          })
        })
      }

      const localInfo = yield getRegeo()
      yield put({
        type: 'setLocalInfo',
        payload: {localInfo}
      })
    },

    * initRequest ({}, {put, call}) {

      const data = yield call(requestHomeInfo)

      const {menu_banner, menu_cart, bottom_logo, b_logo, ...indexState} = data

      yield put({
        type: 'setThemeInfo',
        payload: {menu_banner, menu_cart, theme: data.style_color, bottom_logo, b_logo}
      })
      yield put({
        type: 'getSetLocalInfo'
      })

      return indexState
    }

  },

  reducers: {
    setUserInfo(state, {payload}) {
      return {...state, userInfo: payload};
    },
    setSistemInfo(state, {payload}) {
      return {...state, systemInfo: payload};
    },
    setLocalInfo(state, {payload}) {
      return {...state, ...payload};
    },
    setThemeInfo(state, {payload}) {
      return {...state, ...payload};
    },
},

  subscriptions: {
    setup() {

    }
  }

};
