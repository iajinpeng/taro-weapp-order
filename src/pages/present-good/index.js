import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Block} from '@tarojs/components'
import {AtIcon, AtCurtain} from 'taro-ui'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import {baseUrl} from "../../config/index"
import Modal from '../../components/modal'
import PayBox from '../../components/pay-box'

import '../shop-index/index.less'
import './index.less'

@connect(({common, cart}) => ({...common, ...cart}))
class PresentGood extends Component {
  config = {
    navigationBarTitleText: '满单即送'
  }

  state = {
    goods: [],
    image: null,
    isShowOptions: false,
    isShowDetail: false,
    curCart: {},
    curGood: {},
    stanInfo: {},
    propertyTagIndex: [],
    optionalTagIndex: [],
    fs_id: ''
  }

  componentWillMount() {
    this.getPresentGood()
  }

  componentDidShow () {
    this.readStorageCarts()
  }

  getPresentGood = () => {
    this.props.dispatch({
      type: 'shop/getPresentGood',
      payload: {
        store_id: this.$router.params.id
      }
    }).then(({goods, image, fs_id}) => {
      this.setState({goods, image, fs_id})
    })
  }

  toStandardDetail = (good) => {
    Taro.navigateTo({
      url: `/pages/standard-detail/index?store_id=${this.$router.params.id}&id=${good.g_id}&name=${good.g_title}&fs_id=${this.state.fs_id}`
    })
  }

  toShopIndex = () => {
    Taro.navigateTo({
      url: '/pages/shop-index/index?id=' + this.$router.params.id + '&fs_id=' + this.state.fs_id
    })
  }

  stopPropagation = e => {
    e.stopPropagation()
  }

  showDetail = (good) => {
    const carts = this.props.carts[(+this.$router.params.id)] || []
    const curCart = JSON.parse(JSON.stringify(carts.find(item => item.g_id === good.g_id) || {}))

    this.setState({
      isShowDetail: true,
      curGood: good,
      curCart
    })
  }

  closeDetail = () => {
    this.setState({isShowDetail: false})
  }

  openOptions = (good, e) => {
    e && e.stopPropagation()

    this.setState({
      isShowCart: false,
      isShowOptions: true,
      curGood: good,

    })
    this.props.dispatch({
      type: 'shop/getGoodsNorm',
      payload: {
        store_id: +this.$router.params.id,
        goods_id: good.g_id
      }
    }).then(res => {
      const propertyTagIndex = Array.from({length: res.property.length}, () => 0)
      const optionalTagIndex = Array.from({length: res.norm.optional.length}, () => 0)

      const carts = this.props.carts[(+this.$router.params.id)] || []
      const optionalstr = propertyTagIndex.join('') + optionalTagIndex.join('')
      const cartsAlike = carts.find(item => (
        (item.g_id === good.g_id) && (item.optionalstr === optionalstr)
      ))
      const curCart = JSON.parse(JSON.stringify(cartsAlike || {}))

      this.setState({
        stanInfo: res,
        curCart,
        propertyTagIndex,
        optionalTagIndex,
      })

    })
  }

  closeOptions = () => {
    this.setState({
      isShowOptions: false,
    })
  }

  selectTag = (key, index, i) => {

    let stan = this.state[key]
    stan[index] = i
    this.setState({[key]: stan}, () => {
      const {propertyTagIndex, optionalTagIndex, curGood} = this.state

      const carts = this.props.carts[(+this.$router.params.id)] || []
      const optionalstr = propertyTagIndex.join('') + optionalTagIndex.join('')
      const cartsAlike = carts.find(item => (
        (item.g_id === curGood.g_id) && (item.optionalstr === optionalstr)
      ))
      const curCart = JSON.parse(JSON.stringify(cartsAlike || {}))

      this.setState({curCart})
    })
  }

  toChooseStan = () => {
    this.setState({isShowDetail: false})
    this.openOptions(this.state.curGood)
  }

  readStorageCarts = () => {
    let carts = Taro.getStorageSync('carts') || {}
    Taro.getStorageSync('carts') &&
    this.props.dispatch({
      type: 'cart/setStorageCart',
      payload: {
        carts
      }
    })
  }

  setCart = (good, num, cartGood) => {
    if (num === -1 && (!cartGood.num || cartGood.num <= 0)) return

    if (num === 1 && (this.props.carts[(this.$router.params.id)] || []).some(item => item.fs_id)) {
      Taro.showToast({
        title: '只可以选择一份赠品哦～',
        icon: 'none'
      })
      return
    }

    const {fs_id} = this.state
    const gd = {
      ...good,
      g_price: 0,
      fs_id
    }
    this.props.dispatch({
      type: 'cart/setCart',
      payload: {
        id: +this.$router.params.id,
        good: gd,
        num
      }
    })
  }

  setLocalCart = num => {
    if (num === 1 && (this.props.carts[(this.$router.params.id)] || []).some(item => item.fs_id)) {
      Taro.showToast({
        title: '只可以选择一份赠品哦～',
        icon: 'none'
      })
      return
    }

    const {curGood, stanInfo, propertyTagIndex, optionalTagIndex, fs_id} = this.state
    const curCart = JSON.parse(JSON.stringify(this.state.curCart))
    !curCart.num && (curCart.num = 0)
    curCart.num += num
    curCart.optionalstr = propertyTagIndex.join('') + optionalTagIndex.join('')
    this.setState({curCart})

    let normInfo = {}
    if (stanInfo.property) {
      normInfo = {
        property: JSON.parse(JSON.stringify(stanInfo.property)),
        optional: JSON.parse(JSON.stringify(stanInfo.norm.optional)),
        propertyTagIndex: JSON.parse(JSON.stringify(propertyTagIndex)),
        optionalTagIndex: JSON.parse(JSON.stringify(optionalTagIndex)),
        optionalstr: propertyTagIndex.join('') + optionalTagIndex.join(''),
      }
    }


    const good = {
      ...curGood,
      ...curCart,
      ...normInfo,
      g_price: 0,
      fs_id
    }

    this.props.dispatch({
      type: 'cart/setCart',
      payload: {
        id: +this.$router.params.id,
        good,
        num
      }
    })
  }

  showOrHideCartWarn = (bool) => {
    this.setState({isShowCartWarn: bool})
  }

  clearCart = () => {
    this.props.dispatch({
      type: 'cart/clearOneCart',
      payload: {
        id: +this.$router.params.id,
      }
    })
    this.setState({
      isShowCart: false,
      isShowCartWarn: false
    })
  }


  render() {
    const {theme, menu_cart} = this.props
    const {goods, image, curGood, isShowOptions, isShowDetail, stanInfo, curCart,
      propertyTagIndex, optionalTagIndex} = this.state
    const carts = (this.props.carts[(this.$router.params.id)] || []).filter(item => item.fs_id)

    return (
      <View className='present-good'>
        <Image className="banner" src={image ? baseUrl + image : ''}/>

        <View className='good-list'>
          {
            goods.map((good, i) => {
              const cartGood = carts.find(item => item.g_id === good.g_id)
              return (
                <View className='good' key={i} onClick={this.showDetail.bind(this, good)}>
                  <View className='img-wrap'>
                    {
                      good.tag_name &&
                      <Text className={classnames('tag', 'theme-grad-bg-' + theme)}>{good.tag_name}</Text>
                    }
                    <Image src={good.g_image_100 ? baseUrl + good.g_image_100 : ''}/>
                  </View>
                  <View className='info'>
                    <View className='name'>{good.g_title}</View>
                    <View className='pre-price'>&yen;{good.g_original_price}</View>
                    <View className='price'><Text>&yen;</Text>{good.g_price}</View>
                    <View className='handle' onClick={this.stopPropagation}>
                      {
                        good.g_combination === 1 &&
                        <Block>
                          {
                            good.g_has_norm === 2 &&
                            <View className='num-box'>
                              {
                                cartGood && cartGood.num !== 0 &&
                                <Block>
                                  <AtIcon
                                    value='subtract-circle' size={26}
                                    onClick={this.setCart.bind(this, good, -1)}
                                  />
                                  <Text className='num'>{cartGood.num}</Text>
                                </Block>
                              }
                              <View
                                onClick={this.setCart.bind(this, good, 1)}
                                className={classnames('add-circle', 'theme-bg-' + theme)}>
                                +
                              </View>
                            </View>
                          }
                          {
                            good.g_has_norm === 1 &&
                            <Button
                              onClick={this.openOptions.bind(this, good)}
                              className={'theme-bg-' + theme}
                            >选规格</Button>
                          }
                        </Block>
                      }

                      {
                        good.g_combination === 2 &&
                        <Button
                          onClick={this.toStandardDetail.bind(this, good)}
                          className={'theme-bg-' + theme}
                        >选规格</Button>
                      }
                    </View>
                  </View>
                </View>
              )
            })
          }

        </View>

        <Modal
          show={isShowOptions} title={stanInfo.g_description}
          blackTitle
          titleAlign='center' onHide={this.closeOptions.bind(this, curGood)}
        >
          <View className='option-modal-content'>
            <ScrollView scrollY>
              {
                stanInfo.property.map((item, index) => (
                  <View className='block' key={index}>
                    <View className='name'>{item.name}</View>
                    <View className='options'>
                      {
                        item.list_name.map((option, i) => (
                          <Button
                            onClick={this.selectTag.bind(this, 'propertyTagIndex', index, i)} key={i}
                            className={propertyTagIndex[index] === i ? 'active theme-grad-bg-' + theme : ''}
                          >{option}</Button>
                        ))
                      }
                    </View>
                  </View>
                ))
              }
              {
                stanInfo.norm.optional.map((item, index) => (
                  <View className='block' key={index}>
                    <View className='name'>{item.title}</View>
                    <View className='options'>
                      {
                        item.list.map((option, i) => (
                          <Button
                            onClick={this.selectTag.bind(this, 'optionalTagIndex', index, i)} key={i}
                            className={optionalTagIndex[index] === i ? 'active theme-grad-bg-' + theme : ''}
                          >{option.gn_name}</Button>
                        ))
                      }
                    </View>
                  </View>
                ))
              }
            </ScrollView>

            <View className='price-wrap'>
              <View className='price-box'>
                <View className={classnames('price', 'theme-c-' + theme)}>
                  <Text>&yen;</Text>
                  {
                    (+curGood.g_price + (stanInfo.norm &&
                      stanInfo.norm.optional.reduce((total, item, index) => {
                        total += +item.list[optionalTagIndex[index]].gn_price
                        return total
                      }, 0))).toFixed(2)
                  }
                </View>
                <View className='pre-price'>
                  <Text>&yen;</Text>
                  {curGood.g_original_price}
                </View>
              </View>
              {
                (!curCart.num || curCart.num === 0 ||
                  curCart.optionalstr !== (propertyTagIndex.join('') + optionalTagIndex.join(''))) &&
                <Button
                  className={'theme-grad-bg-' + theme} onClick={this.setLocalCart.bind(this, 1)}
                >
                  加入购物车
                </Button>
              }
              {
                curCart.num && curCart.num !== 0 && curCart.optionalstr &&
                // (curCart.optionalstr === (propertyTagIndex.join('') + optionalTagIndex.join(''))) &&
                <View className='num-box'>
                  <AtIcon
                    value='subtract-circle' size={26}
                    onClick={this.setLocalCart.bind(this, -1)}
                  />
                  <Text className='num'>{curCart.num}</Text>
                  <View
                    onClick={this.setLocalCart.bind(this, 1)}
                    className={classnames('add-circle', 'theme-bg-' + theme)}
                  >+</View>
                </View>
              }
            </View>
          </View>
        </Modal>

        <AtCurtain isOpened={isShowDetail} onCLose={this.closeDetail}>
          <View className='good-detail'>
            <View className='image-wrap'>
              <Image src={curGood.g_image_300 ? baseUrl + curGood.g_image_300 : ''}/>
            </View>
            <View className='info'>
              <View className='title'>
                {
                  curGood.tag_name &&
                  <Text className={classnames('tag', 'theme-grad-bg-' + theme)}>{curGood.tag_name}</Text>
                }
                <Text className='name'>{curGood.g_title}</Text>
              </View>
              <View className='desc'>{curGood.g_description}</View>
              <View className='price-wrap'>
                <View className={classnames('price', 'theme-c-' + theme)}>
                  <Text>&yen;</Text>{curGood.g_price}
                </View>
                <View className='pre-price'><Text>&yen;</Text>{curGood.g_original_price}</View>
                {
                  curGood.g_has_norm === 2 &&
                  (!curCart.num || curCart.num === 0) &&
                  <Button
                    className={'theme-grad-bg-' + theme} onClick={this.setLocalCart.bind(this, 1)}
                  >
                    加入购物车
                  </Button>
                }
                {
                  curGood.g_has_norm === 2 && curCart.num &&
                  curCart.num !== 0 &&
                  <View className='num-box'>
                    <AtIcon
                      value='subtract-circle' size={26}
                      onClick={this.setLocalCart.bind(this, -1)}
                    />
                    <Text className='num'>{curCart.num}</Text>
                    <View
                      onClick={this.setLocalCart.bind(this, 1)}
                      className={classnames('add-circle', 'theme-bg-' + theme)}
                    >+</View>
                  </View>
                }

                {
                  curGood.g_combination === 1 && curGood.g_has_norm === 1 &&
                  <Button
                    className={'theme-grad-bg-' + theme} onClick={this.toChooseStan}
                  >
                    选规格
                  </Button>
                }

                {
                  curGood.g_combination === 2 &&
                  <Button
                    className={'theme-grad-bg-' + theme} onClick={this.toStandardDetail.bind(this, curGood)}
                  >
                    选规格
                  </Button>
                }

              </View>
            </View>
          </View>
        </AtCurtain>

        <PayBox simple present
          theme={theme} carts={carts} storeId={+this.$router.params.id}
          themeInfo={menu_cart}
        />

        <Button className={classnames('more', 'theme-c-' + theme)} onClick={this.toShopIndex}>选购更多</Button>
      </View>
    )
  }
}

export default PresentGood
