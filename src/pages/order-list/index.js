import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'

import ConfirmModal from '../../components/confirm-modal'
import {getTouchData} from '../../utils/utils'
import './index.less'

import {orderTypes, baseUrl} from '../../config'

@connect(({common}) => ({...common}))
class OrderList extends Component {
  config = {
    navigationBarTitleText: '订单',
    disableScroll: true
  }

  state = {
    type: 1,
    page: 1,
    page_size: 5,
    lists: [],
    total: 0,
    firstId: '',
    isShowCancelWarn: false,
    curOrder: {}
  }

  canRequestMore = true

  componentDidShow() {
    this.requestOrderList().then(({total, rows}) => {
      this.setState({total, lists: rows, firstId: rows && rows.length > 0 && rows[0].o_id})
    })
  }

  changeTab = i => {
    if(this.state.type === i) return

    this.setState({
      type: i,
      page: 1
    }, () => {
      this.requestOrderList().then(({total, rows}) => {
        this.setState({total, lists: rows, firstId: rows && rows.length > 0 && rows[0].o_id})
      })
    })

  }

  requestOrderList = (targetPage) => {
    const {type, page, page_size} = this.state

    return this.props.dispatch({
      type: 'order/getOrderList',
      payload: {
        type,
        page: targetPage || page,
        page_size
      }
    })
  }

  showOrHideWarn = (bool, order, e) => {
    e && e.stopPropagation()
    this.setState({
      isShowCancelWarn: bool,
      curOrder: order
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
          total: tot,
          firstId: rows[0].o_id
        })
        this.canRequestMore = true
      })
    })
  }

  toOrderDetail = (id, store_id) => {
    Taro.navigateTo({
      url: '/pages/order-detail/index?id=' + id + '&store_id=' + store_id
    })
  }

  cancelOrder = () => {
    const {lists, page_size, curOrder: {store_id, o_id}} = this.state

    this.props.dispatch({
      type: 'order/requestCancelOrder',
      payload: {
        store_id,
        order_id: o_id
      }
    }).then(() => {
      this.setState({
        isShowCancelWarn: false
      })
      Taro.showToast({
        title: '取消成功'
      })
      const index = lists.findIndex(item => item.o_id === o_id)
      const targetPage = Math.floor(index / page_size)

      this.requestOrderList(targetPage).then(({rows}) => {
        let i = rows.findIndex(item => item.o_id === o_id)
        lists[index] = rows[i]
        this.setState({lists})
      })

    })
  }

  requestOrderRepeat = (order_id, store_id, e) => {
    e.stopPropagation()
    this.props.dispatch({
      type: 'order/requestOrderRepeat',
      payload: {
        store_id,
        order_id
      }
    }).then(change => {
      if (change) {
        this.showOrHideAgainWarn(true)
      }
    })

  }

  handleTouchStart = e => {
    this.touch_s_x = e.changedTouches[0].clientX
    this.touch_s_y = e.changedTouches[0].clientY
  }

  handleTouchEnd = e => {
    this.touch_e_x = e.changedTouches[0].clientX
    this.touch_e_y = e.changedTouches[0].clientY

    const {touch_e_x, touch_e_y, touch_s_x, touch_s_y} = this

    const turn = getTouchData(touch_e_x, touch_e_y, touch_s_x, touch_s_y)

    const {type} = this.state

    if (turn === 'right') {
      type === 2 && this.changeTab(1)
    } else if (turn === 'left') {
      type === 1 && this.changeTab(2)
    }
  }

  render() {
    const {theme} = this.props
    const {type, lists, firstId, isShowCancelWarn} = this.state

    return (
      <View className='order-list' onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd}>
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
          scrollIntoView={'id' + firstId}
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
                onClick={this.toOrderDetail.bind(this, order.o_id, order.store_id)}
              >
                <View className='order-title'>
                  <View className={classnames('status', 'theme-c-' + theme)}>
                    {/*<Text className={classnames('icon', 'theme-grad-bg-' + theme, (order.o_order_status === 6 || order.o_order_status === 7) ? 'rotate' : '')}>
                      {
                        (order.o_order_status === 6 || order.o_order_status === 7) ? '+' : '-'
                      }
                    </Text>*/}
                    <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_${(order.o_order_status === 6 || order.o_order_status === 7) ? 7 : 6}.png`} />
                    <Text>{orderTypes[order.o_order_status.toString()[0]]}</Text>
                  </View>
                  <Text className='c-time'>{order.o_reserve_time}</Text>
                </View>
                <View className='order-type'>
                  <Text className='name'>已购商品</Text>
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
                      <View
                        className={classnames('cancel', 'theme-c-' + theme)}
                        onClick={this.showOrHideWarn.bind(this, true, order)}
                      >取消订单</View>
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
                      <Button
                        className={'theme-grad-bg-' + theme}
                        onClick={this.requestOrderRepeat.bind(this, order.o_id, order.store_id)}
                      >再来一单</Button>
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

                  <View className={classnames('order-price', 'theme-c-' + theme)}>
                    <Text className='yen'>&yen;</Text>{order.o_pay_amount}
                  </View>
                </View>

                <View className='tooth-border'/>
              </View>
            ))
          }
        </ScrollView>

        <ConfirmModal
          show={isShowCancelWarn}
          className='clear-cart-modal'
          theme={theme}
          title='取消订单'
          onCancel={this.showOrHideWarn.bind(this, false)}
          onOk={this.cancelOrder}
        >
          确定要取消吗
        </ConfirmModal>
      </View>
    )
  }
}

export default OrderList
