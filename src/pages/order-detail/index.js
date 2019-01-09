import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Block, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'

import classnames from 'classnames'
import './index.less'
import {orderTypes} from '../../config'
import ConfirmModal from '../../components/confirm-modal'

@connect(({common}) => ({
  ...common
}))
class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情'
  }

  state = {
    data: {
      o_order_status: ''
    },
    isShowCancelWarn: false
  }

  componentWillMount() {

    this.getOrderDetail()
  }

  getOrderDetail = () => {
    this.props.dispatch({
      type: 'post-order/getOrderDetail',
      payload: {
        id: this.$router.params.id || "29062"
      }
    }).then((data) => {
      this.setState({data})
    })
  }

  showOrHideWarn = bool => {
    this.setState({isShowCancelWarn: bool})
  }

  render() {
    const {theme, systemInfo} = this.props
    const isIphoneX = !!(systemInfo.model && systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    const {data, isShowCancelWarn} = this.state

    return (
      <ScrollView scrollY>
        {
          !!data.o_order_status &&
          <View className={classnames('post-order-detail', isIphoneX ? 'iphonex' : '')}>
            <View className="status">
              <View className={classnames('status-text', 'theme-c-' + theme)}>{orderTypes[data.o_order_status.toString()[0]]}</View>
              <View className="status-memo">
                {
                  data.o_order_status === 1 ? '当前尚未下单，请尽快支付' : ''
                }

                {
                  data.o_order_status === 2 ? '商家确认中，请您耐心等待' : ''
                }

                {
                  (data.o_order_status.toString()[0] === '3' || data.o_order_status.toString()[0] === '4') &&
                  <Block>
                    <View className='take-meal'>取餐号: <Text className={classnames('theme-c-' + theme)}>{data.o_take_no}</Text></View>
                    <View>{data.status_remark}</View>
                  </Block>
                }

                {
                  (data.o_order_status === 6 || data.o_order_status === 7) &&
                  <Text>
                    {data.o_refund_remark}
                    {
                      data.o_order_status === 7 ? '\n ' + '退款成功：预计1-7工作日到账' : ''
                    }
                  </Text>
                }
              </View>
              {
                (data.o_order_status === 5 || data.o_order_status === 6 || data.o_order_status === 7) &&
                <Button className={'theme-grad-bg-' + theme}>再来一单</Button>
              }

              {
                data.o_order_status === 2 &&
                <Button onClick={this.showOrHideWarn.bind(this, true)} className={'theme-grad-bg-' + theme}>取消订单</Button>
              }

            </View>

            {
              data.o_order_status === 1 &&
              <View className="btn">
                <Button className="ok">立即支付</Button>
                <Button className="no">取消订单</Button>
              </View>
            }

            <View className='order-info'>
              <View className="header">
                <View>
                  <View className="name">{data.o_store_name}</View>
                  <View>{data.o_address}</View>
                </View>
                <View>
                  <View>取餐时间</View>
                  <View>{data.o_reserve_time}</View>
                </View>
              </View>

              <View className="gap">
                <View className="line"/>
              </View>

              <View className="content">
                {
                  data.goods.map((good, index) => (
                    <View className="good" key={index}>
                      <View className="main">
                        <View className='name'>{good.od_title}</View>
                        <View className="price">
                          <Text className="pre">&yen;{good.od_original_price}</Text>
                          <Text className="cur">
                            <Text>&yen;</Text>
                            {good.od_price}
                          </Text>
                        </View>
                      </View>
                      <View className="extra">
                        <View className="name">{good.od_norm_str}</View>
                        <View className="num">x{good.od_num}</View>
                      </View>
                    </View>
                  ))
                }

                <View className="other">
                  <Text>打包费</Text>
                  <Text className='price'><Text>&yen; </Text>{data.o_take_money}</Text>
                </View>
                <View className="other">
                  <Text>{data.o_coupon_name}</Text>
                  <Text className={classnames('price', 'theme-c-' + theme)}><Text>-&yen; </Text>{data.o_coupon_amount}</Text>
                </View>

              </View>

              <View className="info">
                <View className="item">
                  <Text>下单时间</Text>
                  <Text>{data.o_create_time}</Text>
                </View>
                <View className="item">
                  <Text>联系方式</Text>
                  <Text>{data.o_contact_mobile}</Text>
                </View>
                <View className="item">
                  <Text>支付方式</Text>
                  <Text>
                    {
                      data.o_pay_type === 1 ? '微信支付' : '余额支付'
                    }
                  </Text>
                </View>
                <View className="item">
                  <Text>订单号</Text>
                  <Text>{data.o_order_no}</Text>
                </View>
                <View className="memo item">
                  <Text>备注：</Text>
                  {data.o_remark}
                </View>
              </View>

              <View className="gap">
                <View className="line"/>
              </View>

              <View className="footer">
                <Text>总计</Text>
                <View className={classnames('price', 'theme-c-' + theme)}>
                  <Text>&yen;</Text>
                  {data.o_pay_amount}
                </View>
              </View>

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
          onOk={this.showOrHideWarn.bind(this, false)}
        >
          确定要取消吗
        </ConfirmModal>

      </ScrollView>
    )
  }
}

export default OrderDetail
