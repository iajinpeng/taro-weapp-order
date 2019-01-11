import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image} from '@tarojs/components'
import {AtBadge} from 'taro-ui'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import {baseUrl} from '../../config'
import '../../app.less'

import './index.less'

class PayBox extends Component {

  static defaultProps = {
    carts: []
  }

  toPostOrder = () => {
    Taro.navigateTo({
      url: '/pages/post-order/index?store_id=' + this.props.storeId
    })
  }

  render () {
    const {theme, carts, onOpenCart, themeInfo} = this.props

    return (
      <View className={classnames('pay-box', carts.length > 0 ? 'active' : '')}>
        <View className='info' onClick={onOpenCart}>
          <Image src={baseUrl + themeInfo.image} />
          <View
            className='badge' style={{color: themeInfo.text_color, backgroundColor: themeInfo.background_color}}
          >{carts.length}</View>
          <View className='price'>
            <Text>&yen;</Text>
            {
              (carts.reduce((total, good) => {
                let price = good.g_price * good.num
                good.optional && (price +=
                  good.optional.reduce((t, item, i) => {
                    return t += +item.list[good.optionalTagIndex[i]].gn_price
                  }, 0))
                good.num && (total += +price)
                return total
              }, 0)).toFixed(2)
            }
          </View>
        </View>
        <Button className={'theme-grad-bg-' + theme} onClick={this.toPostOrder}>去支付</Button>
      </View>
    )
  }
}

export default PayBox
