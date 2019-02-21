import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Block} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import Modal from '../../components/modal'
import PayBox from '../../components/pay-box'
import Numbox from '../../components/num-box'
import Curtain from '../../components/curtain'
import Loading from '../../components/Loading'

import '../shop-index/index.less'
import './index.less'

@connect(({common, cart}) => ({...common, ...cart}))
class PresentGood extends Component {
  config = {
    navigationBarTitleText: '满单即送',
    // disableScroll: true
  }

  state = {
    goods: [],
    image: null,
    isShowOptions: false,
    isShowDetail: false,
    isShowCart: false,
    curCart: {},
    curGood: {},
    stanInfo: {},
    propertyTagIndex: [],
    optionalTagIndex: [],
    fs_id: ''
  }

  componentWillMount() {

  }

  componentDidShow () {
    this.getPresentGood()
    this.readStorageCarts()
  }

  getPresentGood = () => {
    this.props.dispatch({
      type: 'shop/getPresentGood',
      payload: {
        store_id: this.$router.params.id
      }
    }).then(({goods, image, fs_id}) => {
      if (+fs_id === 0) {
        Taro.reLaunch({
          url: '/pages/index/index'
        })
      }
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

  ToggleShowCart = () => {
    this.setState({isShowCart: !this.state.isShowCart})
  }

  closeDetail = () => {
    this.setState({isShowDetail: false})
  }

  openOptions = (good, e) => {
    e && e.stopPropagation()

    if ((this.props.carts[(this.$router.params.id)] || []).some(item => item.fs_id)) {
      Taro.showToast({
        title: '只可以选择一份赠品哦～',
        icon: 'none'
      })
      return
    }

    this.setState({
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
        isShowOptions: true,
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
      isShowCart: false
    })
  }

  closeCart = () => {
    this.setState({isShowCart: false})
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

  setCart = (good, num) => {

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

  render() {
    const {theme, menu_cart, full_logo_goods} = this.props
    const {goods, curGood, isShowOptions, isShowDetail, stanInfo, curCart,
      propertyTagIndex, optionalTagIndex, isShowCart} = this.state
    const carts = (this.props.carts[(this.$router.params.id)] || []).filter(item => item.fs_id)

    return (
      goods.length > 0 ?
        <View className='present-good'>
          <Image className='banner' src={full_logo_goods}/>

          <View className='good-list'>
            {
              goods.map((good, i) => {
                const cartGood = carts.find(item => item.g_id === good.g_id)
                return (
                  <View className='good' key={i} onClick={this.showDetail.bind(this, good)}>
                    <View className='img-wrap'>
                      {
                        good.tag_name &&
                        <Text style={{backgroundColor: good.tag_color}} className={classnames('tag', 'theme-grad-bg-' + theme)}>{good.tag_name}</Text>
                      }
                      <Image src={good.g_image_100}/>
                    </View>
                    <View className='info'>
                      <View className='name'>{good.g_title}</View>
                      <View className='pre-price'>&yen;{good.g_original_price}</View>
                      <View className='price'><Text>&yen;</Text>
                        <Text className='font-xin-normal'>{good.g_price}</Text>
                      </View>
                      <View className='handle' onClick={this.stopPropagation}>
                        {
                          good.g_combination === 1 &&
                          <Block>
                            {
                              good.g_has_norm === 1 && !cartGood ?
                                <Button
                                  onClick={this.openOptions.bind(this, good)}
                                  className={'theme-bg-' + theme}
                                >选规格</Button>
                                :
                                <Numbox
                                  num={cartGood.num}
                                  showNum={cartGood && cartGood.num !== 0}
                                  onReduce={this.setCart.bind(this, good, -1)}
                                  onAdd={this.setCart.bind(this, good, 1)}
                                />
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
            show={isShowOptions} title={curGood.g_title}
            blackTitle
            titleAlign='center' onHide={this.closeOptions.bind(this, curGood)}
          >
            <View className='option-modal-content'>
              <ScrollView scrollY>
                {
                  stanInfo.norm.optional.map((item, index) => (
                    <View className='block' key={index}>
                      <View className='name'>{item.title}</View>
                      <View className='options'>
                        {
                          item.list.map((option, i) => (
                            <View
                              onClick={this.selectTag.bind(this, 'optionalTagIndex', index, i)} key={i}
                              className={optionalTagIndex[index] === i ? 'active theme-grad-bg-' + theme : ''}
                            >{option.gn_name}</View>
                          ))
                        }
                      </View>
                    </View>
                  ))
                }
                {
                  stanInfo.property.map((item, index) => (
                    <View className='block' key={index}>
                      <View className='name'>{item.name}</View>
                      <View className='options'>
                        {
                          item.list_name.map((option, i) => (
                            <View
                              onClick={this.selectTag.bind(this, 'propertyTagIndex', index, i)} key={i}
                              className={propertyTagIndex[index] === i ? 'active theme-grad-bg-' + theme : ''}
                            >{option}</View>
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
                    <Text className='font-xin-normal'>
                      {
                        (+curGood.g_price + (stanInfo.norm &&
                          stanInfo.norm.optional.reduce((total, item, index) => {
                            total += +item.list[optionalTagIndex[index]].gn_price
                            return total
                          }, 0))).toFixed(2)
                      }
                    </Text>
                  </View>
                  <View className='pre-price'>
                    <Text>&yen;</Text>
                    {curGood.g_original_price}
                  </View>
                </View>
                {
                  (curCart.optionalstr !== (propertyTagIndex.join('') + optionalTagIndex.join('')) &&
                    !curCart.num || curCart.num === 0) ?
                    <Button
                      className={'theme-grad-bg-' + theme} onClick={this.setLocalCart.bind(this, 1)}
                    >
                      加入购物车
                    </Button>
                    :
                    <Numbox
                      num={curCart.num} showNum
                      onReduce={this.setLocalCart.bind(this, -1)}
                      onAdd={this.setLocalCart.bind(this, 1)}
                    />
                }
              </View>
            </View>
          </Modal>

          <Curtain show={isShowDetail} onCLose={this.closeDetail}>
            {
              curCart &&
              <View className='good-detail'>
                <View className='image-wrap'>
                  <Image src={curGood.g_image_300}/>
                </View>
                <View className='info'>
                  <View className='title'>
                    {
                      curGood.tag_name &&
                      <Text style={{backgroundColor: curGood.tag_color}} className={classnames('tag', 'theme-grad-bg-' + theme)}>{curGood.tag_name}</Text>
                    }
                    <Text className='name'>{curGood.g_title}</Text>
                  </View>
                  <View className='desc'>{curGood.g_description}</View>
                  <View className='price-wrap'>
                    <View className={classnames('price', 'theme-c-' + theme)}>
                      <Text>&yen;</Text>
                      <Text className='font-xin-normal'>{curGood.g_price}</Text>
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
                      <Numbox
                        num={curCart.num}
                        showNum
                        onReduce={this.setLocalCart.bind(this, -1)}
                        onAdd={this.setLocalCart.bind(this, 1)}
                      />
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
            }
          </Curtain>


          {
            isShowCart && carts.length > 0 &&
            <Text className='mask' onClick={this.closeCart} onTouchMove={this.stopPropagation} />
          }

          <View
            onTouchMove={this.stopPropagation}
            className={classnames('cart', isShowCart && carts.length > 0 ? 'active' : '')}>
            <View className='cart-head'>
              <Image src={require('../../assets/images/icon-trash.png')}/>
              <Text onClick={this.showOrHideCartWarn.bind(this, true)}>清空购物车</Text>
            </View>
            <ScrollView scrollY className='cart-list'>
              {
                carts.map((good, index) => (
                  good.num && good.num !== 0 &&
                  (
                    !good.optionalnumstr ?
                      <View className='item' key={index}>
                        <View class='item-left'>
                          <View className='name'>
                            {good.g_title}
                          </View>
                          <View className='param'>
                            {
                              good.property &&
                              good.property.map((prop, i) => (
                                <Text key={i}>
                                  {prop.list_name[good.propertyTagIndex[i]]}
                                  {i !== good.property.length - 1 ? '+' : ''}
                                </Text>
                              ))
                            }
                            {
                              good.property && good.property.length > 0 &&
                              good.optional && good.optional.length > 0 ? '+' : ''
                            }
                            {
                              good.optional &&
                              good.optional.map((opt, i) => (
                                <Text key={i}>
                                  {opt.list[good.optionalTagIndex[i]].gn_name}
                                  {i !== good.optional.length - 1 ? '+' : ''}
                                </Text>
                              ))
                            }
                          </View>
                        </View>
                        <View class='item-center'>
                          <Text className={'theme-c-' + theme}>&yen;
                            <Text className='font-xin-normal'>
                              {
                                (+good.g_price
                                  + (
                                    good.optional ?
                                      good.optional.reduce((total, item, i) => {
                                        return total += +item.list[good.optionalTagIndex[i]].gn_price
                                      }, 0)
                                      : 0
                                  )).toFixed(2)
                              }
                            </Text>
                          </Text>
                          {
                            good.g_original_price && (good.g_original_price - 0) !== 0 &&
                            <Text className='pre-price'>&yen;{good.g_original_price}</Text>
                          }
                        </View>

                        <Numbox
                          num={good.num} showNum
                          onReduce={this.setCart.bind(this, good, -1, good)}
                          onAdd={this.setCart.bind(this, good, 1)}
                        />
                      </View>
                      :
                      <View className='item' key={index}>
                        <View class='item-left'>
                          <View className='name'>
                            {good.g_title}
                          </View>
                          <View className='param'>
                            {
                              good.fixed ?
                                good.fixed.reduce((total, fix) => {
                                  total.push(`${fix.gn_name}(${fix.gn_num}份)`)

                                  return total
                                }, []).join('+') : ''
                            }
                            {
                              good.fixed.length > 0 && good.optional.length > 0 ? '+' : ''
                            }
                            {
                              good.optional ?
                                good.optional.reduce((total, opt) => {

                                  let str = opt.list.reduce((t, o) => {
                                    o.num && (t.push(`${o.gn_name}(${o.num}份)`))
                                    return t
                                  }, [])

                                  total.push(str.join('+'))

                                  return total
                                }, []).join('+') : ''
                            }
                          </View>
                        </View>
                        <View class='item-center'>
                          <Text className={'theme-c-' + theme}>&yen;
                            {good.total_price ? good.total_price.toFixed(2) : '0.00'}
                          </Text>
                        </View>

                        <Numbox
                          num={good.num} showNum
                          onReduce={this.setComboCart.bind(this, good, -1)}
                          onAdd={this.setComboCart.bind(this, good, 1)}
                        />
                      </View>
                  )
                ))
              }
            </ScrollView>

          </View>

          <PayBox
            present
            theme={theme} carts={carts} storeId={+this.$router.params.id}
            themeInfo={menu_cart}
            onOpenCart={this.ToggleShowCart}
          />

          <Button className={classnames('more', 'theme-c-' + theme,)} onClick={this.toShopIndex}>选购更多</Button>

        </View>
        :
        <Loading />
    )
  }
}

export default PresentGood
