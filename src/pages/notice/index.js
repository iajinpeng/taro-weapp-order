import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import './index.less'


@connect(({common}) => ({...common}))
class Notice extends Component {
  config = {
    navigationBarTitleText: '顾客须知',
    disableScroll: true
  }

  state = {
    diancan: {},
    quxiao: {},
    question: []
  }

  componentWillMount () {
    this.getNotice()
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
    const {diancan, quxiao, question} = this.state

    return (
      diancan &&
      <View className='notice'>
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

        <View className='block'>
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

        <Button
          className={classnames('do-btn', 'theme-grad-bg-' + theme)}
          openType={userInfo.userInfo ? '' : 'getUserInfo'}
          onGetUserInfo={this.getedUserInfo}
          formType='submit'
          onClick={this.toChoosePage.bind(this, null)}
        >
          开始点餐</Button>

      </View>
    )
  }
}

export default Notice
