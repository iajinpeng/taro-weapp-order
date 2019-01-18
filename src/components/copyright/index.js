import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {baseUrl} from '../../config/index';
import './index.less'

@connect(({common}) => ({...common}))
class Copyright extends Component {

  render () {
    const {bottom_logo} = this.props

    return (
      <View className='copyright'>
        <Image src={bottom_logo ? baseUrl + bottom_logo : ''} mode='widthFix' />
        <View>小马飞腾提供技术支持</View>
      </View>
    )
  }
}

export default Copyright
