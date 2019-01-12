import {getOrderList, getOrderDetail, getPreOrderInfo, getReserveTime,requestSaveOrder, requestPayOrder} from '../services/order'

export default {
  namespace: 'order',
  state: {
    curAddress: {}
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
  },

  reducers: {

  }
}
