import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image} from '@tarojs/components'
import classnames from 'classnames'
import {AtToast} from 'taro-ui'
import PropTypes from 'prop-types'
import {baseUrl} from '../../config'
import '../../app.less'

import './index.less'

class PayBox extends Component {

  static defaultProps = {
    carts: [],
    themeInfo: {}
  }

  state = {
    isAlert: false
  }

  toPostOrder = () => {
    if (this.props.carts.length === 0) {
      this.openAlert()
      return
    }
    Taro.navigateTo({
      url: '/pages/post-order/index?store_id=' + this.props.storeId
    })
  }

  openAlert = () => {
    this.setState({isAlert: true})
  }

  closeAlert = () => {
    this.setState({isAlert: false})
  }

  render () {
    const {theme, carts, onOpenCart, themeInfo, simple} = this.props
    const {isAlert} = this.state

    return (
      <View className={classnames('pay-box', carts.length > 0 ? 'active' : '', simple ? 'simple' : '')}>
        <View className='info' onClick={onOpenCart}>
          <Image src={baseUrl + themeInfo.image} />
          {
            carts.length &&
            <View
              className='badge' style={{color: themeInfo.text_color, backgroundColor: themeInfo.background_color}}
            >{carts.length}</View>
          }
          <View className='price'>
            <Text>&yen;</Text>
            {
              (carts.reduce((total, good) => {
                let price = good.g_price * good.num
                good.optional && (price +=
                  good.optional.reduce((t, item, i) => {
                    return t += +item.list[good.optionalTagIndex[i]].gn_price * good.num
                  }, 0))
                good.num && (total += +price)
                return total
              }, 0)).toFixed(2)
            }
          </View>
        </View>
        <Button className={'theme-grad-bg-' + theme} onClick={this.toPostOrder}>去支付</Button>

        <AtToast
          isOpened={isAlert} text={'您还未添加商品哦～'} iconSize={40} duration={2000}
          icon='shopping-bag-2' hasMask onClose={this.closeAlert}
        />

      </View>
    )
  }
}

export default PayBox
