import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Block, Map, Image, CoverView, CoverImage} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './index.less'
import {orderTypes, outOrderTypes} from '../../config'
import ConfirmModal from '../../components/confirm-modal'
import BackToHome from '../../components/back-to-home'
import CouponModal from '../../components/coupon-modal'

@connect(({common}) => ({
  ...common
}))
class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情',
    enablePullDownRefresh: true
    // disableScroll: true
  }

  state = {
    data: {
      o_order_status: ''
    },
    isShowCancelWarn: false,
    isShowOrderAgainWarn: false,
    markers: null,
    polyline: [],
    addCartPayload: {},
    curCoupon: {},
    isShowCoupon: false,
    isShowMap: false
  }

  componentWillMount() {

    if (!this.props.b_logo) {
      Taro.eventCenter.on('hadThemeInfo', this.init)
    } else {
      this.init()
    }
  }

  init = () => {
    this.getOrderDetail().then(res => {
      this.coupon = res.coupon
      this.curCouponIndex = 0

      if (res.coupon.length > 0) {
        this.setState({isShowMap: false})
        let timer = setTimeout(() => {
          this.setState({
            isShowCoupon: true,
            curCoupon: res.coupon[0],
          })
          clearTimeout(timer)
        }, 500)
      }
    })
  }

  componentWillUnmount () {
    clearTimeout(this.timeOut)
  }

  onPullDownRefresh () {
    Taro.stopPullDownRefresh()
    this.getOrderDetail()
  }

  getOrderDetail = () => {
    const {b_logo} = this.props
    return this.props.dispatch({
      type: 'order/getOrderDetail',
      payload: {
        id: this.$router.params.id
      }
    }).then((data) => {
      let mapAttrs = {
        markers: [{
          iconPath: b_logo,
          width: 40,
          height: 40,
          longitude: data.s_address_lng,
          latitude: data.s_address_lat,
          id: data.o_id,
          title: data.o_store_name,
          callout: {
            content: data.o_store_name,
            fontSize: 12,
            padding: 8,
            display: 'ALWAYS',
            // bgColor: 'transparent',
            borderRadius: 4
          }
        }],
        polyline: []
      }

      if (+data.o_order_status === 42) {
        mapAttrs.markers.push({
          iconPath: data.u_avatar,
          width: 40,
          height: 40,
          id: '_' + data.o_id,
          longitude: data.o_address_lng,
          latitude: data.o_address_lat,
        })

        if (+data.take_id === 1) {
          mapAttrs.polyline = [{
            points: [
              {
                longitude: data.s_address_lng,
                latitude: data.s_address_lat,
              },
              {
                longitude: data.o_address_lng,
                latitude: data.o_address_lat,
              }
            ],
            color: '#FF0000DD',
            width: 2,
            dottedLine: true,
          }]
        }

        if (+data.take_id === 2) {
          const driverImg = require('../../assets/images/icon-driver.png')

          mapAttrs.markers.push({
            iconPath: driverImg,
            width: 36,
            height: 36,
            id: '_' + data.o_id,
            longitude: data.transporter_lng,
            latitude: data.transporter_lat,
            callout: {
              content: `距离您${data.take_distance > 1000 ? ((data.take_distance /1000).toFixed(2) + 'k') : data.take_distance}m`,
              fontSize: 12,
              padding: 8,
              display: 'ALWAYS',
              borderRadius: 4
            }
          })
        }
      }

      this.setState({
        data,
        ...mapAttrs
      }, () => {
        if (+data.o_order_status === 42) {
          Taro.createMapContext('map').includePoints({
            padding: [80, 50, 60, 50],
            points: mapAttrs.markers
          })
        }
        +data.o_take_type === 3 && this.setState({isShowMap: true})
      })

      if (data.o_order_status !== 1 && data.o_order_status !== 5 &&
        data.o_order_status !== 6 && data.o_order_status !== 7 &&
        data.o_order_status !== 8) {
        this.timeOut = setTimeout(async () => {
          Taro.showNavigationBarLoading()
          await this.getOrderDetail()
          Taro.hideNavigationBarLoading()
          clearTimeout(this.timeOut)
        }, 10000)
      }
      return data
    })
  }

  handleRefresh = async () => {
    Taro.showLoading()

    await this.getOrderDetail()

    Taro.hideLoading()
  }

  showOrHideWarn = bool => {
    this.setState({isShowCancelWarn: bool})
  }

  showOrHideAgainWarn = bool => {
    this.setState({isShowOrderAgainWarn: bool})
  }

  againOk = () => {
    this.props.dispatch({
      type: 'order/repeatOrderAddCart',
      payload: this.state.addCartPayload
    })
    Taro.navigateTo({
      url: '/pages/shop-index/index?id=' + this.state.data.store_id + '&showcart=1'
    })
    this.showOrHideAgainWarn(false)
  }

  stepPay = async () => {

    const order_id = +this.$router.params.id
    const store_id = +this.$router.params.store_id

    const res = await this.props.dispatch({
      type: 'order/requestPayOrder',
      payload: {
        store_id,
        order_id
      }
    })

    if (+res.code === 500) {
      Taro.showToast({
        title: res.message,
        icon: 'none'
      })
    } else {
      await Taro.requestPayment({
        ...res,
        timeStamp: res.timestamp
      })

      Taro.showLoading({mask: true})

      await this.props.dispatch({
        type: 'order/getOrderPayStatus',
        payload: {
          store_id,
          order_id
        }
      })

      Taro.hideLoading()

      Taro.showToast({
        title: '支付成功'
      })
      this.getOrderDetail()
    }
  }

  cancelOrder = () => {
    const order_id = +this.$router.params.id
    const store_id = +this.$router.params.store_id

    this.props.dispatch({
      type: 'order/requestCancelOrder',
      payload: {
        store_id,
        order_id
      }
    }).then(() => {
      this.setState({
        isShowCancelWarn: false
      })
      Taro.showToast({
        title: '取消成功'
      })
      this.getOrderDetail()
    })
  }

  contactVendor = (phoneNumber) => {
    Taro.makePhoneCall({phoneNumber})
  }

  requestOrderRepeat = () => {
    const {data: {store_id, o_id}} = this.state

    this.props.dispatch({
      type: 'order/requestOrderRepeat',
      payload: {
        store_id,
        order_id: o_id
      }
    }).then(({change, payload}) => {
      if (change) {
        this.showOrHideAgainWarn(true)
        this.setState({addCartPayload: payload})
      }
    })


  }

  couponClose = () => {
    const {curCouponIndex, coupon} = this

    this.setState({
      isShowCoupon: false,
      isShowMap: true
    })

    if (curCouponIndex + 2 <= coupon.length) {
      this.curCouponIndex  ++
      this.setState({isShowMap: false})
      setTimeout(() => {
        this.setState({
          isShowCoupon: true,
          curCoupon: coupon[this.curCouponIndex],
        })
      }, 350)
    }
  }

  render() {
    const {theme, systemInfo} = this.props
    const isIphoneX = !!(systemInfo.model && systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    const {data, isShowCancelWarn, markers, isShowOrderAgainWarn,
      polyline, curCoupon, isShowCoupon, isShowMap} = this.state

    return (
      <Block>
        {
          !!data.o_order_status &&
          <View className={classnames('order-detail', isIphoneX ? 'iphonex' : '')}>

            {
              data.o_take_type === 3 && data.o_order_status !== 5
              && data.o_order_status !== 6 && data.o_order_status !== 7
              && data.o_order_status !== 8 &&
              <Block>
                {
                  isShowMap ?
                    <Map
                      id='map'
                      className='map'
                      latitude={data.s_address_lat}
                      longitude={data.s_address_lng}
                      markers={markers}
                      polyline={polyline}
                      showLocation={false}
                    />
                    :
                  <View className='map-alias' />
                }

                {
                  data.o_order_status === 42 && data.take_id === 1 && isShowMap &&
                  <CoverView className='map-tip'>
                    <CoverImage src={require('../../assets/images/icon-bike.png')} />
                   <CoverView className='text'>
                     {
                       `当前由${data.take_id === 1 ? '商家' : '骑手'}配送，请留意骑手来电`
                     }
                     &ensp;
                   </CoverView>
                  </CoverView>
                }

                {
                  data.o_order_status === 42 && data.take_id === 2 &&
                  <CoverView className='map-refresh' onClick={this.handleRefresh}>
                    <CoverImage src={require('../../assets/images/icon-refresh.png')} />
                  </CoverView>
                }
                <View className='out-status'>
                  <View className='info'>
                    <View className={classnames('status-text', 'theme-c-' + theme)}>
                      {outOrderTypes[data.o_order_status]}
                    </View>
                    {
                      (data.o_order_status === 1 || data.o_order_status === 2 ||
                        data.o_order_status.toString()[0] === '3') &&
                      <View className='tip'>{data.status_remark}</View>
                    }
                    {
                      data.take_status !== 9 && data.take_status !== 10 &&
                      <View className='tip'>
                        {
                          {
                            41: '等待骑手前来取餐，请耐心等待',
                            42: `骑手预计在${data.o_reserve_time && data.o_reserve_time.split(' ')[1]}送达`,
                          }[data.o_order_status]
                        }
                      </View>
                    }

                    {
                      data.take_status === 9  &&
                      <View className='tip red'>物品配送异常，正在返回商家中</View>
                    }

                    {
                      data.take_status === 10  &&
                      <View className='tip red'>配送异常物品已返回商家</View>
                    }
                  </View>

                  {
                    (data.o_order_status === 1 || data.o_order_status === 2) &&
                    <View className='cancel' onClick={this.showOrHideWarn.bind(this, true)}>
                      <AtIcon size='24' value='add-circle' />
                      <View>取消订单</View>
                    </View>
                  }

                  <View className={classnames('contact',
                    (data.o_order_status === 1 || data.o_order_status === 2) ? '' : 'long')}
                    onClick={this.contactVendor.bind(this, data.s_telephone)}
                  >
                    <Image src={require('../../assets/images/icon-contact.png')} />
                    <View>联系商家</View>
                  </View>

                </View>

                {
                  data.o_order_status === 1 &&
                  <Button
                    onClick={this.stepPay.bind(this, data)}
                    className={classnames('out-ok', 'theme-grad-bg-' + theme)}
                  >立即支付</Button>
                }
              </Block>
            }


            {
              (data.o_take_type !== 3
              || (data.o_order_status === 5 || data.o_order_status ===6 || data.o_order_status === 7 || data.o_order_status === 8)) &&
              <View className='status'>
                <View className={classnames('status-text', 'theme-c-' + theme)}>{orderTypes[data.o_order_status.toString()[0]]}</View>
                <View className='status-memo'>
                  {
                    data.o_order_status === 1 ? '当前尚未下单，请尽快支付' : ''
                  }

                  {
                    data.o_order_status === 2 ? '商家确认中，请您耐心等待' : ''
                  }

                  {
                    (data.o_order_status === 5 || data.o_order_status === 8) ? '感谢光临 祝您用餐愉快！' : ''
                  }

                  {
                    (data.o_order_status.toString()[0] === '3' || data.o_order_status.toString()[0] === '4') &&
                    <Block>
                      <View className='take-meal'>取餐号:
                        <Text className={classnames('theme-c-' + theme)}>{data.o_take_no}</Text>
                      </View>
                      <View>{data.status_remark}</View>
                    </Block>
                  }

                  {
                    (data.o_order_status === 6 || data.o_order_status === 7) &&
                    <View>
                      <View className='refund_remark'>{data.o_refund_remark}</View>
                      {
                        data.o_order_status === 6 ? '\n ' + '退款成功：预计1-7工作日到账' : ''
                      }
                    </View>
                  }
                </View>
                {
                  (data.o_order_status === 5 || data.o_order_status === 6 || data.o_order_status === 7 || data.o_order_status === 8) &&
                  <Button
                    className={'theme-grad-bg-' + theme}
                    onClick={this.requestOrderRepeat}
                  >再来一单</Button>
                }

                {
                  data.o_order_status === 2 &&
                  <Button onClick={this.showOrHideWarn.bind(this, true)} className={'theme-grad-bg-' + theme}>取消订单</Button>
                }

              </View>
            }

            {
              data.o_order_status === 1 && data.o_take_type !== 3 &&
              <View className='btn'>
                <Button
                  onClick={this.stepPay.bind(this, data)}
                  className={classnames('ok', 'theme-grad-bg-' + theme)}
                >立即支付</Button>
                <Button
                  onClick={this.showOrHideWarn.bind(this, true)}
                  className={classnames('no', 'theme-c-' + theme)}
                >取消订单</Button>
              </View>
            }

            <View className='order-info'>
              <View className='header'>
                <View>
                  <View className='name'>{data.o_store_name}</View>
                  <View className='address'>{data.s_address}</View>
                </View>
                <View>
                  <View>
                    {data.o_take_type !== 3 ? '取餐' : '送达'}
                    时间</View>
                  <View>{data.o_reserve_time}</View>
                </View>
              </View>

              <View className='gap'>
                <View className='line'/>
              </View>

              <View className='content'>
                {
                  data.goods.map((good, index) => (
                    <View className='good' key={index}>
                      <View className='main'>
                        <View className='name'>{good.od_title}</View>
                        <View className='price'>
                          {
                            good.od_original_price * 1 !== 0 &&
                            <Text className='pre'>&yen;{good.od_original_price}</Text>
                          }
                          <Text className='cur'>
                            <Text>&yen;</Text>
                            {good.od_price}
                          </Text>
                        </View>
                      </View>
                      <View className='extra'>
                        <View className='name'>{good.od_norm_str}</View>
                        <View className='num'>x{good.od_num}</View>
                      </View>
                    </View>
                  ))
                }

                {
                  (data.o_take_type !== 1) &&
                  <View className='other'>
                    <Text>打包费</Text>
                    <Text className='price'><Text>&yen; </Text>{data.o_take_money}</Text>
                  </View>
                }
                {
                  data.o_take_type === 3 &&
                  <View className='other'>
                    <Text>配送费</Text>
                    <Text className='price'><Text>&yen; </Text>{data.o_takeaway_money}</Text>
                  </View>
                }
                {
                  data.o_coupon_name &&
                  <View className='other coupon'>
                    <Text>{data.o_coupon_name}</Text>
                    <Text className={classnames('price', 'theme-c-' + theme)}><Text>-&yen; </Text>{data.o_coupon_amount}</Text>
                  </View>
                }

              </View>

              <View className='info'>
                <View className='item'>
                  <Text>下单时间</Text>
                  <Text>{data.o_create_time}</Text>
                </View>
                {
                  data.o_take_type !== 3 &&
                  <View className='item'>
                    <Text>联系方式</Text>
                    <Text>{data.o_contact_mobile}</Text>
                  </View>
                }
                {
                  data.o_take_type === 3 &&
                  <View className='item address-info'>
                    <Text>收货信息</Text>
                    <View>
                      <View style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Text className='user'>{data.o_contact_name}</Text>
                        {data.o_contact_mobile}
                      </View>
                      <View className='address'>{data.o_address}</View>
                    </View>
                  </View>
                }
                {
                  data.o_take_type === 3 && data.take_id &&
                  (data.o_order_status == 42 || data.o_order_status == 5 || data.o_order_status == 8) &&
                  <View className='item'>
                    <Text>配送方式</Text>
                    <Text>
                      {
                        data.take_id === 1 ? '商家配送' : '第三方配送'
                      }
                    </Text>
                  </View>
                }
                {
                  data.o_pay_type !== 0 &&
                  <View className='item'>
                    <Text>支付方式</Text>
                    <Text>
                      {
                        data.o_pay_type === 1 ? '微信支付' : '余额支付'
                      }
                    </Text>
                  </View>
                }
                <View className='item'>
                  <Text>订单号</Text>
                  <Text>{data.o_order_no}</Text>
                </View>
                <View className='memo item'>
                  <Text className='label'>备注：</Text>
                  {data.o_remark}
                </View>
              </View>

              <View className='gap'>
                <View className='line'/>
              </View>

              <View className='footer'>
                <Text>总计</Text>
                <View className={classnames('price', 'theme-c-' + theme)}>
                  <Text className='yen'>&yen;</Text>
                  <Text className='font-xin-bold'>{data.o_pay_amount}</Text>
                </View>
              </View>

              <View className='bottom-shadow' />
              <View className='tooth-border'/>
            </View>
          </View>
        }

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

        {
          this.$router.params.from === '1' &&
          <BackToHome />
        }

        <CouponModal
          show={isShowCoupon} coupon={curCoupon}
          onClose={this.couponClose}
        />

      </Block>
    )
  }
}

export default OrderDetail
