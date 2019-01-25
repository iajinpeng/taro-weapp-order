import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button} from '@tarojs/components'
import {connect} from '@tarojs/redux'

@connect(({common}) => ({...common}))
class AuthSetting extends Component {

  toSetting = async () => {
    const res = await Taro.openSetting({scope: 'scope.userLocation'})
    if (res.authSetting['scope.userLocation']) {
      this.props.dispatch({
        type: 'common/getSetLocalInfo'
      })
      Taro.redirectTo({
        url: '/pages/index/index'
      })
    }
  }

  render () {
    return (
      <View className='auth-setting'>
        <View>请将位置信息授权给我们</View>
        <Button onClick={this.toSetting}>一键获取</Button>
      </View>
    )
  }

}


export default AuthSetting
