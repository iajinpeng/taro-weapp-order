import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import Copyright from '../../components/copyright'
import BackToHome from '../../components/back-to-home'
import {getTouchData} from '../../utils/utils'
import './index.less'
import nullImage from '../../assets/images/icon-coupon-null.png'

@connect(({common}) => ({...common}))
class Coupon extends Component {
  config = {
    navigationBarTitleText: '我的优惠',
    disableScroll: true
  }

  state = {
    type: 1,
    page: 1,
    page_size: 5,
    lists1: [],
    lists2: [],
    total1: 0,
    total2: 0,
    openIndex: null,
    firstId: null
  }

  canRequestMore = true

  componentDidShow() {
    this.requestCouponList().then(({total, rows}) => {
      this.setState({
        lists1: rows,
        total1: total
      })
    })
    this.requestCouponList(2).then(({total, rows}) => {
      this.setState({
        lists2: rows,
        total2: total
      })
    })
  }

  changeTab = i => {
    if(this.state.type === i) return

    this.setState({
      page: 1,
    }, () => {
      this.requestCouponList(i).then(({total, rows}) => {
        this.setState({
          openIndex: null,
          type: i,
          ['lists' + i]: rows,
          ['total' + i]: total,
          firstId: rows && rows.length > 0 ? 'uc-' + rows[0].uc_id : null
        })
      })
    })

  }

  requestCouponList = (targetType) => {
    const {type, page, page_size} = this.state

    return this.props.dispatch({
      type: 'common/requestCouponList',
      payload: {
        type: targetType || type,
        page,
        page_size
      }
    })
  }

  requestMore = () => {
    const {page, page_size, type} = this.state

    if (!this.canRequestMore || page * page_size >= this.state['total' + type]) return

    this.canRequestMore = true

    this.setState({page: page + 1}, () => {
      Taro.showLoading({mask: true})
      this.requestCouponList().then(({total, rows}) => {
        this.setState({
          ['lists' + type]: [...this.state['lists' + type], ...rows],
          ['total' + type]: total
        }, Taro.hideLoading)
        this.canRequestMore = true
      })
    })
  }

  openCondition = index => {
    const {openIndex} = this.state
    this.setState({openIndex: openIndex !== index ? index : null})
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

  handleTouchStart = e => {
    this.touch_s_x = e.changedTouches[0].clientX
    this.touch_s_y = e.changedTouches[0].clientY
  }

  handleTouchEnd = e => {
    this.touch_e_x = e.changedTouches[0].clientX
    this.touch_e_y = e.changedTouches[0].clientY

    const {touch_e_x, touch_e_y, touch_s_x, touch_s_y} = this

    const turn = getTouchData(touch_e_x, touch_e_y, touch_s_x, touch_s_y)

    const {type} = this.state

    if (turn === 'right') {
      type === 2 && this.changeTab(1)
    } else if (turn === 'left') {
      type === 1 && this.changeTab(2)
    }
  }

  handleScroll = (type, e) => {
    this.setState({
      ['scrollTop' + type]: e.detail.scrollTop
    })
  }

  render() {
    const {theme, userInfo} = this.props
    const {type, openIndex, lists1, lists2, firstId} = this.state

    const listArr = [lists1, lists2]

    return (
      <View className='coupon' onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd}>
        <View className='title'>
          <View
            className={classnames('normal', type === 1 ? 'active theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 1)}>未过期</View>
          <View
            className={classnames('useless', type === 2 ? 'active theme-c-' + theme : '')}
            onClick={this.changeTab.bind(this, 2)}>已过期</View>
        </View>

        {
          listArr.map((lists, _index) => (
            <ScrollView key={_index}
              scrollY className={classnames('content', 'content-' + (_index + 1), type === _index + 1 ? 'active' : '')}
              onScrollToLower={this.requestMore}
              onScroll={this.handleScroll.bind(this, _index + 1)}
              scrollIntoView={firstId}
              lowerThreshold={10}
              enableBackToTop
            >
              {
                lists.length === 0 &&
                <View className='null'>
                  <Image src={nullImage} />
                  <View>还没有任何优惠券哦~</View>
                </View>
              }
              {
                lists.length !== 0 &&
                <View className='coupon-list'>
                  {
                    lists.map((coupon, index) => (
                      <View className='item' key={index} id={'uc-' + coupon.uc_id}>
                        <View className='entity'>
                          <View className={classnames('deno', _index + 1 === 1 ? 'theme-grad-bg-' + theme : '')}>
                            <View className='price'>
                              <Text>&yen;</Text>
                              <Text className='num font-xin-bold'>{coupon.uc_price}</Text>
                            </View>
                            <View>{coupon.uc_min_amount}</View>
                          </View>
                          <View className='desc'>
                            <View className={classnames('name', _index + 1 === 2 ? 'disabled' : '')}>{coupon.uc_name}</View>
                            <View className='time'>{coupon.uc_start_time} 至 {coupon.uc_end_time}</View>
                            <View className='btn' onClick={this.openCondition.bind(this, index)}>使用条件
                              <AtIcon value={openIndex === index ? 'chevron-up': 'chevron-down'} size='13' />
                            </View>
                          </View>
                          <Button
                            disabled={_index + 1 === 2}
                            openType={userInfo.userInfo ? '' : 'getUserInfo'}
                            onGetUserInfo={this.getedUserInfo}
                            formType='submit'
                            onClick={this.toChoosePage}
                            className={classnames('handle', _index + 1 === 1 ? 'theme-grad-bg-' + theme : '')}
                          >去使用</Button>
                        </View>
                        {
                          openIndex === index &&
                          <View className='condi'>
                            <View>优惠券使用条件</View>
                            {
                              coupon.norm.map((item, i) => (
                                <View key={i}>{i + 1}. {item}</View>
                              ))
                            }
                          </View>
                        }
                      </View>
                    ))
                  }

                </View>
              }

              <View style={{marginTop: '100px'}}>
                <Copyright />
              </View>
            </ScrollView>
          ))
        }

        {
          this.$router.params.from === '1' &&
          <BackToHome />
        }
      </View>
    )
  }
}

export default Coupon
