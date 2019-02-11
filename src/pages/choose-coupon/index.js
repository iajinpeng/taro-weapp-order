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
    openStatus: []
  }

  componentWillMount () {
    let openStatus = this.props.couponOptions.map(item => !item.available)
    this.setState({openStatus})
  }

  openCondition = (index, e) => {
    e.stopPropagation()
    let {openStatus} = this.state

    openStatus[index] = !openStatus[index]
    this.setState({openStatus})
  }

  changeCoupon = (index, available) => {
    if (index === this.props.curCouponIndex || (index !== -1 && !available)) return

    this.props.dispatch({
      type: 'order/setCouponIndex',
      payload: {
        curCouponIndex: index
      }
    })

    Taro.navigateBack()
  }

  render () {
    const {theme, curCouponIndex, couponOptions} = this.props
    const {openStatus} = this.state

    return (
      <View className='choose-coupon coupon'>
        {
          Array.isArray(couponOptions) && couponOptions.length > 0 ?
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
                          <Text className='num font-xin-bold'>{coupon.uc_price}</Text>
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
                      openStatus[index] &&
                      <View className='condi'>
                        <View style={{color: !coupon.available ? '#F33C3C' : ''}}>
                          {
                            coupon.available ? '优惠券使用条件' : ' 本次不可用原因'
                          }
                        </View>
                        {
                          coupon.norm.map((item, i) => (
                            <View key={i}>{i + 1}. {item}</View>
                          ))
                        }
                      </View>
                    }
                  </View>
                </View>
              ))
            }

          </View>
            :
            <View className='null'>
              <Image src={require('../../assets/images/icon-coupon-null.png')} />
              <View>还没有任何优惠券哦~</View>
            </View>
        }
        {/*<Copyright />*/}
      </View>
    )
  }
}

export default ChooseCoupon
