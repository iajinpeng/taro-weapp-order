import Taro, {Component} from '@tarojs/taro'
import {View, Block, Text, Image, ScrollView} from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect} from '@tarojs/redux'

import {baseUrl} from '../../config/index';

import './index.less'
import '../../app.less'

@connect(() => ({}))
class ChooseAddress extends Component {

  static propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func
  }

  static defaultProps = {
    show: false,
    onClose: null,
    address: []
  }

  state = {
    defaultIndex: 0
  }

  handleClose = (isChange, address) => {
    this.props.onClose(isChange ? address : null)
  }

  handleAdd = () => {
    Taro.chooseLocation().then(res => {
      if (res.name) {
        const {address, name, latitude, longitude} = res
        this.props.dispatch({
          type: 'address/setCurAddress',
          payload: {
            name, latitude, longitude, address
          }
        })
        this.toAddPage()
      }
    })
      .catch(err => {
        console.log(err)
      })
  }

  choose = (index, optional) => {
    if (!optional) return

    this.setState({defaultIndex: index})
    const {address} = this.props
    const useAddress = address.length > 0 ? address.filter(v => v.optional) : []
    this.handleClose(true, useAddress[index])
  }

  edit = (addressInfo, e) => {
    e.stopPropagation()

    const {da_id, address, address_detail, address_lat, address_lng, user_name, user_telephone} = addressInfo
    const [detail, door] = address_detail.split('|')
    this.props.dispatch({
      type: 'address/setCurAddress',
      payload: {
        da_id, address_detail, user_name, user_telephone,
        name: address,
        address: detail,
        door,
        latitude: address_lat,
        longitude: address_lng
      }
    })
    this.toAddPage()
  }

  toAddPage = () => {
    Taro.navigateTo({
      url: '/pages/add-address/index'
    })
  }

  stopPro = e => {
    e.stopPropagation()
  }

  render() {
    const {show, theme, address} = this.props

    const {defaultIndex} = this.state

    const useAddress = address.length > 0 ? address.filter(v => v.optional) : []

    const uselessAddress = address.length > 0 ? address.filter(v => !v.optional) : []

    return (
      <Block>
        <View onTouchMove={this.stopPro}
          className='mask' style={{display: show ? 'block' : 'none'}}
          onClick={this.handleClose.bind(this, false)}
        />
        <View className={classnames('choose-address', show ? 'active' : '')} onTouchMove={this.stopPro}>
          <View className='title'>选择收货地址
            <Text className='cacel' onClick={this.handleClose.bind(this, false)}>取消</Text>
          </View>
          <ScrollView scrollY className='content'>
            {
              useAddress.length === 0 &&
              <View className='null' onClick={this.handleAdd}>
                <Image className='icon' src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_8.png`} />
                <View className={classnames('text', 'theme-c-' + theme)}>新增收货地址</View>
              </View>
            }

            {
              useAddress.length > 0 &&
              <View className='list'>
                {
                  useAddress.map((item, index) => (
                    <View className='address-item' key={index} onClick={this.choose.bind(this, index, item.optional)}>
                      {
                        defaultIndex === index ?
                          <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_2.png`} />
                          :
                          <View className='alias' />
                      }
                      <View className='info'>
                        <View className='addr'>{item.address}</View>
                        <View className='user'>
                          {item.user_name + ' ' + item.user_telephone}
                        </View>
                      </View>
                      <View className='edit' onClick={this.edit.bind(this, item)}>
                        <Image src={require('../../assets/images/icon-edit.png')} />
                      </View>
                    </View>
                  ))
                }

                {
                  uselessAddress.length > 0 &&
                  <View className='useless-title'>以下地址不可用</View>
                }

                {
                  uselessAddress.map((item, index) => (
                    <View className='address-item useless' key={index}>
                      <View className='alias' />
                      <View className='info'>
                        <View className='addr'>{item.address}</View>
                        <View className='user'>
                          {item.user_name + ' ' + item.user_telephone}
                        </View>
                      </View>
                      <View className='edit' onClick={this.edit.bind(this, item)}>
                        <Image src={require('../../assets/images/icon-edit.png')} />
                      </View>
                    </View>
                  ))
                }
              </View>
            }

          </ScrollView>
          {
            show && useAddress.length > 0 &&
            <View className='add' onClick={this.handleAdd}>
              <Image className='icon' src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_8.png`} />
              <Text>新增收货地址</Text>
            </View>
          }
        </View>
      </Block>
    )
  }
}

export default ChooseAddress
