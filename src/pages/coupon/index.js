import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './index.less'

@connect(() => ({}))
class Coupon extends Component {
  config = {
    navigationBarTitleText: '我的优惠'
  }

  state = {
    activeIndex: 1,
    page: 1,
    page_size: 10,
    lists: []
  }

  componentDidShow() {
    this.requestCouponList()
  }

  changeTab = i => {
    if(this.state.activeIndex === i) return

    this.setState({activeIndex: i})

    this.requestCouponList()
  }

  requestCouponList = () => {
    const {activeIndex, page, page_size, lists} = this.state

    this.props.dispatch({
      type: 'common/requestCouponList',
      payload: {
        type: activeIndex,
        page,
        page_size
      }
    })
  }

  render() {
    const {activeIndex} = this.state

    return (
      <View className='coupon'>
        <View className="title">
          <View
            className={classnames('normal', activeIndex === 1 ? 'active' : '')}
            onClick={this.changeTab.bind(this, 1)}>未过期</View>
          <View
            className={classnames('useless', activeIndex === 2 ? 'active' : '')}
            onClick={this.changeTab.bind(this, 2)}>已过期</View>
        </View>

        <ScrollView scrollY className='content'>
          {/*<View className="null">*/}
            {/*<Image src={require('../../images/icon-coupon-null.png')} />*/}
            {/*<View>还没有任何优惠券哦~</View>*/}
          {/*</View>*/}
          <View className="coupon-list">
            <View className="item">
              <View className="entity">
                <View className="deno">
                  <View className="price">
                    <Text>&yen;</Text>
                    5.00
                  </View>
                  <View>满25元可用</View>
                </View>
                <View className="desc">
                  <View className="name">进店有礼5</View>
                  <View className="time">2018.10.10 23:59:59 至 2018.11.10 23:59:59</View>
                  <View className="btn">使用条件
                    <AtIcon value='chevron-down' size='19' />
                  </View>
                </View>
                <View className="handle">去使用</View>
              </View>
              <View className="condi">
                <View>优惠券使用条件</View>
                <View>1、仅商品原价时可用</View>
                <View>2、限每周一周六使用</View>
                <View>3、部分商品可用：烧仙草奶茶、珍珠奶茶</View>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    )
  }
}

export default Coupon
