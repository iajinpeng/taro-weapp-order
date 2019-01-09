import {getStoreList, getGoodsList, getGoodsNorm, getPresentGood} from '../services/shop'

export default {
  namespace: 'shop',
  state: {

  },

  effects: {
    * getStoreList({payload}, {put, call}) {
      return yield call(getStoreList, payload)
    },
    * getGoodsList({payload}, {put, call}) {
      return yield call(getGoodsList, payload)
    },
    * getGoodsNorm({payload}, {put, call}) {
      return yield call(getGoodsNorm, payload)
    },
    * getPresentGood({payload}, {put, call}) {
      return yield call(getPresentGood, payload)
    },
  },

  reducers: {

  }
}
