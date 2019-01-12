import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import './index.less'

import {orderTypes} from '../../config'

@connect(({common}) => ({...common}))
class OrderList extends Component {
  config = {
    navigationBarTitleText: '订单'
  }

  state = {
    type: 1,
    page: 1,
    page_size: 5,
    lists: [],
    total: 0
  }

  canRequestMore = true

  componentWillMount() {
    this.requestOrderList().then(({total, rows}) => {
      this.setState({total, lists: rows})
    })
  }

  changeTab = i => {
    if(this.state.type === i) return

    this.setState({
      type: i,
      page: 1
    }, () => {
      this.requestOrderList().then(({total, rows}) => {
        this.setState({total, lists: rows})
      })
    })

  }

  requestOrderList = () => {
    const {type, page, page_size} = this.state

    return this.props.dispatch({
      type: 'order/getOrderList',
      payload: {
        type,
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
      this.requestOrderList().then(({total: tot, rows}) => {
        this.setState({
          lists: [...this.state.lists, ...rows],
          total: tot
        })
        this.canRequestMore = true
      })
    })
  }

  toOrderDetail = id => {
    Taro.navigateTo({
      url: '/pages/order-detail/index?id=' + id
    })
  }

  render() {
    const {theme} = this.props
    const {type, lists} = this.state

    return (
      <View className='order-list'>
        <View className='title'>
          <View
            className={classnames('normal', type === 1 ? 'active' + ' theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 1)}>今日订单</View>
          <View
            className={classnames('useless', type === 2 ? 'active' + ' theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 2)}>历史订单</View>
        </View>

        <ScrollView
          scrollY className='content'
          scrollIntoView={'id' + lists[0].o_id}
          onScrollToLower={this.requestMore}
        >
          {
            lists.length === 0 &&
            <View className='null'>
              <View className='image-wrap'>
                <Image src={require('../../images/icon-order-null.png')} />
                <View />
                <View />
                <View className='short' />
              </View>
              <View>
                <Text>还没有任何订单~ \n 赶快快去下一单吧~~</Text>
              </View>
            </View>
          }
          {
            lists.map((order, index) => (
              <View
                className='order-item' key={index} id={'id' + order.o_id}
                onClick={this.toOrderDetail.bind(this, order.o_id)}
              >
                <View className='order-title'>
                  <View className={classnames('status', 'theme-c-' + theme)}>
                    <Text className={classnames('icon', 'theme-grad-bg-' + theme, (order.o_order_status === 6 || order.o_order_status === 7) ? 'rotate' : '')}>
                      {
                        (order.o_order_status === 6 || order.o_order_status === 7) ? '+' : '-'
                      }
                    </Text>
                    <Text>{orderTypes[order.o_order_status.toString()[0]]}</Text>
                  </View>
                  <Text className='c-time'>{order.o_reserve_time}</Text>
                </View>
                <View className='order-type'>
                  <Text>已购商品</Text>
                  <Text className='tag'>{order.o_take_type === 3 ? '外卖单' : '堂食单'}</Text>
                </View>
                {
                  order.goods.map((good, i) => (
                    <View className='good' key={i}>
                      <View className='good-info'>
                        <View>{good.od_title}</View>
                        {
                          good.od_num &&
                          <View>{good.od_norm_str}</View>
                        }
                      </View>
                      <Text>x{good.od_num}</Text>
                    </View>
                  ))
                }
                <View className='good remark'>
                  {
                    order.o_order_status === 1 &&
                    <View className='good-info'>
                      <View>立即支付</View>
                      <View>{order.status_remark}</View>
                    </View>
                  }

                  {
                    order.o_order_status === 2 &&
                    <View className='good-info'>
                      <View>取消订单</View>
                    </View>
                  }

                  {
                    (order.o_order_status.toString()[0] === '3' || order.o_order_status.toString()[0] === '4') &&
                    <View className='good-info'>
                      <View>取餐号: <Text className={classnames('theme-c-' + theme)}>{order.o_take_no}</Text></View>
                      <View>{order.status_remark}</View>
                    </View>
                  }

                  {
                    order.o_order_status === 5 &&
                    <View className='good-info'>
                      <Button className={'theme-grad-bg-' + theme}>再来一单</Button>
                    </View>
                  }

                  {
                    (order.o_order_status === 6 || order.o_order_status === 7) &&
                    <View className='good-info'>
                      <View className={classnames('theme-c-' + theme)}>
                        <Text>
                          {order.o_refund_remark}
                          {
                            order.o_order_status === 6 ? '\n ' + '退款成功：预计1-7工作日到账' : ''
                          }
                        </Text>
                      </View>
                    </View>
                  }

                  <View className={classnames('post-order-price', 'theme-c-' + theme)}>
                    <Text className='yen'>&yen;</Text>{order.o_pay_amount}
                  </View>
                </View>

                <View className='tooth-border'/>
              </View>
            ))
          }
        </ScrollView>
      </View>
    )
  }
}

export default OrderList
