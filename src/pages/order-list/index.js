import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'

import ConfirmModal from '../../components/confirm-modal'
import Copyright from '../../components/copyright'
import CouponModal from '../../components/coupon-modal'
import {getTouchData} from '../../utils/utils'
import './index.less'

import {orderTypes, baseUrl, outOrderTypes} from '../../config'

import orderNull from '../../assets/images/icon-order-null.png'

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
    lists1: [],
    lists2: [],
    total: 0,
    firstId: '',
    isShowCancelWarn: false,
    isShowOrderAgainWarn: false,
    addCartPayload: {},
    curOrder: {},
    requested: false,
    curCoupon: {},
    isShowCoupon: false
  }

  canRequestMore = true

  componentDidShow() {
    this.requestOrderList().then(({total, rows}) => {
      this.setState({total, lists1: rows, requested: true})
    })
    this.requestOrderList(null, 2).then(({total, rows}) => {
      this.setState({total, lists2: rows, requested: true})
    })
  }

  changeTab = i => {
    if (this.state.type === i) return

    Taro.showNavigationBarLoading()
    this.setState({
      page: 1,
      type: i,
    }, () => {
      this.requestOrderList().then(({total, rows}) => {
        Taro.hideNavigationBarLoading()
        this.setState({
          total,
          ['lists' + i]: rows,
          firstId: rows && rows.length > 0 && rows[0].o_id,
        })
      })
    })

  }

  requestOrderList = (targetPage, _type) => {
    const {type, page, page_size} = this.state

    return this.props.dispatch({
      type: 'order/getOrderList',
      payload: {
        type: _type || type,
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
    const {total, page, page_size, type} = this.state

    if (!this.canRequestMore || page * page_size >= total) return

    this.canRequestMore = true

    this.setState({page: page + 1}, () => {
      this.requestOrderList().then(({total: tot, rows}) => {
        this.setState({
          ['lists' + type]: [...this.state['lists' + type], ...rows],
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
    }).then(({change, payload}) => {
      if (change) {
        this.showOrHideAgainWarn(true)
        this.setState({addCartPayload: payload})
      }
    })

  }

  againOk = () => {
    this.props.dispatch({
      type: 'order/repeatOrderAddCart',
      payload: this.state.addCartPayload
    })
    Taro.navigateTo({
      url: '/pages/shop-index/index?id=' + this.state.data.store_id
    })
    this.showOrHideAgainWarn(false)
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

  couponClose = () => {
    const {curCouponIndex, coupon} = this

    this.setState({
      isShowCoupon: false
    })

    if (curCouponIndex + 2 <= coupon.length) {
      this.curCouponIndex  ++
      setTimeout(() => {
        this.setState({
          isShowCoupon: true,
          curCoupon: coupon[this.curCouponIndex],
        })
      }, 350)
    }
  }

  render() {
    const {theme} = this.props
    const {type, requested, isShowCancelWarn, isShowOrderAgainWarn,
      lists1, lists2, curCoupon, isShowCoupon} = this.state

    return (
      requested &&
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
          scrollY className={classnames('content', 'content-1', type === 1 ? 'active' : '')}
          onScrollToLower={this.requestMore}
        >
          {
            lists1.length === 0 &&
            <View className='null'>
              <View className='image-wrap'>
                <Image src={orderNull}/>
                <View/>
                <View/>
                <View className='short'/>
              </View>
              <View>
                <Text>还没有任何订单~ \n 赶快快去下一单吧~~</Text>
              </View>
            </View>
          }
          {
            lists1.length > 0 &&
            <View className='list'>
              {
                lists1.map((order, index) => (
                  <View
                    className='order-item' key={index} id={'id' + order.o_id}
                    onClick={this.toOrderDetail.bind(this, order.o_id, order.store_id)}
                  >
                    <View className='wrap'>
                      <View className='order-title'>
                        <View className={classnames('status', 'theme-c-' + theme)}>
                          {/*<Text className={classnames('icon', 'theme-grad-bg-' + theme, (order.o_order_status === 6 || order.o_order_status === 7) ? 'rotate' : '')}>
                      {
                        (order.o_order_status === 6 || order.o_order_status === 7) ? '+' : '-'
                      }
                    </Text>*/}
                          <Image
                            src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_${(order.o_order_status === 6 || order.o_order_status === 7) ? 7 : 6}.png`}/>
                          {
                            order.o_take_type !== 3 ?
                              <Text>{orderTypes[order.o_order_status.toString()[0]]}</Text>
                              :
                              <Text>{outOrderTypes[order.o_order_status]}</Text>
                          }
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
                          (order.o_order_status.toString()[0] === '3') &&
                          <View className='good-info'>
                            <View>取餐号: <Text
                              className={classnames('theme-c-' + theme)}>{order.o_take_no}</Text></View>
                            <View>{order.status_remark}</View>
                          </View>
                        }

                        {
                          +order.o_take_type === 3 &&
                          +order.take_status !== 9 && +order.take_status !== 10 &&
                          (order.o_order_status.toString()[0] === '4') &&
                          !!order.status_remark &&
                          <View className='good-info'>
                            <View className={classnames('out', 'theme-c-' + theme)}>{order.status_remark}</View>
                          </View>
                        }

                        {
                          +order.take_status === 9 &&
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('out', 'red')}>物品配送异常，正在返回商家中</View>
                          </View>
                        }

                        {
                          +order.take_status === 10 &&
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('out', 'red')}>配送异常物品已返回商家</View>
                          </View>
                        }

                        {
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('theme-c-' + theme)}>
                              <Text>等待骑手前来取餐，请耐心等待</Text>
                            </View>
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
                  </View>
                ))
              }
            </View>
          }
          <View style={{marginTop: '100px'}}>
            <Copyright />
          </View>
        </ScrollView>

        <ScrollView
          scrollY className={classnames('content', 'content-2', type === 2 ? 'active' : '')}
          onScrollToLower={this.requestMore}
        >
          {
            lists2.length === 0 &&
            <View className='null'>
              <View className='image-wrap'>
                <Image src={orderNull}/>
                <View/>
                <View/>
                <View className='short'/>
              </View>
              <View>
                <Text>还没有任何订单~ \n 赶快快去下一单吧~~</Text>
              </View>
            </View>
          }
          {
            lists2.length > 0 &&
            <View className='list'>
              {
                lists2.map((order, index) => (
                  <View
                    className='order-item' key={index} id={'id' + order.o_id}
                    onClick={this.toOrderDetail.bind(this, order.o_id, order.store_id)}
                  >
                    <View className='wrap'>
                      <View className='order-title'>
                        <View className={classnames('status', 'theme-c-' + theme)}>
                          {/*<Text className={classnames('icon', 'theme-grad-bg-' + theme, (order.o_order_status === 6 || order.o_order_status === 7) ? 'rotate' : '')}>
                      {
                        (order.o_order_status === 6 || order.o_order_status === 7) ? '+' : '-'
                      }
                    </Text>*/}
                          <Image
                            src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_${(order.o_order_status === 6 || order.o_order_status === 7) ? 7 : 6}.png`}/>
                          {
                            order.o_take_type !== 3 ?
                              <Text>{orderTypes[order.o_order_status.toString()[0]]}</Text>
                              :
                              <Text>{outOrderTypes[order.o_order_status]}</Text>
                          }
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
                          (order.o_order_status.toString()[0] === '3') &&
                          <View className='good-info'>
                            <View>取餐号: <Text
                              className={classnames('theme-c-' + theme)}>{order.o_take_no}</Text></View>
                            <View>{order.status_remark}</View>
                          </View>
                        }

                        {
                          +order.o_take_type === 3 &&
                          +order.take_status !== 9 && +order.take_status !== 10 &&
                          (order.o_order_status.toString()[0] === '4') &&
                          !!order.status_remark &&
                          <View className='good-info'>
                            <View className={classnames('out', 'theme-c-' + theme)}>{order.status_remark}</View>
                          </View>
                        }

                        {
                          +order.take_status === 9 &&
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('out', 'red')}>物品配送异常，正在返回商家中</View>
                          </View>
                        }

                        {
                          +order.take_status === 10 &&
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('out', 'red')}>配送异常物品已返回商家</View>
                          </View>
                        }

                        {
                          order.o_order_status.toString()[0] === '4' &&
                          <View className='good-info'>
                            <View className={classnames('theme-c-' + theme)}>
                              <Text>等待骑手前来取餐，请耐心等待</Text>
                            </View>
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
                  </View>
                ))
              }
            </View>
          }
          <View style={{marginTop: '100px'}}>
            <Copyright />
          </View>
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

        <ConfirmModal
          show={isShowOrderAgainWarn}
          className='order-again-modal'
          theme={theme}
          onCancel={this.showOrHideAgainWarn.bind(this, false)}
          onOk={this.againOk}
        >
          商品规格属性已变更，是否重新选择？
        </ConfirmModal>

        <CouponModal
          show={isShowCoupon} coupon={curCoupon}
          onClose={this.couponClose}
        />
      </View>
    )
  }
}

export default OrderList
