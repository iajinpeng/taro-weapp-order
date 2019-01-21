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


      if (good.fs_id) {
        let index = curCart.findIndex(item => item.fs_id === good.fs_id)
        if (index > -1) {
          if (num === 1) {
            console.log(curCart[index])
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
        if (!good.propertyTagIndex) {
          let index = curCart.findIndex(item => !item.fs_id && (item.g_id === good.g_id))

          if (index > -1) {
            !curCart[index].num && (curCart[index].num = 0)
            curCart[index].num += num

            curCart[index].num === 0 && curCart.splice(index, 1)
          } else {
            curCart.push({...good, num})
          }
        } else {
          curCart.map((item, index) => item.index = index)
          let idAlikes = curCart.filter(item => item.g_id === good.g_id)

          if (idAlikes.length === 0) {
            curCart.push({...good, num})
          } else{
            let index = idAlikes.findIndex(item => !item.fs_id && (item.optionalstr === good.optionalstr))
            if (index > -1) {

              let i = idAlikes[index].index
              curCart[i].num += num
              curCart[i].num === 0 && curCart.splice(i, 1)

            } else {
              curCart.push({...good, num})
            }
          }

        }

      }

      state.carts[id] = curCart

      Taro.setStorageSync('carts', state.carts)
      return {...state, whatEver: state.whatEver + num};
    },
    setComboCart(state, {payload}) {
      const {id, good, num} = payload
      let curCart = state.carts[id]
      !curCart && (curCart = [])

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

      Taro.setStorageSync('carts', state.carts)
      return {...state, whatEver: state.whatEver + num};

    },
    clearOneCart(state, {payload}) {
      const {id} = payload
      state.carts[id] = []

      Taro.setStorageSync('carts', state.carts)

      return {...state}
    },
  }
}
