import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, Swiper, SwiperItem, ScrollView, Block} from '@tarojs/components'
import {AtToast, AtCurtain} from 'taro-ui'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import Modal from '../../components/modal'
import PayBox from '../../components/pay-box'
import ConfirmModal from '../../components/confirm-modal'
import Loading from '../../components/Loading'
import Numbox from '../../components/num-box'
import Curtain from '../../components/curtain'
import './index.less'
import IdButton from "../../components/id-button/index";


@connect(({common, cart}) => ({...common, ...cart}))
class ShopIndex extends Component {

  config = {
    navigationBarTitleText: '商品列表',
    disableScroll: true
  }

  state = {
    group: null,
    curGroupId: '',
    curGroupGoodId: '',
    curClassifyIndex: 0,
    isShowCart: false,
    isGoodNull: false,
    isShowDetail: false,
    isShowOptions: false,
    isShowCartWarn: false,
    curCart: {},
    curGood: {},
    stanInfo: {},
    propertyTagIndex: [],
    optionalTagIndex: [],
    scrollCurGroupId: '',
  }

  componentWillMount() {
    this.setState({isShowCart: !!this.$router.params.showcart})
    const id = +this.$router.params.id

    !this.$router.params.fs_id &&
    this.props.carts[id] &&
    this.props.dispatch({
      type: 'cart/clearPresentCart',
      payload: {
        id
      }
    })
  }

  componentDidShow() {
    this.getGoodsList()
  }

  getGoodsList = () => {
    this.props.dispatch({
      type: 'shop/getGoodsList',
      payload: {
        store_id: +this.$router.params.id
      }
    }).then(({group}) => {
      if (!group || group.length === 0) {
        Taro.showToast({
          title: '当前店铺尚未上架任何商品!',
          icon: 'none'
        })

        setTimeout(() => {
          Taro.navigateBack()
        }, 2500)

        return
      }

      this.setState({
        group
      }, this.calcAsideSize)

      this.goodPosition = []
      for (let i = 0; i < group.length; i++) {
        let height = 34 + 96 * group[i].goods_list.length
        let top = i === 0 ? 0 : this.goodPosition[i - 1].bottom
        this.goodPosition.push({
          group_id: group[i].group_id,
          index: i,
          top,
          bottom: top + height
        })
      }
    })
  }

  /**
   * 计算左侧总高度和单个项高度
   * */
  calcAsideSize = () => {
    const {group} = this.state

    if (group.length === 0) return

    if (!this.asideHeiInfo) {
      this.asideHeiInfo = {}
      let query = Taro.createSelectorQuery()
      query.select('#aside-scroll').boundingClientRect()
        .exec(res => {
          this.asideHeiInfo.wrapHeight = res[0].height
        })

      query.select('#asid-' + group[0].group_id).boundingClientRect()
        .exec(res => {
          this.asideHeiInfo.itemHeight = res[1].height
        })
    }
  }

  changeClassify = (index, scrollGood = true) => {

    const {group} = this.state

    const {wrapHeight, itemHeight} = this.asideHeiInfo
    const asideScrollTop = this.asideScrollTop || 0
    const itemNums = Math.ceil(wrapHeight / itemHeight)
    let curGroupId

    if (index === 0) {
      curGroupId = 'asid-' + group[0].group_id
    } else if ((index - 1) * itemHeight <= asideScrollTop) {
      curGroupId = 'asid-' + group[index - 1].group_id
    } else if ((index + 2) * itemHeight > (asideScrollTop + wrapHeight) && index > itemNums - 3) {
      curGroupId = 'asid-' + group[index - itemNums + 3].group_id
    }

    this.setState({
      curClassifyIndex: index,
      curGroupId,
    })

    if (scrollGood) {
      this.setState({
        curGroupGoodId: 'id' + this.state.group[index].group_id,
        scrollCurGroupId: null
      })
      this.curGroupGoodId = this.state.group[index].group_id
    }

  }

  ToggleShowCart = () => {
    this.setState({isShowCart: !this.state.isShowCart})
  }

  closeCart = () => {
    this.setState({isShowCart: false})
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
      curGood: good,
    })
    Taro.showNavigationBarLoading()
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
        !item.fs_id &&
        (item.g_id === good.g_id) && (item.optionalstr === optionalstr)
      ))
      const curCart = JSON.parse(JSON.stringify(cartsAlike || {}))

      this.setState({
        isShowOptions: true,
        stanInfo: res,
        curCart,
        propertyTagIndex,
        optionalTagIndex,
      }, Taro.hideNavigationBarLoading)

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
    this.setState({[key]: stan}, this.setCurCart)
  }

  setCurCart = () => {
    const {propertyTagIndex, optionalTagIndex, curGood} = this.state

    const carts = this.props.carts[(+this.$router.params.id)] || []
    const optionalstr = propertyTagIndex.join('') + optionalTagIndex.join('')
    const cartsAlike = carts.find(item => (
      (item.g_id === curGood.g_id) && (item.optionalstr === optionalstr)
    ))
    const curCart = JSON.parse(JSON.stringify(cartsAlike || {}))

    this.setState({curCart})
  }

  toChooseStan = () => {
    this.setState({isShowDetail: false})
    this.openOptions(this.state.curGood)
  }

  setCart = (good, num, cartGood) => {
    if (num === -1 && (!cartGood.num || cartGood.num <= 0)) return

    this.props.dispatch({
      type: 'cart/setCart',
      payload: {
        id: +this.$router.params.id,
        good: {
          ...good,
          again_id: undefined,
        },
        num
      }
    })

    this.setCurCart()
  }

  setComboCart = (good, num) => {
    this.props.dispatch({
      type: 'cart/setComboCart',
      payload: {
        id: +this.$router.params.id,
        good,
        num
      }
    })
    this.setCurCart()
  }


  setLocalCart = num => {
    const {curGood, stanInfo, propertyTagIndex, optionalTagIndex} = this.state
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
      ...normInfo
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

  toStandardDetail = (good) => {
    this.setState({isShowDetail: false})
    Taro.navigateTo({
      url: `/pages/standard-detail/index?store_id=${this.$router.params.id}&id=${good.g_id}&name=${good.g_title}&g_price=${good.g_price}`
    })
  }

  stopPropagation = e => {
    e.stopPropagation()
  }

  asideScroll = e => {
    this.asideScrollTop = e.detail.scrollTop
  }

  goodScroll = e => {
    const fix = e.detail.scrollHeight / (this.goodPosition[this.goodPosition.length - 1].bottom + 105)

    if (e.detail.scrollTop + this.asideHeiInfo.wrapHeight > e.detail.scrollHeight) return
    this.goodPosition.map(item => {
      if (e.detail.scrollTop >= Math.floor(item.top * fix) && e.detail.scrollTop < (item.bottom) * fix) {
        if (this.curGroupGoodId !== this.state.group[item.index].group_id) {
          this.setState({
            scrollCurGroupId: item.group_id,
          })
        } else{
          this.curGroupGoodId = null
        }
        this.changeClassify(item.index, false)
      }
    })
  }

  handlePay = () => {
    this.setState({isShowOptions: false})
  }


  render() {
    const {theme, menu_banner, menu_cart} = this.props
    const {id, fs_id} = this.$router.params
    const carts = (this.props.carts[+id] || []).filter(item => !item.fs_id || item.fs_id === +fs_id)

    const {
      group, curClassifyIndex, isShowCart, isGoodNull,
      isShowDetail, isShowOptions, curGroupId, curGood, curCart,
      curGroupGoodId, isShowCartWarn, stanInfo, propertyTagIndex,
      optionalTagIndex, scrollCurGroupId
    } = this.state

    return (
      group ?
      <View className='shop-index'>
        <View className='banner'>
          <Swiper
            indicatorColor='#999'
            indicatorActiveColor='#f00'
            previous-margin='12px'
            next-margin='12px'
            circular
            autoplay={menu_banner.auto_play != 0}
            interval={menu_banner.auto_play == 0 ? 5000 : menu_banner.auto_play * 1000}
          >
            {
              menu_banner.banner.map((img, index) => (
                <SwiperItem className='swiper-item' key={index}>
                  <View>
                    <Image className='swiper-img' src={img.image || ''}/>
                  </View>
                </SwiperItem>
              ))
            }

          </Swiper>
        </View>

        {
          group && group.length &&
          <View className='menu'>
            <View className='aside'>
              <ScrollView
                scrollWithAnimation
                scrollY className='item-wrap'
                onScroll={this.asideScroll} scrollIntoView={curGroupId}
                id='aside-scroll'>
                <View className='bg-alias'>
                  {
                    group.map((classify, index) => (
                      <View key={index}/>
                    ))
                  }
                </View>
                {
                  group.map((classify, index) => (
                    <View
                      className={classnames('item', index === curClassifyIndex ? 'active' : '',
                        index === curClassifyIndex - 1 ? 'pre-active' : '',
                        index === curClassifyIndex + 1 ? 'af-active' : '')}
                      onClick={this.changeClassify.bind(this, index)}
                      key={index} id={'asid-' + classify.group_id}
                    >
                      <View>
                        <Image src={classify.gg_image || ''}/>
                        <Text>{classify.gg_name}</Text>
                      </View>
                    </View>
                  ))
                }
                <View className='null-block'/>
              </ScrollView>
            </View>
            <ScrollView
              scrollWithAnimation
              className='content'
              scrollY scrollIntoView={curGroupGoodId}
              onScroll={this.goodScroll}
            >
              {
                group.map((classify, index) => (
                  <View className='good-block' key={index} id={'id' + classify.group_id}>
                    <View className='title' id={'title-' + classify.group_id}>
                      <View className={scrollCurGroupId === classify.group_id ? 'top-show' : ''}
                        style={{zIndex: 20 + index}}
                      >
                        <Image src={classify.gg_image || ''}/>
                        <Text>{classify.gg_name}</Text>
                      </View>
                    </View>
                    <View className='good-list'>
                      {
                        classify.goods_list.map((good, i) => {
                          const cartGood = carts.find(item => !item.fs_id && (item.g_id === good.g_id))
                          return (
                            <View className='good' key={i}>
                              <View className='img-wrap' onClick={this.showDetail.bind(this, good)}>
                                {
                                  good.tag_name &&
                                  <Text className={classnames('tag')} style={{background: good.tag_color}}>{good.tag_name}</Text>
                                }
                                <Image src={good.g_image_100 || ''}/>
                              </View>
                              <View className='info'>
                                <View className='name'>
                                  <Text onClick={this.showDetail.bind(this, good)}>{good.g_title}</Text>
                                </View>
                                <View
                                  className='pre-price' style={{visibility: +good.g_original_price !== 0 ? 'visible' : 'hidden'}}
                                >
                                  &yen;{good.g_original_price}
                                </View>
                                <View className='price'><Text>&yen;</Text>
                                  <Text className='font-xin-normal'>{good.g_price}</Text>
                                </View>
                                <View className='handle' onClick={this.stopPropagation}>
                                  {
                                    good.g_combination === 1 &&
                                    <Block>
                                      {
                                        good.g_has_norm === 2 &&
                                        <Numbox
                                          num={cartGood.num}
                                          showNum={cartGood && cartGood.num !== 0}
                                          onReduce={this.this.setCart.bind(this, good, -1, cartGood)}
                                          onAdd={this.setCart.bind(this, good, 1)}
                                        />
                                      }
                                      {
                                        good.g_has_norm === 1 &&
                                        <IdButton onClick={this.openOptions.bind(this, good)}
                                                className={'theme-bg-' + theme}
                                        >选规格</IdButton>
                                      }
                                    </Block>
                                  }

                                  {
                                    good.g_combination === 2 &&
                                    <IdButton onClick={this.toStandardDetail.bind(this, good)}
                                            className={'theme-bg-' + theme}
                                    >选规格</IdButton>
                                  }
                                </View>
                              </View>
                            </View>
                          )
                        })
                      }

                    </View>
                  </View>
                ))
              }
            </ScrollView>
          </View>
        }

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
                    <Text className={classnames('tag', 'theme-grad-bg-' + theme)}>{curGood.tag_name}</Text>
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
                    <IdButton
                      className={'theme-grad-bg-' + theme} onClick={this.setLocalCart.bind(this, 1)}
                    >
                      加入购物车
                    </IdButton>
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
                    <IdButton
                      className={'theme-grad-bg-' + theme} onClick={this.toChooseStan}
                    >
                      选规格
                    </IdButton>
                  }

                  {
                    curGood.g_combination === 2 &&
                    <IdButton
                      className={'theme-grad-bg-' + theme} onClick={this.toStandardDetail.bind(this, curGood)}
                    >
                      选规格
                    </IdButton>
                  }

                </View>
              </View>
            </View>
          }
        </Curtain>

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
                <IdButton
                  className={'theme-grad-bg-' + theme} onClick={this.setLocalCart.bind(this, 1)}
                >
                  加入购物车
                </IdButton>
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

        <PayBox
          theme={theme} carts={carts} storeId={+this.$router.params.id}
          themeInfo={menu_cart}
          onPay={this.handlePay}
          onOpenCart={this.ToggleShowCart}
        />

        <ConfirmModal
          show={isShowCartWarn}
          className='clear-cart-modal'
          theme={theme}
          title=''
          onCancel={this.showOrHideCartWarn.bind(this, false)}
          onOk={this.clearCart}
        >
          清空购物车?
        </ConfirmModal>

        <AtToast
          className='null-toast'
          isOpened={isGoodNull} hasMask
          text='部分原商品已下架，请重新挑选'/>

      </View>

      :
      <Loading />
    )
  }
}

export default ShopIndex
