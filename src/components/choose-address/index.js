import Taro, {Component} from '@tarojs/taro'
import {View, Block, Text, Image} from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect} from '@tarojs/redux'

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

  toAddressPage = () => {
    Taro.navigateTo({
      url: '/pages/add-address/index'
    })
  }

  choose = index => {
    this.setState({defaultIndex: index})
  }

  edit = (addressInfo, e) => {
    e.stopPropagation()

    const [name, pname, cityname, adname, address] = addressInfo.address.split('|')
    const {address_lng, address_lat} = addressInfo
    const location = address_lng + ',' + address_lat
    this.props.dispatch({
      type: 'address/setCurAddress',
      payload: {
        ...addressInfo,
        address, pname, cityname, name, adname, location
      }
    })
    this.toAddressPage()
  }

  render() {
    const {show, theme, address} = this.props

    const {defaultIndex} = this.state

    const useAddress = address.length > 0 ? address.filter(v => v.optional) : []

    return (
      <Block>
        <View catchTouchMove
          className='mask' style={{display: show ? 'block' : 'none'}}
          onClick={this.handleClose.bind(this, true, useAddress[defaultIndex])}
        />
        <View className={classnames('choose-address', show ? 'active' : '')}>
          <View className='title'>选择收货地址
            <Text className='cacel' onClick={this.handleClose.bind(this, false)}>取消</Text>
          </View>
          <View className='content'>
            {
              useAddress.length === 0 &&
              <View className='null' onClick={this.toAddressPage}>
                <View className={classnames('icon', 'theme-grad-bg-' + theme)}>+</View>
                <View className={classnames('text', 'theme-c-' + theme)}>新增收货地址</View>
              </View>
            }

            {
              useAddress.map((item, index) => (
                <View className='address-item' key={index} onClick={this.choose.bind(this, index)}>
                  {
                    defaultIndex === index ?
                    <Image src={require('../../images/icon-selected.png')} />
                      :
                    <View className='alias' />
                  }
                  <View className='info'>
                    <View className='addr'>{item.address + ' ' + item.address_detail}</View>
                    <View className='user'>
                      {item.user_name + ' ' + item.user_telephone}
                    </View>
                  </View>
                  <View className='edit' onClick={this.edit.bind(this, item)}>
                    <Image src={require('../../images/icon-edit.png')} />
                  </View>
                </View>
              ))
            }

            {
              show && useAddress.length > 0 &&
              <View className='add' onClick={this.toAddressPage}>
                <Text className={classnames('icon', 'theme-bg-' + theme)}>+</Text>
                <Text>新增收货地址</Text>
              </View>
            }

          </View>

        </View>
      </Block>
    )
  }
}

export default ChooseAddress
