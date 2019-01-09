import { getOrderList, getOrderDetail, getPreOrderInfo, getReserveTime} from '../services/order'

export default {
  namespace: 'order',
  state: {

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
  },

  reducers: {

  }
}
