import Taro, {Component} from '@tarojs/taro'
import {View, Image, Button} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import {themeBtnShadowColors} from "../../config/index";
import './index.less'

@connect(({common}) => ({...common}))
class AuthSetting extends Component {

  config = {
    navigationBarTitleText: '定位设置',
  }

  toSetting = async () => {
    const res = await Taro.openSetting({scope: 'scope.userLocation'})
    if (res.authSetting['scope.userLocation']) {
      this.props.dispatch({
        type: 'common/getSetLocalInfo'
      })
      Taro.reLaunch({
        url: '/pages/index/index'
      })
    }
  }

  render () {
    const {theme} = this.props
    const baseUrl = this.props.ext.domain
    return (
      <View className='auth-setting'>
        <View className='bg'>
          <Image src={baseUrl + '/static/addons/diancan/img/nothing.jpg'} />
          <View className={classnames('tip', 'theme-grad-bg-filter-' + theme)}>
            <View>温馨提示：</View>
            <View>为了您的良好体验,</View>
            <View>请将地理位置授权给我们。</View>
          </View>
        </View>
        <Button
          className={'theme-grad-bg-' + theme} onClick={this.toSetting}
          style={{boxShadow: '0 40rpx 40rpx -30rpx ' + themeBtnShadowColors[theme]}}
        >一键获取</Button>
      </View>
    )
  }

}


export default AuthSetting
