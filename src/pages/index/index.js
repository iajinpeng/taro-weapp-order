import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'

import { themeBtnShadowColors } from '../../config'
import Modal from '../../components/modal'
import CouponModal from '../../components/coupon-modal'
import Loading from '../../components/Loading'


import './index.less'


@connect(({common}) => ({...common}))
class Index extends Component {

  config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true
    // disableScroll: true
  }

  state = {
    activeBannerIndex: 0,
    user_full_num: 8,
    full_num: 8,
    isShowModal: false,
    home_banner: [],
    full_logo: '',
    full_logo_no: '',
    full_image: '',
    full_undefind: '',
    full_status: '',
    home_button: {},
    norm: [],
    isShowCoupon: false,
    curCoupon: {},
    isFirstShow: ''
  }

  componentDidMount () {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.getIndexInfo()
    if (this.state.isFirstShow === '') {
      this.setState({isFirstShow: true})
    } else {
      this.setState({isFirstShow: false})
    }
  }

  componentDidHide () { }

  onPullDownRefresh () {
    Taro.stopPullDownRefresh()
    this.props.dispatch({
      type: 'common/initRequest'
    })
    this.getIndexInfo()
  }

  getIndexInfo = () => {
    this.props.dispatch({
      type: 'common/requestHomeInfo',
      payload: {
        type: 1
      }
    }).then(res => {

      // if (res.under_review) {
      //   Taro.redirectTo({
      //     url: '/pages/alias/index'
      //   })
      //   return
      // }

      this.setState({
        ...res
      })

      this.coupon = res.coupon
      this.curCouponIndex = 0

      if (res.coupon.length > 0) {
        setTimeout(() => {
          this.setState({
            isShowCoupon: true,
            curCoupon: res.coupon[0],
          })
        }, 500)
      }
    })
  }

  showOrHideModal = (bool) => {
    this.setState({isShowModal: bool})
  }

  toChoosePage = (present) => {
    if (!this.props.userInfo.userInfo) return
    const url = present ? '/pages/choose-shop/index?type=' + present : '/pages/choose-shop/index'
    Taro.navigateTo({
      url
    })
  }

  toNoticePage = () => {
    Taro.navigateTo({
      url: '/pages/notice/index'
    })
  }

  toOrderListPage = () => {
    Taro.navigateTo({
      url: '/pages/order-list/index'
    })
  }

  toCouponPage = () => {
    Taro.navigateTo({
      url: '/pages/coupon/index'
    })
  }

  getedUserInfo = (res) => {
    if (this.props.userInfo.userInfo) return

    this.handleFetchUserInfo(res)

    this.toChoosePage()
  }

  presentInfo = res => {
    if (this.props.userInfo.userInfo) return

    this.handleFetchUserInfo(res)

    this.toChoosePage('present')
  }

  handleFetchUserInfo = (res) => {
    this.props.dispatch({
      type: 'common/setUserInfo',
      payload: res.detail
    })
    const { encryptedData, iv } = res.detail

    this.props.dispatch({
      type: 'common/postUserInfo',
      payload: {
        encryptedData, iv
      }
    })
  }

  handleBannerChange = e => {
    this.setState({activeBannerIndex: e.detail.current})
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

  calcHourZone = () => {
    let hour = new Date().getHours()

    if (hour < 6) {
      return '凌晨好';
    } else if (hour > 6 && hour < 9) {
      return '早上好';
    } else if (hour >= 9 && hour < 12) {
      return '上午好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '夜里好'
    }
  }

  render () {
    const {theme, userInfo} = this.props

    const baseUrl = this.props.ext.domain

    const { user_full_num, full_num, isShowModal, activeBannerIndex,
      home_banner, full_image, full_logo, full_logo_no, home_button,
      full_status, full_undefind, norm, isShowCoupon, isFirstShow,
      curCoupon} = this.state

    const totStarsArr = new Array(full_num);

    const isIphoneX = !!(this.props.systemInfo.model &&
      this.props.systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    return (
      home_banner && home_banner.banner ?
      <View className='index-page' style={{display: home_banner.banner ? 'block' : 'none'}}>
        <View className={classnames('icon-help-wrap', 'theme-c-' + theme)} onClick={this.toNoticePage}>
          <Text className='greed'>{this.calcHourZone()}!</Text>
          <AtIcon value='help' size='14' />
        </View>

        <View className='banner'>
          <Swiper
            circular autoplay={home_banner.auto_play != 0} onChange={this.handleBannerChange}
            interval={home_banner.auto_play * 1000}
          >
            {
              home_banner.banner.map((img, index) => (
                <SwiperItem className='swiper-item' key={index}>
                  <View>
                    <Image className='swiper-img' src={baseUrl + img.image} />
                  </View>
                </SwiperItem>
              ))
            }

          </Swiper>
        </View>
        <View className='banner-dot'>
          {
            home_banner.banner.map((img, index) => (
              <Text className={index == activeBannerIndex ? 'active theme-bg-' + theme : ''} key={index} />
            ))
          }
        </View>
        <Button
          className={classnames('do-btn', 'theme-grad-bg-' + theme)}
          style={{boxShadow: '0 40rpx 40rpx -30rpx ' + themeBtnShadowColors[theme]}}
          openType={userInfo.userInfo ? '' : 'getUserInfo'}
          onGetUserInfo={this.getedUserInfo}
          formType='submit'
          onClick={this.toChoosePage.bind(this, null)}
        >
          开始点餐</Button>

        <View className={classnames('icon-box clearfix', 'theme-c-' + theme, isIphoneX ? 'iphonex' : '')}>
          <View onClick={this.toOrderListPage}>
            <View>
              <Image src={baseUrl + home_button.order_image} />
              <Text>订单</Text>
            </View>
          </View>
          <View className='line'><View /></View>
          <View onClick={this.toCouponPage}>
            <View>
              <Image src={baseUrl + home_button.coupon_image} />
              <Text>优惠券</Text>
            </View>
          </View>
        </View>

        {
          full_status === 1 &&
          <View className='tips'>
            <View className='info'>
              <View className='title'>满单即送</View>
              <View className='count-box'>
                <View className={classnames('count', 'theme-c-' + theme)}>
                  <Text className='font-xin-normal'>{user_full_num}/{full_num}</Text>单
                </View>

                <Button
                  class={classnames('do', 'theme-grad-bg-' + theme)}
                  style={{display: (user_full_num >= full_num && full_num !== 0) ? 'block' : 'none'}}
                  openType={userInfo.userInfo ? '' : 'getUserInfo'}
                  onGetUserInfo={this.presentInfo}
                  formType='submit'
                  onClick={this.toChoosePage.bind(this, 'present')}
                >
                  去领取
                </Button>
              </View>
              <View className='star-box'>
                {
                  totStarsArr.map((item, index) => (
                    <Image mode='widthFix'
                      className={full_num === 3 ? 'big' : ''}
                      src={(user_full_num >= index + 1) ? baseUrl + full_logo : baseUrl + full_logo_no} key={index}
                    />
                  ))
                }
              </View>
              <View className='rule' onClick={this.showOrHideModal.bind(this, true)}>活动规则
                <AtIcon value='chevron-right' size='17' />
              </View>
            </View>
            <Image src={baseUrl + full_image} />
          </View>
        }

        {
          full_status === 2 &&
          <Image src={baseUrl + full_undefind} className='full-image' />
        }

        <Modal title='活动规则'
          show={isShowModal} onHide={this.showOrHideModal.bind(this, false)}>
          <View className='rule-text'>
            {
              norm.map((item, index) => (
                <View key={index}>{index + 1}. {item}</View>
              ))
            }
          </View>
        </Modal>

        <CouponModal
          show={isShowCoupon && isFirstShow} coupon={curCoupon}
          onClose={this.couponClose}
        />

      </View>
        :
        <Loading />
    )
  }
}

export default Index
