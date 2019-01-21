import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Block, Map, Image, CoverView, CoverImage, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './index.less'
import {orderTypes, outOrderTypes, baseUrl} from '../../config'
import ConfirmModal from '../../components/confirm-modal'

@connect(({common}) => ({
  ...common
}))
class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情',
    disableScroll: true
  }

  state = {
    data: {
      o_order_status: ''
    },
    isShowCancelWarn: false,
    markers: []
  }

  componentWillMount() {

    this.getOrderDetail()
  }

  getOrderDetail = () => {
    const {b_logo} = this.props
    this.props.dispatch({
      type: 'order/getOrderDetail',
      payload: {
        id: this.$router.params.id
      }
    }).then((data) => {
      this.setState({
        data,
        markers: [{
          iconPath: baseUrl + b_logo,
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
        }]
      })
    })
  }

  showOrHideWarn = bool => {
    this.setState({isShowCancelWarn: bool})
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
      title: '下单成功'
    })

    this.getOrderDetail()
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
    console.log(phoneNumber)
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
    })
  }

  render() {
    const {theme, systemInfo} = this.props
    const isIphoneX = !!(systemInfo.model && systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    const {data, isShowCancelWarn, markers} = this.state

    return (
      <Block>
        {
          !!data.o_order_status &&
          <ScrollView scrollY className={classnames('order-detail', isIphoneX ? 'iphonex' : '')}>

            {
              data.o_take_type === 3 && data.o_order_status !== 5
              && data.o_order_status !== 6 && data.o_order_status !== 7
              &&
              <Block>
                <Map
                  className='map'
                  latitude={data.s_address_lat}
                  longitude={data.s_address_lng}
                  markers={markers}
                />

                {
                  data.o_order_status === 42 &&
                  <CoverView className='map-tip'>
                    <CoverImage src={require('../../images/icon-bike.png')} />
                   <CoverView className='text'>
                     {
                       `当前由${data.take_id === 1 ? '商家' : '骑手'}配送，请留意骑手来电`
                     }
                   </CoverView>
                  </CoverView>
                }
                <View className='out-status'>
                  <View className='info'>
                    <View className={classnames('status-text', 'theme-c-' + theme)}>
                      {outOrderTypes[data.o_order_status]}
                    </View>
                    {
                      data.take_status !== 9 && data.take_status !== 10 &&
                      <View className='tip'>
                        {
                          {
                            1: '当前尚未下单，请尽快支付',
                            2: '商家确认中，请您耐心等待',
                            31: '正在尽快制作，请您耐心等待',
                            32: '正在尽快制作，请您耐心等待',
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
                    <Image src={require('../../images/icon-contact.png')} mode='widthFix' />
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
              || (data.o_order_status === 5 || data.o_order_status ===6 || data.o_order_status === 7)) &&
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
                    data.o_order_status === 5 ? '感谢光临 祝您用餐愉快！' : ''
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
                    <Text>
                      {data.o_refund_remark}
                      {
                        data.o_order_status === 6 ? '\n ' + '退款成功：预计1-7工作日到账' : ''
                      }
                    </Text>
                  }
                </View>
                {
                  (data.o_order_status === 5 || data.o_order_status === 6 || data.o_order_status === 7) &&
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
                          <Text className='pre'>&yen;{good.od_original_price}</Text>
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

                <View className='other'>
                  <Text>打包费</Text>
                  <Text className='price'><Text>&yen; </Text>{data.o_take_money}</Text>
                </View>
                {
                  data.o_coupon_name &&
                  <View className='other'>
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
                <View className='item'>
                  <Text>联系方式</Text>
                  <Text>{data.o_contact_mobile}</Text>
                </View>
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
                  <Text>备注：</Text>
                  {data.o_remark}
                </View>
              </View>

              <View className='gap'>
                <View className='line'/>
              </View>

              <View className='footer'>
                <Text>总计</Text>
                <View className={classnames('price', 'theme-c-' + theme)}>
                  <Text>&yen;</Text>
                  {data.o_pay_amount}
                </View>
              </View>

              <View className='tooth-border'/>
            </View>
          </ScrollView>
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

      </Block>
    )
  }
}

export default OrderDetail
