import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import classnames from 'classnames'
import {AtToast} from 'taro-ui'
import IdButton from '../../components/id-button'
import {baseUrl} from '../../config'
import '../../app.less'

import './index.less'

class PayBox extends Component {

  static defaultProps = {
    carts: [],
    themeInfo: {},
    totalPrice: null,
    btnText: '去支付',
    onClick: null
  }

  state = {
    isAlert: false
  }

  toPostOrder = () => {
    if (this.props.carts.length === 0) {
      this.openAlert()
      return
    }
    let url = '/pages/post-order/index?store_id=' + this.props.storeId
    if (this.props.present) {
      url += ('&type=' + 'present')
    }
    Taro.navigateTo({
      url
    })
  }

  openAlert = () => {
    this.setState({isAlert: true})
  }

  closeAlert = () => {
    this.setState({isAlert: false})
  }

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick()
    } else {
      this.toPostOrder()
    }
  }

  render () {
    const {theme, carts, onOpenCart, themeInfo, simple, totalPrice, btnText, active} = this.props
    const {isAlert} = this.state

    return (
      <View className={classnames('pay-box', (carts.length > 0 || active) ? 'active' : '', simple ? 'simple' : '')}>
        <View className='info' onClick={onOpenCart}>
          <Image src={baseUrl + themeInfo.image} />
          {
            carts.length && !totalPrice &&
            <View
              className='badge' style={{color: themeInfo.text_color, backgroundColor: themeInfo.background_color}}
            >
              {
                carts.reduce((total, good) => {
                  return total += good.num
                }, 0)
              }
            </View>
          }
          <View className='price'>
            <Text>&yen;</Text>
            {
              totalPrice ||
              (carts.reduce((total, good) => {
                if (!good.optionalnumstr) {
                  let price = good.g_price * good.num
                  good.optional && (price +=
                    good.optional.reduce((t, item, i) => {
                      return t += +item.list[good.optionalTagIndex[i]].gn_price * good.num
                    }, 0))
                  good.num && (total += +price)
                } else {
                  total += good.total_price
                }
                return total
              }, 0)).toFixed(2)
            }
          </View>
        </View>
        <IdButton className={'theme-grad-bg-' + theme} onClick={this.handleClick}>{btnText}</IdButton>

        <AtToast
          isOpened={isAlert} text={'您还未添加商品哦～'} iconSize={40} duration={2000}
          icon='shopping-bag-2' hasMask onClose={this.closeAlert}
        />

      </View>
    )
  }
}

export default PayBox
