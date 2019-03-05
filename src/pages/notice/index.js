import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import BackToHome from '../../components/back-to-home'
import './index.less'


@connect(({common}) => ({...common}))
class Notice extends Component {
  config = {
    navigationBarTitleText: '顾客须知',
    // disableScroll: true
  }

  state = {
    diancan: {},
    quxiao: {},
    question: [],
    showMsg: 0
  }

  componentWillMount () {
    Taro.showShareMenu({
      withShareTicket: true
    })
    this.getNotice()
  }

  onShareAppMessage = () => {
    return {
      path: 'pages/notice/index?isShare=1'
    }
  }

  show = () => {
    this.setState({showMsg: this.state.showMsg + 1})
  }

  getNotice = () => {
    this.props.dispatch({
      type: 'common/getNotice'
    }).then(({diancan, quxiao, question}) => {
      this.setState({diancan, quxiao, question})
    })
  }

  getedUserInfo = (res) => {
    if (this.props.userInfo.userInfo) return

    this.handleFetchUserInfo(res)

    this.toChoosePage()
  }

  toChoosePage = () => {
    if (!this.props.userInfo.userInfo) return
    const url = '/pages/choose-shop/index'
    Taro.navigateTo({
      url
    })
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

  render() {
    const {theme, userInfo} = this.props
    const {diancan, quxiao, question, showMsg} = this.state

    return (
      diancan.title &&
      <View scrollY className='notice'>
        <View className='wrap'>
          <View className='block'>
            <View>您在使用此平台前应仔细阅读如下须知：</View>

            <View className={classnames('title-2', 'theme-c-' + theme)}>1. {diancan.title}</View>

            <View>
              <Text className='dot' />
              {diancan.answer}
            </View>

            <View className={classnames('title-2', 'theme-c-' + theme)}>1. {quxiao.title}</View>

            <View>
              <Text className='dot' />
              {quxiao.answer}
            </View>

          </View>

          <View className='block' onClick={this.show}>
            <View className={classnames('title-1', 'theme-c-' + theme)}>常见问题</View>

            {
              question.map((item, index) => (
                <View key={index}>
                  <View className={classnames('title-2', 'theme-c-' + theme)}>{item.title}</View>
                  <View>{item.answer}</View>
                </View>
              ))
            }
          </View>

          {
            showMsg >= 3 &&
            <View style={{wordBreak: 'break-all'}}>
              {
                Taro.getStorageSync('themeInfo')
              }
            </View>
          }

          <Button
            className={classnames('do-btn', 'theme-grad-bg-' + theme)}
            openType={userInfo.userInfo ? '' : 'getUserInfo'}
            onGetUserInfo={this.getedUserInfo}
            formType='submit'
            onClick={this.toChoosePage.bind(this, null)}
          >
            开始点餐</Button>
        </View>

        {
          this.$router.params.isShare === '1' &&
          <BackToHome />
        }

      </View>
    )
  }
}

export default Notice
