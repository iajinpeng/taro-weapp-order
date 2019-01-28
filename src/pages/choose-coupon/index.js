import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import {baseUrl} from '../../config/index';
import Copyright from '../../components/copyright'

import '../coupon/index.less'
import './index.less'


@connect(({common, order}) => ({...common, ...order}))
class ChooseCoupon extends Component {

  config = {
    navigationBarTitleText: '选择优惠券',
    // disableScroll: true
  }

  state = {
    openIndex: null
  }

  openCondition = (index, e) => {
    e.stopPropagation()

    const {openIndex} = this.state
    this.setState({openIndex: openIndex !== index ? index : null})
  }

  changeCoupon = index => {
    if (index === this.props.curCouponIndex) return

    this.props.dispatch({
      type: 'order/setCouponIndex',
      payload: {
        curCouponIndex: index
      }
    })
  }

  render () {
    const {theme, couponOptions, curCouponIndex} = this.props
    const {openIndex} = this.state

    return (
      <View className='choose-coupon coupon'>
        <View className='main'>
          <View className='unuse' onClick={this.changeCoupon.bind(this, 99)}>
            {
              curCouponIndex === 99 ?
                <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_2.png`} />
                :
                <View className='un-select' />
            }


            <View>不使用优惠券</View>
          </View>

          {
            Array.isArray(couponOptions) &&
            couponOptions.map((coupon, index) => (
              <View className='item' key={index} onClick={this.changeCoupon.bind(this, index)}>
                {
                  curCouponIndex === index ?
                    <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_2.png`} />
                    :
                    <View className='un-select' />

                }
                <View>
                  <View className='entity'>
                    <View className={classnames('deno', 'theme-bg-' + theme)}>
                      <View className='price'>
                        <Text>&yen;</Text>
                        {coupon.uc_price}
                      </View>
                      <View>{coupon.uc_min_amount}</View>
                    </View>
                    <View className='desc'>
                      <View className='name'>{coupon.uc_name}</View>
                      <View className='time'>{coupon.uc_start_time} 至 {coupon.uc_end_time}</View>
                      <View className='btn' onClick={this.openCondition.bind(this, index)}>使用条件
                        <AtIcon value={openIndex === index ? 'chevron-up': 'chevron-down'} size='19' />
                      </View>
                    </View>
                  </View>
                  {
                    openIndex === index &&
                    <View className='condi'>
                      <View>优惠券使用条件</View>
                      {
                        coupon.norm.map((item, i) => (
                          <View key={i}>{i + 1}, {item}</View>
                        ))
                      }
                    </View>
                  }
                </View>
              </View>
            ))
          }

          <Copyright />
        </View>
      </View>
    )
  }
}

export default ChooseCoupon
