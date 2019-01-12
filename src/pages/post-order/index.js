import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Input, Textarea} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'

import PickTime from '../../components/pick-time'
import ChooseAddress from '../../components/choose-address'
import {baseUrl} from '../../config'

import './index.less'


@connect(({common, cart, shop}) => ({...common, ...cart, ...shop}))
class Order extends Component {

  config = {
    navigationBarTitleText: '提交订单'
  }

  state = {
    orderType: 1,  // 1: 自取   3：外卖
    takeType: 1,
    s_take: [1, 2, 3],

    isShowPicker: false,
    isShowAddress: false,

    store: {},
    couponList: [],
    userAddress: [],
    amount: '',
    isShowTextarea: false,
    memo: '',
    reserveTime: [],
    dayTimeIndexs: [0, 0],
    userPhoneNum: '',
    selectedAddress: null,
  }

  componentWillMount() {
    this.getPreOrderInfo()
  }

  changeOrderType = orderType => {
    if (this.state.s_take.indexOf(orderType) === -1) return

    this.setState({orderType})

    this.getPreOrderInfo(orderType)
  }

  changeTakeType = takeType => {
    this.setState({takeType})
  }

  closeTimePicker = (dayTimeIndexs) => {
    this.setState({
      isShowPicker: false,
      dayTimeIndexs: dayTimeIndexs || [0, 0]
    })

  }

  getPreOrderInfo = (take_type) => {
    const {carts, localInfo} = this.props

    const goods = carts[this.$router.params.store_id].map(cart => {
      let {g_id, num, send_goods} = cart
      let g_property = [], optional = []

      // if (cart.propertyTagIndex) {
      //   cart.property.forEach((item, i) => {
      //     g_property.push(item.list_name[cart.propertyTagIndex[i]])
      //   })
      // }
      if (cart.optionalTagIndex) {
        cart.optional.forEach((item, i) => {
          optional.push({
            parent_id: item.parent_id,
            list: {
              [item.list[cart.optionalTagIndex[i]].gn_id]: {
                gn_id: item.list[cart.optionalTagIndex[i]].gn_id,
                gn_num: item.list[cart.optionalTagIndex[i]].gn_num,
              }
            }
          })
        })
      }

      return {g_id, num, send_goods, g_property, optional}
    })

    this.props.dispatch({
      type: 'order/getPreOrderInfo',
      payload: {
        store_id: this.$router.params.store_id,
        goods,
        lat: localInfo.latitude,
        lng: localInfo.longitude,
        take_type
      }
    }).then(({store, couponList, userAddress, amount}) => {
      this.setState({
        store, couponList, userAddress, amount,
        s_take: store.s_take.map(v => +v)
      })
    })
  }

  handleScroll = e => {
    const top = e.detail.scrollTop
    this.setState({isShowTextarea: top >= 35})
  }

  handleMemoChange = e => {
    this.setState({memo: e.target.value})
    console.log(e)
  }

  showAddress = () => {
    this.setState({isShowAddress: true})
  }

  hideAddress = (address) => {
    this.setState({
      isShowAddress: false,
      selectedAddress: address ? address : this.state.selectedAddress
    })
  }

  autoInputMobile = (e) => {
    const { encryptedData, iv } = e.detail
    this.props.dispatch({
      type: 'common/getUserMobile',
      payload: {
        encryptedData, iv
      }
    }).then(res => {
      this.setState({userPhoneNum: res})
    })
  }

  phoneNumInput = e => {
    this.setState({userPhoneNum: e.target.value})
  }


  chooseReserveTime = () => {
    const {localInfo} = this.props

    this.props.dispatch({
      type: 'order/getReserveTime',
      payload: {
        store_id: this.$router.params.store_id,
        lat: localInfo.latitude,
        lng: localInfo.longitude,
        amount: 24
      }
    }).then(res => {
      this.setState({
        reserveTime: res,
        isShowPicker: true
      })
    })
  }

  render() {
    const {theme, carts} = this.props
    const {orderType, isShowPicker, takeType, store, memo, s_take,
      couponList, userAddress, amount, isShowTextarea, reserveTime,
      dayTimeIndexs, isShowAddress, userPhoneNum, selectedAddress} = this.state
    const goods = carts[this.$router.params.store_id] || []

    const isIphoneX = !!(this.props.systemInfo.model &&
      this.props.systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    const useAddress = selectedAddress || (userAddress.length >0 ? userAddress.find(item => item.optional) : [])

    return (
      <View className='post-order'>
        <ScrollView
          scrollY={!isShowPicker} className={classnames('scroll-view', isIphoneX ? 'iphonex' : '')}
          onScroll={this.handleScroll}
        >
          <View className='content'>
            <View className='order-type'>
              <View className='tab'>
                <View
                  className={classnames('wrap', orderType !== 1 ? 'un-active' : 'theme-c-' + theme,
                    s_take.indexOf(1) > -1 ? '' : 'disabled')}
                  onClick={this.changeOrderType.bind(this, 1)}>
                  <Image src={require('../../images/icon-shop.png')}/>
                  <Text>到店取餐</Text>
                </View>
                <View
                  className={classnames('wrap wrap-2', orderType !== 3 ? 'un-active' : 'theme-c-' + theme,
                    s_take.indexOf(3) > -1 ? '' : 'disabled')}
                  onClick={this.changeOrderType.bind(this, 3)}>
                  <Image src={require('../../images/icon-bike.png')}/>
                  <Text>外卖配送</Text>
                </View>

              </View>
              {
                orderType === 1 &&
                <View className='info'>
                  <View className='name'>{store.s_area ? store.s_area + store.s_address : ''}</View>
                  <View className='time' onClick={this.chooseReserveTime}>
                    <Text>自取时间</Text>
                    <View>
                      {
                        reserveTime.length > 0 ?
                        (
                          (dayTimeIndexs[0] === 0 ? '' : reserveTime[dayTimeIndexs[0]].title)
                          + reserveTime[dayTimeIndexs[0]].time[dayTimeIndexs[1]].time
                        ) : ''
                      }
                      <Image src={require('../../images/icon-down.png')}/>
                    </View>
                  </View>
                  <View className='mobile'>
                    <Image src={require('../../images/icon-mobile.png')}/>
                    <Input value={userPhoneNum} onInput={this.phoneNumInput} placeholder='请输入手机号'/>
                    <Button open-type="getPhoneNumber" onGetphonenumber={this.autoInputMobile}>
                      <Text className={'theme-c-' + theme}>自动填写</Text>
                    </Button>

                  </View>
                  <View className='btn-box'>
                    <Button
                      className={takeType === 1 ? 'active theme-grad-bg-' + theme : ''}
                      onClick={this.changeTakeType.bind(this, 1)}
                    >
                      <Image
                        className='icon-drink'
                        src={takeType === 1 ? require('../../images/icon-drink-active.png') : require('../../images/icon-drink.png')}
                      />
                      堂食
                    </Button>
                    <Button
                      className={takeType === 3 ? 'active theme-grad-bg-' + theme : ''}
                      onClick={this.changeTakeType.bind(this, 3)}
                    >
                      <Image
                        className='icon-drink'
                        src={takeType === 3 ? require('../../images/icon-bag-active.png') : require('../../images/icon-bag.png')}
                      />
                      外带
                    </Button>
                  </View>
                </View>
              }
              {
                orderType === 3 &&
                <View className='info'>
                  <View className='address' onClick={this.showAddress.bind(this, true)}>
                    {
                      !useAddress.address &&
                      <View className='address-none'>
                        选择收货地址
                        <AtIcon value='chevron-right' size='16'/>
                      </View>
                    }
                    {
                      useAddress.address &&
                      <View className='address-msg'>
                        <View className='left'>
                          <View className='desc'>{useAddress.address + ' ' + useAddress.address_detail}</View>
                          <View className='user'>
                            <Text>{useAddress.user_name}</Text>
                            <Text>{useAddress.user_telephone}</Text>
                          </View>
                        </View>
                        <View className='right'>
                          <AtIcon value='chevron-right' size='22'/>
                        </View>
                      </View>
                    }
                  </View>
                  <View className='time' onClick={this.chooseReserveTime}>
                    <Text>自取时间</Text>
                    <View>
                      {
                        reserveTime.length > 0 ?
                          (
                            (dayTimeIndexs[0] === 0 ? '' : reserveTime[dayTimeIndexs[0]].title)
                            + reserveTime[dayTimeIndexs[0]].time[dayTimeIndexs[1]].time
                          ) : ''
                      }
                      <Image src={require('../../images/icon-down.png')}/>
                    </View>
                  </View>
                </View>
              }
            </View>

            <View className='block'>
              <View className='title'>订单详情</View>
              <View className='block-content'>
                {
                  goods.map((good, index) => (
                    <View className='good' key={index}>
                      <Image className='pic' src={baseUrl + good.g_image_100} />
                      <View className='info'>
                        <View className='name'>
                          {good.g_title}
                          {
                            good.property && <Text>/</Text>
                          }
                          {
                            good.property &&
                            good.property.map((prop, i) => (
                              <Text key={i}>
                                {prop.list_name[good.propertyTagIndex[i]]}
                                {i !== good.property.length -1 ? '+' : ''}
                              </Text>
                            ))
                          }
                        </View>
                        <View className='standard'>
                          {
                            good.optional &&
                            good.optional.map((opt, i) => (
                              <Text key={i}>
                                {opt.list[good.optionalTagIndex[i]].gn_name}
                                {i !== good.optional.length -1 ? '+' : ''}
                              </Text>
                            ))
                          }
                        </View>
                      </View>
                      <Text className='num'>x{good.num}</Text>
                      <View className='price'>
                        {
                          good.g_original_price &&
                          <View className='pre'>
                            <Text>&yen;</Text>
                            {good.g_original_price}
                          </View>
                        }
                        <View className='cur'>
                          <Text>&yen;</Text>
                          {
                            (+good.g_price + (
                              good.optional ?
                                good.optional.reduce((total, item, i) => {
                                  return total += +item.list[good.optionalTagIndex[i]].gn_price
                                }, 0)
                                : 0
                            )).toFixed(2)
                          }
                        </View>
                      </View>
                    </View>
                  ))
                }

                {
                  takeType === 3 &&
                  <View className="pack-fee">
                    <Text>打包费</Text>
                    <View className='price'>
                      <Text>&yen;</Text>{store.s_take_money}
                    </View>
                  </View>
                }

                <View className='ticket'>
                  <View>
                    <Image src={require('../../images/icon-ticket.png')}/>
                    <Text>优惠券</Text>
                  </View>
                  <View className='handle'>
                    {
                      couponList.length > 0 ? couponList[0].uc_name : '暂无可用'
                    }
                    <AtIcon value='chevron-right' size='16'/>
                  </View>
                </View>
                <View className="subtotal">
                  共<Text className={'theme-c-' + theme}>{goods.length}</Text> 个商品，小计
                  <Text className={classnames('price', 'theme-c-' + theme)}><Text>&yen;</Text>
                    {
                      (goods.reduce((total, good) => {
                        let price = good.g_price * good.num
                        good.optional && (price +=
                          good.optional.reduce((t, item, i) => {
                            return t += +item.list[good.optionalTagIndex[i]].gn_price * good.num
                          }, 0))
                        good.num && (total += +price)
                        return total
                      }, 0)).toFixed(2)
                    }
                  </Text>
                </View>
              </View>
            </View>

            <View className='block'>
              <View className='title'>备注</View>
              <View className='block-content memo'>
                {
                  isShowTextarea &&
                  <Textarea
                    className='textarea' maxlength={30} value={memo}
                    onInput={this.handleMemoChange}
                    placeholderClass='textarea-placeholder'
                    placeholder='饮品中规格可参阅订单详情中的显示，若有其它要求,请说明。'
                  />
                }
                <Text>{memo.length}/30个字</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className={classnames('footer', isIphoneX ? 'iphonex' : '')}>
          <View className='price'>
            <View className='discount'>
              已优惠￥
              {
                couponList.reduce((total, item) => {
                  return total += +item.uc_price
                }, 0)
              }
            </View>
            <View className='total'>
              合计￥
              <Text>{amount}</Text>
            </View>
          </View>
          <Button className={'theme-grad-bg-' + theme}>去支付</Button>
        </View>

        <PickTime show={isShowPicker} reserveTime={reserveTime} theme={theme} onClose={this.closeTimePicker}/>

        <ChooseAddress show={isShowAddress} address={userAddress} theme={theme} onClose={this.hideAddress} />

      </View>
    )
  }
}

export default Order
