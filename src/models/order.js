import {getOrderList, getOrderDetail, getPreOrderInfo, getReserveTime,
  requestSaveOrder, requestPayOrder, getOrderPayStatus, requestCancelOrder} from '../services/order'

export default {
  namespace: 'order',
  state: {
    curAddress: {},
    couponOptions: [],
    curCouponIndex: 0,

    refreshAddress: false
  },

  effects: {
    * getOrderList({payload}, {put, call}) {
      return yield call(getOrderList, payload)
    },
    * getOrderDetail({payload}, {put, call}) {
      return yield call(getOrderDetail, payload)
    },
    * getPreOrderInfo({payload}, {put, call}) {
      return yield call(getPreOrderInfo, payload)
    },
    * getReserveTime({payload}, {put, call}) {
      return yield call(getReserveTime, payload)
    },
    * requestSaveOrder({payload}, {put, call}) {
      return yield call(requestSaveOrder, payload)
    },
    * requestPayOrder({payload}, {put, call}) {
      return yield call(requestPayOrder, payload)
    },
    * getOrderPayStatus({payload}, {put, call}) {
      let res = yield call(getOrderPayStatus, payload)
      if (!res) {
        let res = yield put(getOrderPayStatus, payload)
      }
      return res
    },
    * requestCancelOrder({payload}, {put, call}) {
      return yield call(requestCancelOrder, payload)
    },
  },

  reducers: {
    setKeyRefreshAddress(state, {payload}) {
      return {...state, ...payload}
    },
    setCouponOptions(state, {payload}) {
      return {...state, ...payload}
    },
    setCouponIndex(state, {payload}) {
      return {...state, ...payload}
    },
  }
}
