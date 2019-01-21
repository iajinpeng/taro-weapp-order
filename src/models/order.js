import Taro from '@tarojs/taro'

import {getOrderList, getOrderDetail, getPreOrderInfo, getReserveTime,
  requestSaveOrder, requestPayOrder, getOrderPayStatus, requestCancelOrder,
  requestOrderRepeat} from '../services/order'

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
    * requestOrderRepeat({payload}, {put, call}) {
      const {change, goods} = yield call(requestOrderRepeat, payload)
      if (!change) {
        const {store_id} = payload
        const cartGoods = goods.map(good => {

          let {propertyTagIndex, optionalTagIndex, optionalnumstr} = good

          if (optionalnumstr.length === 0) {
            delete  good.optionalnumstr
            if (optionalTagIndex && optionalTagIndex.length > 0) {
              good.optionalTagIndex = optionalTagIndex.map(item => +item)
            }

            if (optionalTagIndex && optionalTagIndex.length > 0 || propertyTagIndex && propertyTagIndex.length > 0) {
              good.optionalstr = propertyTagIndex.join('') + optionalTagIndex.join('')
            }
          } else {
            delete good.optionalTagIndex
            good.optionalnumstr = optionalnumstr[0]

            good.optional.map((opt, index) => {
              opt.list.map((g, i) => {
                return g.num = good.optionalnumstr.split(',')[index].split('|')[i]
              })
            })

            let optPrice = good.optional.reduce((total, opt) => {
              let price = opt.list.reduce((t, g) => {
                return t += +g.gn_price * (g.num || 0)
              }, 0)
              return total += price
            }, 0) || 0

            good.total_price = +good.g_price + optPrice
          }

          const {od_optional_array, od_property_array, ...useGood} = good;

          return {
            id: +store_id,
            good: useGood,
            num: good.od_num
          }

        })

        for (let i=0;i<cartGoods.length;i++) {
          yield put({
            type: 'cart/setCart',
            payload: cartGoods[i]
          })
        }

        Taro.navigateTo({
          url: '/pages/shop-index/index?id=' + store_id
        })

        return change
      }
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
