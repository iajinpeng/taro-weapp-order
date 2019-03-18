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
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#f5f5f5',
      navigationBarTitleText: '🐎',
      navigationBarTextStyle: 'black',
      backgroundColor: '#f5f5f5',
    },
    // networkTimeout: {
    //   request: 5000
    // }
  }


  componentDidMount () {
    Taro.removeStorageSync('stopLogin')
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

    store.dispatch({
      type: 'common/getSetLocalInfo'
    }).then(() => {
      Taro.eventCenter.trigger('hadLocalInfo')
    })

    if(!Taro.getStorageSync('sessionId')){
      await store.dispatch({
        type: 'common/requestLogin'
      })
    }

    const userInfoStorage = Taro.getStorageSync('userInfo')
    if (new Date().getTime() - userInfoStorage.time < 7 * 24 * 60 * 60 * 1000) {
      store.dispatch({
        type: 'common/setUserInfo',
        payload: userInfoStorage.real || {userInfo: null}
      })
    } else {
      Taro.removeStorageSync('userInfo')
    }

    store.dispatch({
      type: 'common/initRequest'
    }).then(() => {
      Taro.eventCenter.trigger('hadThemeInfo')
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
