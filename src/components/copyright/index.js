import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {baseUrl} from '../../config/index';
import './index.less'

@connect(({common}) => ({...common}))
class Copyright extends Component {

  render () {
    const {bottom_logo, b_bottom_status, b_bottom_content} = this.props

    return (
      <View className='copyright'>
        <Image src={bottom_logo ? baseUrl + bottom_logo : ''} mode='widthFix' />
        {
          b_bottom_status === 1 &&
          <View>{b_bottom_content}</View>
        }
      </View>
    )
  }
}

export default Copyright
