import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Input, Textarea, Block} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon, AtToast} from 'taro-ui'
import classnames from 'classnames'

import IdButton from '../../components/id-button'
import PickTime from '../../components/pick-time'
import ChooseAddress from '../../components/choose-address'
import Copyright from '../../components/copyright'
import {baseUrl} from '../../config'

import './index.less'


@connect(({common, cart, shop, order}) => ({...common, ...cart, ...shop, ...order}))
class Order extends Component {

  config = {
    navigationBarTitleText: '提交订单',
    // disableScroll: true,
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
    // isShowTextarea: false,
    memo: '',
    reserveTime: [],
    dayIndex: 0,
    timeIndex: 0,
    userPhoneNum: '',
    selectedAddress: {},
    alertPhone: false,
    alertPhoneText: '',
    goods: [],
    isFullPrice: true,
    fullPrice: null
  }

  componentWillMount() {
    let goods = this.props.carts[this.$router.params.store_id] || []

    if (this.$router.params.type) {
      goods = goods.filter(item => item.fs_id)
    }

    this.setState({
      goods
    })

    this.initPage()
  }

  componentDidShow() {
    if (this.props.refreshAddress) {
      this.getPreOrderInfo(this.state.orderType)

      this.props.dispatch({
        type: 'order/setKeyRefreshAddress',
        payload: {
          refreshAddress: false
        }
      })
    }
  }

  toBack = () => {
    Taro.navigateBack()
  }

  changeOrderType = async orderType => {
    const s_take = this.state.s_take

    if (orderType === 1 && s_take.indexOf(1) === -1 && s_take.indexOf(2) === -1) return
    if (orderType === 3 && s_take.indexOf(3) === -1) return

    Taro.showLoading()
    this.initPage(orderType === 3 ? 3 : this.state.takeType).then(() => {
      this.setState({orderType})
      Taro.hideLoading()
    })
  }

  initPage = async (orderType) => {
    const {amount, couponList} = await this.getPreOrderInfo(orderType)

    this.getReserveTime(amount, orderType)

    const index = couponList.findIndex(item => item.available) > -1 ?
      couponList.findIndex(item => item.available) : -1

    return this.props.dispatch({
      type: 'order/setCouponIndex',
      payload: {
        curCouponIndex: index
      }
    })
  }

  changeTakeType = takeType => {
    const s_take = this.state.store.s_take.map(v => +v)
    if (s_take.indexOf(takeType) === -1) return
    this.setState({takeType})
  }

  closeTimePicker = () => {
    this.setState({
      isShowPicker: false,
    })

  }

  getPreOrderInfo = (take_type) => {
    const {carts, localInfo} = this.props

    const goods = carts[this.$router.params.store_id].map(cart => {
      let {g_id, num, send_goods, fs_id} = cart
      let g_property = [], optional = []

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

      if (cart.optionalnumstr) {
        optional = cart.optional.reduce((total, op) => {
          let cur = {
            parent_id: op.parent_id,
            list: {}
          }
          op.list.forEach((gd) => {
            if (gd.num) {
              cur.list[gd.gn_id] = {
                gn_id: gd.gn_id,
                gn_num: gd.num
              }
            }
          })
          total.push(cur)
          return total
        }, [])

      }

      return {g_id, num, send_goods, g_property, optional, full_send_id: fs_id}
    })

    return this.props.dispatch({
      type: 'order/getPreOrderInfo',
      payload: {
        store_id: this.$router.params.store_id,
        goods,
        lat: localInfo.latitude,
        lng: localInfo.longitude,
        take_type
      }
    }).then((res) => {
      if (!res.store) {
        Taro.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
      const {store, couponList, userAddress, amount, contact_mobile} = res
      const s_take = store.s_take.map(v => +v)
      this.setState({
        store, couponList, userAddress, amount,
        userPhoneNum: contact_mobile,
        s_take: store.s_take.map(v => +v)
      }, this.calcTextareaRect)

      if (take_type) {
        this.setState({orderType: take_type})
      } else {
        if (s_take.indexOf(1) > -1 || s_take.indexOf(2) > -1) {
          this.setState({orderType: 1})
          if (s_take.indexOf(1) === -1) {
            this.setState({takeType: 2})
          }
        } else {
          this.setState({orderType: 3})
        }
      }

      if (userAddress.length === 0) {
        this.setState({selectedAddress: {}})
      } else {
        const useAddress = userAddress.find(item => item.optional) || []
        this.setState({selectedAddress: useAddress || {}})
      }
      return {amount, couponList}
    })
  }

  calcTextareaRect = () => {
    const Query = Taro.createSelectorQuery()
    Query
      .select('.footer')
      .boundingClientRect(rect => {
        this.footerScreenTop = rect.top
        this.footerHeight = rect.height
      })
      .exec()
  }

  handleScroll = () => {
    // let Query = Taro.createSelectorQuery()
    // Query
    //   .select('.memo')
    //   .boundingClientRect(rect => {
    //     let {top, height} = rect
    //
    //     this.setState({
    //       isShowTextarea: !(top + height - 30 > this.footerScreenTop) || (top + 50 < this.footerHeight)
    //     })
    //   })
    //   .exec()
  }

  onPageScroll () {
    // let Query = Taro.createSelectorQuery()
    // Query
    //   .select('.memo')
    //   .boundingClientRect(rect => {
    //     let {top, height} = rect
    //
    //     this.setState({
    //       isShowTextarea: !(top + height - 30 > this.footerScreenTop) || (top + 50 < this.footerHeight)
    //     })
    //   })
    //   .exec()
  }

  handleMemoChange = e => {
    this.setState({memo: e.target.value})
  }

  showAddress = () => {
    this.setState({isShowAddress: true})
  }

  hideAddress = (address) => {
    if (address && (this.state.selectedAddress.da_id !== address.da_id)) {
      Taro.showToast({
        title: '由于配送地址/时间变化，您的配送费也发生了变化',
        icon: 'none'
      })
    }
    this.setState({
      isShowAddress: false,
      selectedAddress: address ? address : this.state.selectedAddress
    })
  }

  autoInputMobile = (e) => {
    if (!e.detail.encryptedData) return

    const {encryptedData, iv} = e.detail
    this.props.dispatch({
      type: 'common/getUserMobile',
      payload: {
        encryptedData, iv
      }
    }).then(res => {
      if (typeof res === 'number' || typeof res === 'string') {
        this.setState({userPhoneNum: res})
      } else {
        Taro.showToast({
          title: '获取手机号失败，请重试或手动填写！',
          icon: 'none'
        })
      }
    })
  }

  phoneNumInput = e => {
    this.setState({userPhoneNum: e.target.value})
  }


  chooseReserveTime = () => {
    if (this.state.orderType === 3 && this.state.reserveTime.length === 0) return
    this.setState({isShowPicker: true})
  }

  getReserveTime = (amount, orderType) => {
    const {localInfo} = this.props
    return this.props.dispatch({
      type: 'order/getReserveTime',
      payload: {
        store_id: this.$router.params.store_id,
        lat: localInfo.latitude,
        lng: localInfo.longitude,
        take_type: orderType,
        amount
      }
    }).then(res => {
      if (Array.isArray(res)) {
        this.setState({
          reserveTime: res.filter(item => item.time.length > 0),
        })
      } else {
        this.setState({
          reserveTime: [],
        })
        if (+res.code === 301) {
          this.setState({
            isFullPrice: false,
            fullPrice: +res.data.price
          })
        }
      }

      return res
    })
  }

  requestSaveOrder = () => {

    const {carts, curCouponIndex} = this.props

    const {orderType, takeType, userPhoneNum, reserveTime, memo, couponList,
      dayIndex, timeIndex, selectedAddress} = this.state

    const goods = carts[this.$router.params.store_id].map(cart => {
      let {g_id, num, send_goods, fs_id} = cart
      let g_property = [], optional = [], g_property_array = []

      if (cart.propertyTagIndex) {
        cart.property.forEach((item, i) => {
          g_property.push(item.list_name[cart.propertyTagIndex[i]])

          g_property_array.push({
            name: item.name,
            list_name: item.list_name[cart.optionalTagIndex[i]]
          })
        })
      }

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


      if (cart.optionalnumstr) {
        optional = cart.optional.reduce((total, op) => {
          let cur = {
            parent_id: op.parent_id,
            list: {}
          }
          op.list.forEach((gd) => {
            if (gd.num) {
              cur.list[gd.gn_id] = {
                gn_id: gd.gn_id,
                gn_num: gd.num
              }
            }
          })
          total.push(cur)
          return total
        }, [])

      }

      return {g_id, num, send_goods, g_property, optional, full_send_id: fs_id, g_property_array}
    })

    return this.props.dispatch({
      type: 'order/requestSaveOrder',
      payload: {
        store_id: this.$router.params.store_id,
        take_type: orderType === 3 ? 3 : (takeType === 1 ? 1 : 2),
        contact_mobile: userPhoneNum,
        o_reserve_time: reserveTime[dayIndex].date + ' ' + reserveTime[dayIndex].time[timeIndex].time,
        o_remark: memo,
        goods,
        address_id: this.state.selectedAddress.da_id,
        coupon_id: curCouponIndex !== -1 && couponList.length > 0 && couponList[curCouponIndex].uc_id
      }
    })
  }

  requestPayOrder = (order_id) => {
    return this.props.dispatch({
      type: 'order/requestPayOrder',
      payload: {
        store_id: this.$router.params.store_id,
        order_id
      }
    })
  }

  stepPay = async () => {

    const {userPhoneNum, orderType} = this.state
    const store_id = this.$router.params.store_id

    if (orderType !== 3) {
      if (!userPhoneNum) {
        this.setState({
          alertPhone: true,
          alertPhoneText: '你好像忘记告诉我手机号码哦~'
        })

        return
      } else if (!/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/.test(userPhoneNum)) {
        this.setState({
          alertPhone: true,
          alertPhoneText: '手机号码格式不正确哦~'
        })

        return
      }
    }

    const response = await this.requestSaveOrder()

    if (!response) {
      return
    } else if (+response.code === 500) {
      Taro.showToast({
        title: response.message,
        icon: 'none'
      })
      return
    }

    const {pay, order_id} = response

    if (order_id) {
      this.props.dispatch({
        type: 'cart/clearOneCart',
        payload: {
          id: store_id
        }
      })
    }

    if (!pay) {
      const res = await this.requestPayOrder(order_id)

      if (+res.code === 500) {
        Taro.showToast({
          title: res.message,
          icon: 'none'
        })
      }
      const isPayed = await Taro.requestPayment({
        ...res,
        timeStamp: res.timestamp
      }).then(r => {
        console.log(r)
        return true
      }).catch(err => {
        console.log(err)
        return false
      })

      Taro.showLoading({mask: true})

      if (isPayed) {
        await this.props.dispatch({
          type: 'order/getOrderPayStatus',
          payload: {
            store_id,
            order_id
          }
        })

        Taro.hideLoading()

        Taro.showToast({
          title: '下单成功',
          mask: true
        })
      } else {
        Taro.showToast({
          title: '您已取消支付',
          icon: 'none',
          mask: true
        })
      }

      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/order-detail/index?id=' + order_id + '&store_id=' + store_id
        })
      }, 2000)

    } else {
      Taro.showToast({
        title: '下单成功',
        mask: true
      })
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/order-detail/index?id=' + order_id + '&store_id=' + store_id
        })
      }, 2000)
    }
  }

  alertPhoneClose = () => {
    this.setState({
      alertPhone: false,
    })
  }

  toChooseCouponPage = () => {
    const {couponList} = this.state

    this.props.dispatch({
      type: 'order/setCouponOptions',
      payload: {
        couponOptions: couponList
      }
    })

    Taro.navigateTo({
      url: '/pages/choose-coupon/index'
    })
  }

  changeTime = (dayIndex, timeIndex) => {
    this.setState({
      dayIndex, timeIndex,
      isShowPicker: false
    })
  }

  render() {
    const {theme, curCouponIndex} = this.props
    const {
      orderType, isShowPicker, takeType, store, memo, s_take,
      couponList, userAddress, amount, reserveTime,
      isShowAddress, userPhoneNum, selectedAddress,
      alertPhone, alertPhoneText, goods, dayIndex, timeIndex, isFullPrice,
      fullPrice
    } = this.state

    const isIphoneX = !!(this.props.systemInfo.model &&
      this.props.systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    // const useAddress = selectedAddress || (userAddress.length > 0 ? userAddress.find(item => item.optional) : [])
    //
    // this.useAddress = useAddress

    let totalAmout = +amount

    if (orderType === 3) {
      totalAmout += +store.s_take_money

      if (reserveTime.length) {
        totalAmout += +reserveTime[dayIndex].time[timeIndex].price
      }
    }
    if (couponList[curCouponIndex] && couponList[curCouponIndex].uc_price) {
      totalAmout -= +couponList[curCouponIndex].uc_price

      totalAmout < 0 && (totalAmout = 0)
    }

    const noConponAmount = (+amount + +store.s_take_money
      + (orderType === 3 && reserveTime.length > 0 ?
        (
          +reserveTime[dayIndex].time[timeIndex].price
        ) : 0)).toFixed(2)

    const finalAmount =  (totalAmout + +store.s_take_money).toFixed(2)

    const availableCoupons = couponList.filter(item => item.available)
    return (
      theme && goods && goods.length > 0 &&
      <View className='post-order'>
        {/*<ScrollView onScroll={this.handleScroll}
          scrollY={!isShowPicker} className={classnames('scroll-view', isIphoneX ? 'iphonex' : '')}
        >

        </ScrollView>*/}


        <View className={classnames('wrap', isIphoneX ? 'iphonex' : '')}>
          <View className='content'>
            <View className='order-type'>
              <View className='tab'>
                <View
                  className={classnames('wrap', orderType !== 1 ? 'un-active' : 'theme-c-' + theme,
                    (s_take.indexOf(1) > -1 || s_take.indexOf(2) > -1) ? '' : 'disabled')}
                  onClick={this.changeOrderType.bind(this, 1)}>
                  <Image
                    src={orderType !== 1 ? require('../../images/icon-shop.png') : `${baseUrl}/static/addons/diancan/img/style/style_${theme}_1.png`}/>
                  <Text>
                    {
                      (s_take.indexOf(1) > -1 || s_take.indexOf(2) > -1) ? '到店取餐' : '暂不自取'
                    }
                  </Text>
                </View>
                <View
                  className={classnames('wrap wrap-2', orderType !== 3 ? 'un-active' : 'theme-c-' + theme,
                    s_take.indexOf(3) > -1 ? '' : 'disabled')}
                  onClick={this.changeOrderType.bind(this, 3)}>
                  <Image
                    src={orderType !== 3 ? require('../../images/icon-bike.png') : `${baseUrl}/static/addons/diancan/img/style/style_${theme}_4.png`}/>
                  <Text>
                    {
                      s_take.indexOf(3) > -1 ? '外卖配送' : '暂不配送'
                    }
                  </Text>
                </View>
                <View className='bg-fix' />
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
                            (dayIndex === 0 ? '' : reserveTime[dayIndex].title + ' ')
                            + ' ' + reserveTime[dayIndex].time[timeIndex].time
                          ) : ''
                      }
                      <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_3.png`}/>
                    </View>
                  </View>
                  <View className='mobile'>
                    <Image src={require('../../images/icon-mobile.png')}/>
                    <Input value={userPhoneNum} onInput={this.phoneNumInput} placeholder='请输入手机号' maxlength='15'/>
                    <Button open-type='getPhoneNumber' onGetphonenumber={this.autoInputMobile}>
                      <Text className={'theme-c-' + theme}>自动填写</Text>
                    </Button>

                  </View>
                  <View className='btn-box'>
                    <Button
                      className={takeType === 1 ? 'active theme-grad-bg-' + theme : ''}
                      onClick={this.changeTakeType.bind(this, 1)}
                    >
                      <Image
                        className='icon-drink' mode='widthFix'
                        src={takeType === 1 ? require('../../images/icon-drink-active.png') : require('../../images/icon-drink.png')}
                      />
                      堂食
                    </Button>
                    <Button
                      className={takeType === 2 ? 'active theme-grad-bg-' + theme : ''}
                      onClick={this.changeTakeType.bind(this, 2)}
                    >
                      <Image
                        className='icon-drink icon-bag' mode='widthFix'
                        src={takeType === 2 ? require('../../images/icon-bag-active.png') : require('../../images/icon-bag.png')}
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
                      !selectedAddress.address &&
                      <View className='address-none'>
                        选择收货地址
                        <AtIcon value='chevron-right' size='16'/>
                      </View>
                    }
                    {
                      selectedAddress.address &&
                      <View className='address-msg'>
                        <View className='left'>
                          <View className='desc'>{selectedAddress.address + ' ' + (selectedAddress.address_detail && selectedAddress.address_detail.split('|')[1])}</View>
                          <View className='user'>
                            <Text>{selectedAddress.user_name}</Text>
                            <Text>{selectedAddress.user_telephone}</Text>
                          </View>
                        </View>
                        <View className='right'>
                          <AtIcon value='chevron-right' size='22'/>
                        </View>
                      </View>
                    }
                  </View>
                  <View className='time' onClick={this.chooseReserveTime}>
                    <Text>外卖下单</Text>
                    <View>
                      {
                        reserveTime.length > 0 ?
                          (
                            (dayIndex === 0 ? '' : reserveTime[dayIndex].title)
                            + reserveTime[dayIndex].time[timeIndex].time
                          ) : ''
                      }
                      <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_3.png`}/>
                    </View>
                  </View>
                </View>
              }
            </View>

            <View className='block'>
              <View className='title'>订单详情</View>
              <View className='block-content'>
                {
                  goods.length > 0 &&
                  goods.map((good, index) => (
                    !good.optionalnumstr ?
                      <View className='good' key={index}>
                        <Image className='pic' src={baseUrl + (good.g_image_100 || good.g_image)}/>
                        <View className='info'>
                          <View className='name'>
                            {good.g_title}
                          </View>
                          <View className='standard'>
                            {
                              good.optional &&
                              good.optional.map((opt, i) => (
                                <Text key={i}>
                                  {opt.list[good.optionalTagIndex[i]].gn_name}
                                  {i !== good.optional.length - 1 ? '+' : ''}
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
                              ((+good.g_price || 0) + (
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
                      :
                      <View className='good'>
                        <Image className='pic' src={baseUrl + (good.g_image_100 || good.g_image)}/>
                        <View className='info'>
                          <View className='name'>
                            {good.g_title}
                          </View>
                          <View className='standard'>
                            {
                              good.fixed ?
                                good.fixed.reduce((total, fix) => {
                                  total.push(`${fix.gn_name}(${fix.gn_num}份)`)

                                  return total
                                }, []).join('+') : ''
                            }
                            {
                              good.fixed.length > 0 && good.optional.length > 0 ? '+' : ''
                            }
                            {
                              good.optional ?
                                good.optional.reduce((total, opt) => {

                                  let str = opt.list.reduce((t, o) => {
                                    o.num && (t.push(`${o.gn_name}(${o.num}份)`))
                                    return t
                                  }, [])

                                  total.push(str.join('+'))

                                  return total
                                }, []).join('+') : ''
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
                              good.total_price ? good.total_price.toFixed(2) : '0.00'
                            }
                          </View>
                        </View>
                      </View>
                  ))
                }

                {
                  (orderType === 3 || takeType === 2) &&
                  <View className='pack-fee'>
                    <Text>打包费</Text>
                    <View className='price'>
                      <Text>&yen;</Text>{store.s_take_money}
                    </View>
                  </View>
                }

                {
                  orderType === 3 && reserveTime.length > 0 &&
                  <View className='pack-fee'>
                    <Text>配送费</Text>
                    <View className='price'>
                      <Text>&yen;</Text>
                      {reserveTime[dayIndex].time[timeIndex].price}
                    </View>
                  </View>
                }

                <View className='ticket' onClick={this.toChooseCouponPage}>
                  <View>
                    <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_5.png`}/>
                    <Text>
                      {
                        (couponList.length === 0 || availableCoupons.length === 0 || curCouponIndex === -1) ?
                          '优惠券' : couponList[curCouponIndex].uc_name
                      }
                    </Text>
                  </View>
                  <View className={classnames('handle')}>
                    {
                      (couponList.length === 0 || availableCoupons.length === 0) ? '暂无可用'
                        : curCouponIndex === -1 ? '请选择' :
                        `-￥${couponList[curCouponIndex].uc_price}`
                    }
                    <AtIcon value='chevron-right' size='16'/>
                  </View>
                </View>
                <View className='subtotal'>
                  共<Text className={'theme-c-' + theme}>{goods.length}</Text> 个商品，小计
                  <Text className={classnames('price', 'theme-c-' + theme)}><Text>&yen;</Text>
                    {
                      finalAmount
                    }
                  </Text>
                </View>
              </View>
            </View>

            <View className='block'>
              <View className='title'>备注</View>
              <View className='memo'>
               {/* {
                  isShowTextarea && !isShowPicker && !isShowAddress ?
                    <Textarea
                      id='textarea'
                      className='textarea' maxlength={30} value={memo}
                      onInput={this.handleMemoChange}
                      placeholderClass='textarea-placeholder'
                      placeholder='饮品中规格可参阅订单详情中的显示，若有其它要求,请说明。'
                    />
                    :
                    <View className='alias'>
                      {
                        memo || '饮品中规格可参阅订单详情中的显示，若有其它要求,请说明。'
                      }
                    </View>
                }
*/}
                <View className='wrap'>
                  <Input
                    type='text'
                    onInput={this.handleMemoChange}
                    placeholderClass='textarea-placeholder'
                    placeholder='若有其它要求,请备注说明。'
                    maxlength={30}
                  />
                </View>

                <View className='font-num'>{memo.length}/30个字</View>
              </View>
            </View>
            <View style={{marginTop: '100px'}}>
              <Copyright />
            </View>
          </View>
        </View>
        <View className={classnames('footer', isIphoneX ? 'iphonex' : '')}>
          {
            (orderType !== 3 || isFullPrice) &&
            <Block>
              <View className='price'>
                <View className='discount'>
                  已优惠￥
                  {
                    (couponList[curCouponIndex].uc_price || 0) >= noConponAmount ? noConponAmount :
                      (couponList[curCouponIndex].uc_price || 0)
                  }
                </View>
                <View className='total'>
                  合计￥
                  <Text>
                    {finalAmount}
                  </Text>
                </View>
              </View>
              <IdButton className={'theme-grad-bg-' + theme} onClick={this.stepPay}>去支付</IdButton>

            </Block>
          }
          {
            orderType === 3 && !isFullPrice &&
            <Block>
              <View className='no-full'>
                {
                  `当前需满￥${fullPrice}起送，还差￥${(fullPrice - amount).toFixed(2)}`
                }
              </View>
              <IdButton className={'theme-grad-bg-' + theme} onClick={this.toBack}>去凑单</IdButton>

            </Block>
          }
        </View>

        {
          isIphoneX &&
          <View className='iphonex-footer-fix' />
        }

        <PickTime
          show={isShowPicker} reserveTime={reserveTime}
          theme={theme} onClose={this.closeTimePicker}
          dayIndex={dayIndex} timeIndex={timeIndex}
          showPrice={orderType === 3}
          onChangeTime={this.changeTime}
        />

        <ChooseAddress show={isShowAddress} address={userAddress} theme={theme} onClose={this.hideAddress}/>

        <AtToast
          isOpened={alertPhone} text={alertPhoneText} iconSize={40} duration={2000}
          icon='iphone' hasMask onClose={this.alertPhoneClose}
        />

      </View>
    )
  }
}

export default Order
