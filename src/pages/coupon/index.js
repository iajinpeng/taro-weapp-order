import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './index.less'

@connect(({common}) => ({...common}))
class Coupon extends Component {
  config = {
    navigationBarTitleText: '我的优惠'
  }

  state = {
    type: 1,
    page: 1,
    page_size: 5,
    lists: [],
    total: 0,
    openIndex: null
  }

  canRequestMore = true

  componentDidShow() {
    this.requestCouponList().then(({total, rows}) => {
      this.setState({
        lists: rows,
        total
      })
    })
  }

  changeTab = i => {
    if(this.state.type === i) return

    this.setState({type: i}, () => {
      this.requestCouponList().then(({total, rows}) => {
        this.setState({
          lists: rows,
          total
        })
      })
    })

  }

  requestCouponList = () => {
    const {type, page, page_size} = this.state

    return this.props.dispatch({
      type: 'common/requestCouponList',
      payload: {
        type: type,
        page,
        page_size
      }
    })
  }

  requestMore = () => {
    const {total, page, page_size} = this.state

    if (!this.canRequestMore || page * page_size >= total) return

    this.canRequestMore = true

    this.setState({page: page + 1}, () => {
      this.requestOrderList().then(({total, rows}) => {
        this.setState({
          lists: [...this.state.lists, ...rows],
          total
        })
        this.canRequestMore = true
      })
    })
  }

  openCondition = index => {
    const {openIndex} = this.state
    this.setState({openIndex: openIndex !== index ? index : null})
  }

  toChooseShop = () => {
    Taro.navigateTo({
      url: '/pages/choose-shop/index'
    })
  }

  render() {
    const {theme} = this.props
    const {type, lists, openIndex} = this.state

    return (
      <View className='coupon'>
        <View className='title'>
          <View
            className={classnames('normal', type === 1 ? 'active theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 1)}>未过期</View>
          <View
            className={classnames('useless', type === 2 ? 'active theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 2)}>已过期</View>
        </View>

        <ScrollView scrollY className='content'>
          {
            lists.length === 0 &&
            <View className='null'>
              <Image src={require('../../images/icon-coupon-null.png')} />
              <View>还没有任何优惠券哦~</View>
            </View>
          }
          {
            lists.length > 0 &&
            <View className='coupon-list'>
              {
                lists.map((coupon, index) => (
                  <View className='item' key={index}>
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
                      <View
                        className={classnames('handle', 'theme-bg-' + theme)}
                        onClick={this.toChooseShop}
                      >去使用</View>
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
                ))
              }

            </View>
          }

        </ScrollView>
      </View>
    )
  }
}

export default Coupon
