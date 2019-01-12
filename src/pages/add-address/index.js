import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image, Input} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import './index.less'

@connect(({common, address}) => ({...common, ...address}))
class AddAddress extends Component {

  config = {
    navigationBarTitleText: '收货信息',
  }

  state = {
    address_detail: '',
    user_name: '',
    user_telephone: '',
  }

  componentWillMount () {

    if (this.props.curAddress.da_id) {
      const {da_id, address_detail, user_name, user_telephone} = this.props.curAddress

      this.setState({
        da_id, address_detail, user_name, user_telephone
      })
    }
  }

  toSelectPage = () => {
    Taro.navigateTo({
      url: '/pages/add-address/select'
    })
  }

  handleInput = (key, e) => {
    this.setState({
      [key]: e.target.value
    })
  }

  postAddress = () => {
    const {curAddress} = this.props
    const {da_id, address_detail, user_name, user_telephone} = this.state
    const [address_lng, address_lat] = curAddress.location.split(',')
    const {name, pname, cityname, adname, address } = curAddress

    if (!/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/.test(user_telephone)){
      Taro.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }

    this.props.dispatch({
      type: 'address/postAddress',
      payload: {
        address: [name, pname, cityname, adname, address].join('|'),
        da_id,
        address_detail,
        address_lng,
        address_lat,
        user_name, user_telephone
      }
    }).then(() => {
      Taro.showToast({
        title: '保存成功'
      })

      setTimeout(Taro.navigateBack, 1500)
    })
  }

  render () {
    const {theme, curAddress} = this.props
    const {address_detail, user_name, user_telephone} = this.state

    const isCanPost = curAddress.name && address_detail && user_name && user_telephone

    return (
      <View className='add-address'>
        <View className='content'>
          <View className='item'>
            <View className='label'>收货地址</View>
            <View className='input' onClick={this.toSelectPage}>
              {curAddress.name || '点击选择'}
            </View>
            <Image src={require('../../images/icon-down.png')} onClick={this.toSelectPage} />
          </View>
          <View className='item'>
            <View className='label'>门牌号</View>
            <Input
              className='input' placeholder='输入详细地址' placeholderClass='input' maxLength='30'
              value={address_detail} onInput={this.handleInput.bind(this, 'address_detail')}
            />
          </View>
          <View className='item'>
            <View className='label'>联系人</View>
            <Input
              className='input' placeholder='输入联系人名称' placeholderClass='input' maxLength='10'
              value={user_name} onInput={this.handleInput.bind(this, 'user_name')}
            />
          </View>
          <View className='item'>
            <View className='label'>手机号</View>
            <Input
              className='input' placeholder='输入联系人手机号' placeholderClass='input' maxLength='15'
              value={user_telephone} onInput={this.handleInput.bind(this, 'user_telephone')}
            />
          </View>
        </View>
        <Button
          className={isCanPost ? 'theme-grad-bg-' + theme : 'disabled'} disabled={!isCanPost}
          onClick={this.postAddress}
        >确认保存</Button>
      </View>
    )
  }
}

export default AddAddress
