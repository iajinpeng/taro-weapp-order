import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image, Input} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtToast} from 'taro-ui'
import classnames from 'classnames'
import {baseUrl, themeBtnShadowColors} from '../../config/index';
import Copyright from '../../components/copyright'
import './index.less'

@connect(({common, address}) => ({...common, ...address}))
class AddAddress extends Component {

  config = {
    navigationBarTitleText: '收货信息',
    disableScroll: true
  }

  state = {
    address_detail: '',
    user_name: '',
    user_telephone: '',
    alertPhone: false,
    alertPhoneText: '',
    da_id: null
  }

  componentWillMount () {

    const {da_id, user_name, door, user_telephone } = this.props.curAddress

    this.setState({
      da_id, user_name, user_telephone,
      address_detail: door || ''
    })
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

      }
    })
      .catch(err => {
        console.log(err)
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
    const {name, longitude, latitude, address } = curAddress

    if (!/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/.test(user_telephone)){
      this.setState({
        alertPhone: true,
        alertPhoneText: '手机号码格式不正确哦~'
      })
      return
    }

    this.props.dispatch({
      type: 'address/postAddress',
      payload: {
        address: name,
        da_id,
        address_detail: address + '|' + address_detail,
        address_lng: longitude,
        address_lat: latitude,
        user_name,
        user_telephone
      }
    }).then(() => {
      Taro.showToast({
        title: '保存成功'
      })

      this.props.dispatch({
        type: 'order/setKeyRefreshAddress',
        payload: {
          refreshAddress: true
        }
      })

      setTimeout(() => {
        Taro.navigateBack()
        this.props.dispatch({
          type: 'address/setCurAddress',
          payload: {}
        })
      }, 1500)
    })
  }

  delAddress = () => {
    this.props.dispatch({
      type: 'address/delAddress',
      payload: {
        da_id: this.state.da_id
      }
    }).then(res => {
      Taro.showToast({
        title: '删除成功!'
      })
      this.props.dispatch({
        type: 'order/setKeyRefreshAddress',
        payload: {
          refreshAddress: true
        }
      })

      setTimeout(Taro.navigateBack, 1500)
    })
  }

  alertPhoneClose = () => {
    this.setState({
      alertPhone: false,
    })
  }

  render () {
    const {theme, curAddress} = this.props
    const {address_detail, user_name, user_telephone, alertPhone, alertPhoneText, da_id} = this.state

    const isCanPost = curAddress.name && address_detail && user_name && user_telephone

    return (
      <View className='add-address'>
        <View className='content'>
          <View className='item'>
            <View className='label'>收货地址</View>
            <View className='input' onClick={this.handleAdd}>
              {curAddress.name || '点击选择'}
            </View>
            {
              theme &&
              <Image
                src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_3.png`}
                onClick={this.handleAdd}
              />
            }
          </View>
          <View className='item'>
            <View className='label'>门牌号</View>
            <Input
              className='input' placeholder='输入详细地址' placeholderClass='input-place' maxLength='30'
              value={address_detail} onInput={this.handleInput.bind(this, 'address_detail')}
            />
          </View>
          <View className='item'>
            <View className='label'>联系人</View>
            <Input
              className='input' placeholder='输入联系人名称' placeholderClass='input-place' maxLength='10'
              value={user_name} onInput={this.handleInput.bind(this, 'user_name')}
            />
          </View>
          <View className='item'>
            <View className='label'>手机号</View>
            <Input
              className='input' placeholder='输入联系人手机号' placeholderClass='input-place' maxLength='15'
              value={user_telephone} onInput={this.handleInput.bind(this, 'user_telephone')}
            />
          </View>
        </View>

        <Button
          className={isCanPost ? 'theme-grad-bg-' + theme : 'disabled'} disabled={!isCanPost}
          style={{boxShadow: isCanPost ? '0 40rpx 40rpx -30rpx ' + themeBtnShadowColors[theme] :
            '0 40rpx 40rpx -30rpx #ddd'}}
          onClick={this.postAddress}
        >确认保存</Button>

        {
          da_id &&
          <Button
            className={classnames('theme-c-' + theme, 'delete-btn')}
            onClick={this.delAddress}
          >
            删除地址</Button>
        }

        {/*<View className='copy-box'>
          <Copyright />
        </View>*/}

        <AtToast
          isOpened={alertPhone} text={alertPhoneText} iconSize={40} duration={2000}
          icon='iphone' hasMask onClose={this.alertPhoneClose}
        />
      </View>
    )
  }
}

export default AddAddress
