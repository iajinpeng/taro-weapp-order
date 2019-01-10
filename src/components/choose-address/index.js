import Taro, {Component} from '@tarojs/taro'
import {View, Block, Text} from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'
import '../../app.less'

class ChooseAddress extends Component {

  static propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func
  }

  static defaultProps = {
    show: false,
    onClose: null,

  }

  state = {

  }

  handleClose = () => {
    this.props.onClose()
  }

  toAddressPage = () => {
    Taro.navigateTo({
      url: '/pages/add-address/index'
    })
  }

  render() {
    const {show, theme} = this.props

    return (
      <Block>
        <View className='mask' style={{display: show ? 'block' : 'none'}} onClick={this.handleClose}/>
        <View className={classnames('choose-address', show ? 'active' : '')}>
          <View className='title'>选择收货地址
            <Text className='cacel' onClick={this.handleClose}>取消</Text>
          </View>
          <View className='content'>
            <View className='null' onClick={this.toAddressPage}>
              <View className={classnames('icon', 'theme-grad-bg-' + theme)}>+</View>
              <View className={classnames('text', 'theme-c-' + theme)}>新增收货地址</View>
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default ChooseAddress
