import Taro from '@tarojs/taro';

export default {
  namespace: 'cart',
  state: {
    carts: {},
    whatEver: 0
  },

  effects: {},

  reducers: {
    setStorageCart(state, {payload}) {
      return {...state, ...payload}
    },
    setCart(state, {payload}) {
      const {id, good, num} = payload
      let curCart = state.carts[id]

      !curCart && (curCart = [])

      let index = curCart.findIndex(item => item.g_id === good.g_id)

      if (index > -1) {
        !curCart[index].num && (curCart[index].num = 0)
        curCart[index].num += num

        curCart[index].num === 0 && curCart.splice(index, 1)
      } else {
        curCart.push({...good, num})
      }
      state.carts[id] = curCart

      Taro.setStorageSync('carts', state.carts)
      return {...state, whatEver: state.whatEver + num};
    },
    clearOneCart(state, {payload}) {
      const {id} = payload
      state.carts[id] = []

      Taro.setStorageSync('carts', state.carts)

      return {...state}
    },
    setOneCartItem(state, {payload}) {
      const {id, good} = payload
      let curCart = state.carts[id] || []

      let idAlikes = curCart.filter(item => item.g_id === good.g_id)

      if (idAlikes.length === 0) {
        curCart.push(good)
      } else{
        let index = curCart.findIndex(item => item.optionalstr === good.optionalstr)
        if (index > -1) {
          curCart[index] = good
        } else {
          curCart.push(good)
        }
      }

      state.carts[id] = curCart

      Taro.setStorageSync('carts', state.carts)

      return {...state}
    },
  }
}
