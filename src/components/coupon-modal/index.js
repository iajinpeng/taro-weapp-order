import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import {AtCurtain} from 'taro-ui'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'

class CouponModal extends Component {

  render () {
    return (
      <AtCurtain isOpened={true} className='coupon-modal'>
        <View className='coupon-modal-content'>
          <Image src={require('../../images/coupon.png')} />
          <View className='list'>

          </View>
        </View>
      </AtCurtain>
    )
  }
}

export default CouponModal
