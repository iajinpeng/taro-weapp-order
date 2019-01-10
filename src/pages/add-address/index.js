import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image, Input, Block, Map} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import './index.less'

@connect(({common, address}) => ({...common, address}))
class AddAddress extends Component {

  config = {
    navigationBarTitleText: '收货信息',
  }

  state = {
    address_detail: '',
    user_name: '',
    user_telephone: '',
  }

  componentDidMount () {

  }

  componentDidShow() {
    console.log(this.props)
  }

  toSelectPage = () => {
    Taro.navigateTo({
      url: '/pages/add-address/select'
    })
  }

  render () {
    const {theme, curAddress} = this.props
    const {address_detail, user_name, user_telephone} = this.state

    return (
      <View className='add-address'>
        <View className='content'>
          <View className='item'>
            <View className='label'>收货地址</View>
            <View className='input' onClick={this.toSelectPage}>
              {curAddress.name || '点击选择'}
            </View>
            <Image src={require('../../images/icon-down.png')} />
          </View>
          <View className="item">
            <View className="label">门牌号</View>
            <Input
              className="input" placeholder='输入详细地址' placeholderClass='input'
              value={address_detail} onInput={this.handleInput.bind(this, 'address_detail')}
            />
          </View>
          <View className="item">
            <View className="label">联系人</View>
            <Input
              className="input" placeholder='输入联系人名称' placeholderClass='input'
              value={user_name} onInput={this.handleInput.bind(this, 'user_name')}
            />
          </View>
          <View className="item">
            <View className="label">手机号</View>
            <Input
              className="input" placeholder='输入联系人手机号' placeholderClass='input'
              value={user_telephone} onInput={this.handleInput.bind(this, 'user_telephone')}
            />
          </View>
        </View>
        <Button className={'theme-grad-bg-' + theme}>确认保存</Button>
      </View>
    )
  }
}

export default AddAddress
