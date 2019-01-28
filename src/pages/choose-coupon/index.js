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

  openCondition = (index, e) => {
    e.stopPropagation()

    const {couponOptions} = this.props
    couponOptions.showDetail = !couponOptions.showDetail
    this.props.dispatch({
      type: 'order/setCouponOptions',
      payload: {
        couponOptions
      }
    })
  }

  changeCoupon = (index, available) => {
    if (index === this.props.curCouponIndex || (index !== -1 && !available)) return

    this.props.dispatch({
      type: 'order/setCouponIndex',
      payload: {
        curCouponIndex: index
      }
    })
  }

  render () {
    const {theme, curCouponIndex, couponOptions} = this.props

    return (
      <View className='choose-coupon coupon'>
        <View className='main'>
          <View className='unuse' onClick={this.changeCoupon.bind(this, -1)}>
            {
              curCouponIndex === -1 ?
                <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_2.png`} />
                :
                <View className='un-select' />
            }


            <View>不使用优惠券</View>
          </View>

          {
            Array.isArray(couponOptions) &&
            couponOptions.map((coupon, index) => (
              <View className='item' key={index} onClick={this.changeCoupon.bind(this, index, coupon.available)}>
                {
                  curCouponIndex === index ?
                    <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_2.png`} />
                    :
                    <View className='un-select' />

                }
                <View>
                  <View className='entity'>
                    <View className={classnames('deno', coupon.available ? 'theme-bg-' + theme : '')}>
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
                        <AtIcon value={coupon.showDetail ? 'chevron-up': 'chevron-down'} size='19' />
                      </View>
                    </View>
                  </View>
                  {
                    coupon.showDetail &&
                    <View className='condi'>
                      <View style={{color: !coupon.available ? '#F33C3C' : ''}}>
                        {
                          coupon.available ? '优惠券使用条件' : ' 本次不可用原因'
                        }
                      </View>
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
