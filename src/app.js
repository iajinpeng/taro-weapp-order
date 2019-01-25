import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import store from './store'

import Index from './pages/index'

import './app.less'

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/choose-shop/index',
      'pages/shop-index/index',
      'pages/standard-detail/index',
      'pages/notice/index',
      'pages/coupon/index',
      'pages/order-list/index',
      'pages/order-detail/index',
      'pages/post-order/index',
      'pages/present-good/index',
      'pages/add-address/index',
      'pages/choose-coupon/index',
      'pages/alias/index',
      'pages/auth-setting/index'

    ],
    permission: {
      'scope.userLocation': {
        desc: "小马点餐申请获取您的以下信息"
      }
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#f5f5f5',
      navigationBarTitleText: '🐎',
      navigationBarTextStyle: 'black',
    },
  }


  componentDidMount () {
    this.init()
  }

  componentDidShow () {}

  componentDidHide () {}

  componentCatchError () {}

  componentDidCatchError () {}

  init = async () => {

    const conf = Taro.getExtConfigSync()

    if (!conf.domain) {
      Taro.showToast({
        title: '获取ext配置失败',
        icon: 'none'
      })
      return
    }

    store.dispatch({
      type: 'common/setExt',
      payload: conf
    })

    if(!Taro.getStorageSync('sessionId')){
      await store.dispatch({
        type: 'common/requestLogin'
      })
    }
    store.dispatch({
      type: 'common/setUserInfo',
      payload: Taro.getStorageSync('userInfo') || {}
    })
    store.dispatch({
      type: 'common/initRequest'
    })
    Taro.getSystemInfo().then(res => {
      store.dispatch({
        type: 'common/setSistemInfo',
        payload: res
      })
    })
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
