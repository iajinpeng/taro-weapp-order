import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import Curtain from '../../components/curtain'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {baseUrl} from '../../config/index';

import './index.less'
import '../../app.less'

@connect(({common}) => ({...common}))
class CouponModal extends Component {

  static defaultProps = {
    coupon: {
      list: []
    }
  }

  getedUserInfo = (res) => {
    if (this.props.userInfo.userInfo) return
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

  toChoosePage = () => {
    if (!this.props.userInfo.userInfo) return
    Taro.navigateTo({
      url: '/pages/choose-shop/index'
    })
  }

  render () {
    const {show, coupon, onClose, userInfo} = this.props

    const {background_color, butto_color, font_color, image, list} = coupon

    return (
      <Curtain show={show} className='coupon-modal' onClose={onClose} contentWidth='90%'>
        <View className='coupon-modal-content'>
          <Image src={image ? baseUrl + image : ''} />
          <View className='list' style={{backgroundColor: background_color}}>
            {
              list && list.map((item, index) => (
                <View className='item' key={index}>
                  <View className='info'>
                    <View className='name'>{item.uc_name}</View>
                    <View className='memo'>
                      {
                        item.uc_min_amount == 0 ? '无门槛' :
                          `满${item.uc_min_amount}元可用`
                      }

                    </View>
                  </View>
                  <View className='gap'>
                    <Text className='line' />
                    <Text className='dot' style={{backgroundColor: background_color}} />
                    <Text className='dot dot-b' style={{backgroundColor: background_color}} />
                  </View>
                  <View className='right'>
                    <View className='price'>
                      <Text>&yen;</Text>
                      <Text className='font-xin-bold num'>{parseInt(item.uc_price)}</Text>
                    </View>
                    <Button
                      openType={userInfo.userInfo ? '' : 'getUserInfo'}
                      onGetUserInfo={this.getedUserInfo}
                      formType='submit'
                      onClick={this.toChoosePage}
                      style={{color: font_color, backgroundColor: butto_color}}
                      className={classnames('handle')}
                    >去使用</Button>
                  </View>
                </View>
              ))
            }
          </View>
        </View>
      </Curtain>
    )
  }
}

export default CouponModal
