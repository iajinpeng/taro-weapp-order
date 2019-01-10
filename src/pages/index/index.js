import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'

import { baseUrl } from '../../config'
import Modal from '../../components/modal'
import CouponModal from '../../components/coupon-modal'


import './index.less'


@connect(({common}) => ({...common}))
class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  state = {
    activeBannerIndex: 0,
    user_full_num: 8,
    full_num: 8,
    isShowModal: false,
    banner: [],
    full_logo: '',
    full_logo_no: '',
    full_image: '',
    full_undefind: '',
    full_status: '',
    norm: []
  }

  componentWillMount () {

    Taro.getSystemInfo().then(res => {
      this.props.dispatch({
        type: 'common/setSistemInfo',
        payload: res
      })
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.setSessionId().then(() => {
      this.props.dispatch({
        type: 'common/requestHomeInfo'
      }).then(res => {
        this.setState({
          ...res
        })
      })
    })
  }

  componentDidHide () { }

  showOrHideModal = (bool) => {
    this.setState({isShowModal: bool})
  }

  setSessionId = async () => {
    if(!Taro.getStorageSync('sessionId')){
      await this.props.dispatch({
        type: 'common/requestLogin'
      })
      return
    } else{
      return
    }
  }

  toChoosePage = (present) => {
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

  toPresentPage = () => {
    Taro.navigateTo({
      url: '/pages/present-good/index'
    })
  }

  getedUserInfo = (res) => {
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

    this.toChoosePage()
  }

  handleBannerChange = e => {
    this.setState({activeBannerIndex: e.detail.current})
  }

  render () {
    const {theme} = this.props

    const { user_full_num, full_num, isShowModal, activeBannerIndex,
      banner, full_image, full_logo, full_logo_no,
      full_status, full_undefind, norm} = this.state

    const totStarsArr = new Array(full_num);

    return (
      <View className='index-page'>
        <View className='icon-help-wrap' onClick={this.toNoticePage}>
          <AtIcon value='help' size='14' />
        </View>
        <View className='banner'>
          <Swiper circular autoplay onChange={this.handleBannerChange}>
            {
              banner.map((img, index) => (
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
            banner.map((img, index) => (
              <Text className={index === activeBannerIndex ? 'active theme-bg-' + theme : ''} key={index} />
            ))
          }
        </View>
        <Button
          className={classnames('do-btn', 'theme-grad-bg-' + theme)}
          openType='getUserInfo'
          onGetUserInfo={this.getedUserInfo}
          formType='submit'
        >
          开始点餐</Button>

        <View className={classnames('icon-box clearfix', 'theme-c-' + theme)}>
          <View onClick={this.toOrderListPage}>
            <Image src={require('../../images/icon-order.png')} />
            <Text>订单</Text>
          </View>
          <View onClick={this.toCouponPage}>
            <Image src={require('../../images/icon-ticket.png')} />
            <Text>优惠券</Text>
          </View>
        </View>

        {
          full_status === 1 &&
          <View className='tips'>
            <View className='info'>
              <View className='title'>满单即送</View>
              <View className='count-box'>
                <View className={classnames('count', 'theme-c-' + theme)}>
                  <Text>{user_full_num}/{full_num}</Text>单
                </View>

                <Button
                  class={classnames('do', 'theme-grad-bg-' + theme)}
                  style={{display: (user_full_num === full_num && full_num !== 0) ? 'block' : 'none'}}
                  onClick={this.toChoosePage.bind(this, 'present')}
                >
                  去下单
                </Button>
              </View>
              <View className='star-box'>
                {
                  totStarsArr.map((item, index) => (
                    <Image
                      className={full_num === 3 ? 'big' : ''}
                      src={(user_full_num >= index + 1) ? baseUrl + full_logo_no : baseUrl + full_logo} key={index}
                    />
                  ))
                }
              </View>
              <View className='rule' onClick={this.showOrHideModal.bind(this, true)}>活动规则</View>
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
      </View>
    )
  }
}

export default Index
