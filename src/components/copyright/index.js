import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
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
          // b_bottom_status === 1 &&
          <View className='name'>
            <Text className='line' />
            <Text>{b_bottom_content}</Text>
            <Text className='line' />
          </View>
        }
      </View>
    )
  }
}

export default Copyright
