import Taro, {Component} from '@tarojs/taro'
import {connect} from '@tarojs/redux'
import {View, Text, Map, ScrollView, Input, Block} from '@tarojs/components'
import {AtIcon, AtIndexes} from 'taro-ui'
import classnames from 'classnames'
import ConfirmModal from '../../components/confirm-modal'
import IdButton from '../../components/id-button'
import Copyright from '../../components/copyright'
import Loading from '../../components/Loading'

import {warningDistance, baseUrl} from '../../config'
import Citys from '../../utils/citys'

import './index.less'

@connect(({common}) => ({
  ...common
}))
class Choose extends Component {

  config = {
    navigationBarTitleText: '选择餐厅',
    disableScroll: true
  }

  state = {
    city: '',
    isShowCitys: false,
    isSearching: false,
    isShowDistanceWarn: false,
    isShowNullWarn: false,
    isShowMap: true,
    isRenderCity: false,
    isShowLoading: false,
    keyword: '',
    markers: [],
    store: [],
    storeFilter: [],
    selectedStoreIndex: 0,
    warnDistance: '',
    scrollStoreId: '',
    longitude: '',
    latitude: '',
  }

  componentWillMount() {
    this.getStoreList()

    setTimeout(() => {
      this.setState({isRenderCity: true})
    }, 3000)
  }

  componentDidShow() {

  }

  toggleShowCitys = () => {
    this.setState({
      isShowCitys: !this.state.isShowCitys
    })
  }

  getStoreList = () => {

    const {longitude, latitude, locationCity} = this.props.localInfo
    const {keyword, city} = this.state

    this.setState({isShowLoading: true})
    this.props.dispatch({
      type: 'shop/getStoreList',
      payload: {
        lat: latitude,
        lng: longitude,
        city: city || locationCity,
        keyword
      }
    }).then(res => {
      this.setState({
        store: res.store,
        isShowNullWarn: res.store.length === 0
      }, () => {
        this.setState({isShowLoading: false})
      })

      this.showShopMakers(res)

    })
  }

  chooseCity = city => {
    this.setState({
      isShowCitys: false,
      city: city.name
    }, () => {
      this.getStoreList()
    })
  }

  reLocation = e => {
    e.stopPropagation()
    this.props.dispatch({
      type: 'common/getSetLocalInfo'
    })
  }

  inputChange = e => {
    let value = e.target.value

    let storeFilter = this.state.store.filter(item => (
      item.s_title.indexOf(value) > -1 || item.s_province.indexOf(value) > -1 ||
      item.s_city.indexOf(value) > -1 || item.s_area.indexOf(value) > -1 ||
      item.s_address.indexOf(value) > -1
    ))

    this.setState({
      keyword: value,
      storeFilter
    })

  }

  toSearch = () => {
    this.setState({
      isShowCitys: false,
      isSearching: true,
      storeFilter: this.state.store
    })
  }

  cacelSearch = () => {
    this.setState({
      keyword: '',
      isSearching: false,
    })
  }

  showShopMakers = ({brand, store}) => {
    if (store.length === 0) return

    let markers = []

    store.map(item => {
      markers.push({
        iconPath: baseUrl + brand.b_logo,
        width: 40,
        height: 40,
        longitude: item.s_address_lng,
        latitude: item.s_address_lat,
        id: item.s_id,
        title: item.s_title,
        callout: {
          content: item.s_title,
          fontSize: 12,
          padding: 8,
          display: 'ALWAYS',
          // bgColor: 'transparent',
          borderRadius: 4
        }
      })
    })
    let latitude = store[0].s_address_lat
    let longitude = store[0].s_address_lng
    this.setState({
      markers,
      latitude,
      longitude
    })
  }

  startOrder = store => {
    if (store.distance > warningDistance) {
      this.setState({
        warnDistance: (store.distance / 1000).toFixed(2),
        isShowDistanceWarn: true
      })
    } else {
      if (this.$router.params.type) {
        this.toPresentPage()
      } else {
        this.toShopIndex()
      }
    }

  }

  selectShop = (item, index) => {
    this.setState({
      selectedStoreIndex: index,
      scrollStoreId: 'id' + item.s_id,
      longitude: item.s_address_lng,
      latitude: item.s_address_lat,
      isSearching: false
    })
  }

  confirmOrder = () => {
    if (this.$router.params.type) {
      this.toPresentPage()
    } else {
      this.toShopIndex()
    }
    this.showOrHideDistanceWarn(false)
  }

  showOrHideDistanceWarn = bool => {
    this.setState({isShowDistanceWarn: bool})
  }

  showOrHideNullWarn = bool => {
    this.setState({isShowNullWarn: bool})
  }

  toggleShowMap = () => {
    this.setState({isShowMap: !this.state.isShowMap})
  }

  handleMarkerClick = ({markerId}) => {
    let store = this.state.store.find(item => item.s_id === markerId)

    store.s_business !== 2 && this.startOrder(store)
  }

  toShopIndex = () => {
    const {store, selectedStoreIndex} = this.state
    const id = store[selectedStoreIndex].s_id

    Taro.navigateTo({
      url: '/pages/shop-index/index?id=' + id
    })
  }

  toPresentPage = () => {
    const {store, selectedStoreIndex} = this.state
    const id = store[selectedStoreIndex].s_id
    Taro.navigateTo({
      url: '/pages/present-good/index?id=' + id
    })
  }


  render() {
    const {theme, localInfo: {locationCity}} = this.props

    const {longitude, latitude} = this.state

    const {
      keyword, city, isShowLoading,
      isShowCitys, isSearching, markers, isRenderCity,
      store, selectedStoreIndex, isShowDistanceWarn, warnDistance,
      isShowNullWarn, isShowMap, scrollStoreId, storeFilter
    } = this.state

    const isIphoneX = !!(this.props.systemInfo.model &&
      this.props.systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    return (
      <View className='choose-page'>
        <View className='header'>
          {
            !isSearching &&
            <Block>
              <View
                className='city'
                onClick={this.toggleShowCitys}
              >{city || locationCity || '定位中...'}
                <AtIcon value={isShowCitys ? 'chevron-up' : 'chevron-down'} size='18'/>
              </View>
              <View className={classnames('search-box', isSearching ? 'full' : '')}>
                <AtIcon value='search' className='icon' size='16'/>
                <View className='input-alias' onClick={this.toSearch}>搜索餐厅</View>
                <AtIcon value='close' className='search-cancel' size='14'/>
              </View>
            </Block>
          }
          {
            isSearching &&
            <View className={classnames('search-box', isSearching ? 'full' : '')}>
              <AtIcon value='search' className='icon' size='16'/>
              <Input
                focus placeholderClass='placeholder'
                placeholder='搜索餐厅' value={keyword}
                onInput={this.inputChange}
              />
              <AtIcon
                value='close'
                className='search-cancel' size='14' onClick={this.cacelSearch}
              />
            </View>
          }
        </View>
        {
          isRenderCity &&
          <View className='select-city' style={{display: isShowCitys ? 'block' : 'none'}}>
            <AtIndexes list={Citys} topKey='' onClick={this.chooseCity} animation>
              <View className='city-block' id='local' onClick={this.chooseCity.bind(this, {name: locationCity})}>
                <View className='title'>当前定位城市</View>
                <View className='item'>{locationCity}</View>
                <View className='re-position' onClick={this.reLocation}>重新定位</View>
              </View>
            </AtIndexes>
          </View>
        }
        {
          isSearching &&
          <ScrollView
            className='keyword-tips' scrollY
            scrollWithAnimation
          >
            {
              storeFilter.map((s, i) => (
                <View className='item' key={s.s_id} onClick={this.selectShop.bind(this, s, i)}>
                  <View className='name'>{s.s_title}</View>
                  <View className='address'>{s.s_address}</View>
                  <Text className='distance'>{(s.distance / 1000).toFixed(2)}KM</Text>
                </View>
              ))
            }
          </ScrollView>
        }


        {
          !isSearching && store.length > 0 &&

          <Block>
            {
              !isShowCitys && isShowMap &&
              <Map
                className='map'
                latitude={latitude}
                longitude={longitude}
                markers={markers}
                onMarkerTap={this.handleMarkerClick}
                showLocation
              />
            }
            <View className='hide-map' onClick={this.toggleShowMap}><Text/></View>
            <ScrollView scrollWithAnimation
              scrollY scrollIntoView={scrollStoreId}
              className={classnames('shop-list', isIphoneX ? 'iphonex' : '', !isShowMap ? 'long' : '')}>
              <View className='wrap'>
                {
                  store.map((item, index) => {
                    const isShowTheme = item.s_business === 1 && selectedStoreIndex === index
                    const theme_c = isShowTheme ? 'theme-c-' + theme : ''
                    const theme_bd = isShowTheme ? 'theme-bd-' + theme : ''

                    return (
                      <View id={'id' + item.s_id}
                        className='shop-item' key={index} onClick={this.selectShop.bind(this, item, index)}>
                        <View className='title'>
                          <View>
                            <Text className={classnames('name', theme_c)}>{item.s_title}</Text>
                            {
                              item.s_business === 1 &&
                              <Block>
                                {
                                  item.s_take.indexOf('1') > -1 &&
                                  <Text className={classnames('tag', theme_c, theme_bd)}>可自取</Text>
                                }
                                {
                                  item.s_take.indexOf('3') > -1 &&
                                  <Text className={classnames('tag', theme_c, theme_bd)}>可外送</Text>
                                }
                              </Block>
                            }
                            {
                              item.s_business === 2 &&
                              <Text className='tag'>休息中</Text>
                            }
                          </View>
                          <Text className={classnames('distance', theme_c)}>
                            {(item.distance / 1000).toFixed(2)}KM</Text>
                        </View>
                        <View className='address'>{item.s_city}{item.s_area}{item.s_address}</View>
                        {
                          selectedStoreIndex === index &&

                          <Block>
                            <View className='info'>
                              <View>营业时间：{item.s_open_start}-{item.s_open_end}</View>
                              <View>门店电话：{item.s_telephone}</View>
                            </View>
                            <IdButton
                              className={'theme-grad-bg-' + theme}
                              disabled={item.s_business === 2}
                              onClick={this.startOrder.bind(this, item)}
                            >开始下单</IdButton>
                          </Block>

                        }

                      </View>
                    )

                  })
                }
                <View className='alias-space' />
                {
                  store.length > 0 &&
                  <Copyright />
                }
              </View>

            </ScrollView>
          </Block>

        }

        <ConfirmModal
          show={isShowDistanceWarn}
          theme={theme}
          warnDistance={warnDistance}
          onCancel={this.showOrHideDistanceWarn.bind(this, false)}
          onOk={this.confirmOrder}
        >
        </ConfirmModal>

        <ConfirmModal
          show={isShowNullWarn}
          type={2}
          theme={theme}
          onCancel={this.showOrHideNullWarn.bind(this, false)}
        >
          当前城市还没有门店！敬请期待。
        </ConfirmModal>

        <Loading show={isShowLoading} />

      </View>
    )
  }
}

export default Choose
