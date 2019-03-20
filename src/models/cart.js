import Taro from '@tarojs/taro';
import { sortCartGood } from '../utils/utils'

export default {
  namespace: 'cart',
  state: {
    carts: {},
    whatEver: 0
  },

  effects: {

  },

  reducers: {
    setAgainCart(state, {payload}) {
      const {id, goods} = payload
      let curCart = state.carts[id]

      !curCart && (curCart = [])
      goods.map(good => {
        if (!curCart.some(item => item.again_id === good.good.again_id)) {
          curCart = sortCartGood(curCart, good.good, good.num)
        }
      })
      state.carts[id] = curCart

      return {...state, whatEver: state.whatEver + 1};
    },
    setCart(state, {payload}) {
      const {id, good, num} = payload
      let curCart = state.carts[id]

      !curCart && (curCart = [])

      if (num >= 1 && good.again_id &&
        curCart.some(item => item.again_id === good.again_id)
      ) {
        return {...state}
      }

      if (good.fs_id) {
        let index = curCart.findIndex(item => item.fs_id === good.fs_id)
        if (index > -1) {
          if (num === 1) {
            Taro.showToast({
              title: '只可以选择一份赠品哦～',
              icon: 'none'
            })
          } else {
            curCart.splice(index, 1)
          }
        } else {
          curCart.push({...good, num})
        }
      } else {
        curCart = sortCartGood(curCart, good, num)

      }

      state.carts[id] = curCart

      return {...state, whatEver: state.whatEver + num};
    },
    setComboCart(state, {payload}) {
      const {id, good, num} = payload
      let curCart = state.carts[id]

      !curCart && (curCart = [])

      if (num >= 1 && good.again_id &&
        curCart.some(item => item.again_id === good.again_id)
      ) {
        return {...state}
      }

      if (good.fs_id) {
        let index = curCart.findIndex(item => item.fs_id === good.fs_id)
        if (index > -1) {
          if (num >= 1) {
            Taro.showToast({
              title: '只可以选择一份赠品哦～',
              icon: 'none'
            })
          } else {
            curCart.splice(index, 1)
          }
        } else {
          curCart.push({...good, num})
        }
      } else {
        curCart.map((item, index) => item.index = index)
        let idAlikes = curCart.filter(item => item.g_id === good.g_id)
        if (idAlikes.length === 0) {
          curCart.push({...good, num})
        } else {
          let index = idAlikes.findIndex(item => !item.fs_id && (item.optionalnumstr === good.optionalnumstr))
          if (index > -1) {
            let i = idAlikes[index].index
            curCart[i].num += num
            curCart[i].num === 0 && curCart.splice(i, 1)
          } else {
            curCart.push({...good, num})
          }
        }
      }

      state.carts[id] = curCart

      return {...state, whatEver: state.whatEver + num};

    },
    clearOneCart(state, {payload}) {
      const {id} = payload
      state.carts[id] = []

      return {...state}
    },
    // 清除满送商品
    clearPresentCart(state, {payload}) {
      const {id} = payload
      state.carts[id] = state.carts[id].filter((item => !item.fs_id))

      return {...state}
    }
  }
}
