import Taro, {Component} from '@tarojs/taro'
import {connect} from '@tarojs/redux'
import {View, Text, Button, Map, ScrollView, Input, Block} from '@tarojs/components'
import {AtIcon, AtIndexes} from 'taro-ui'
import classnames from 'classnames'
import ConfirmModal from '../../components/confirm-modal'
import IdButton from '../../components/id-button'

import {mapKey, warningDistance, baseUrl} from '../../config'
import amapFile from '../../utils/amap-wx'
import Citys from '../../utils/citys'

import './index.less'

@connect(({common}) => ({
  ...common
}))
class Choose extends Component {

  state = {
    locationCity: '',
    city: '',
    location: '',
    longitude: '',
    latitude: '',
    isShowCitys: false,
    isSearching: false,
    isShowDistanceWarn: false,
    isShowNullWarn: false,
    isShowMap: true,
    keyword: '',
    markers: [],
    store: [],
    storeFilter: [],
    selectedStoreIndex: 0,
    warnDistance: '',
    scrollStoreId: ''
  }

  componentWillMount() {
    this.myAmapFun = new amapFile.AMapWX({key: mapKey})

    let _this = this
    this.myAmapFun.getRegeo({
      success(data) {
        let addressInfo = data[0].regeocodeData.addressComponent
        let locationCity = addressInfo.city.replace('市', '')
        let location = addressInfo.streetNumber.location
        let [longitude, latitude] = location.split(',')
        _this.setState({location, longitude, latitude, locationCity}, () => {
          _this.getStoreList()
        })

        _this.props.dispatch({
          type: 'common/setLocalInfo',
          payload: {location, longitude, latitude, locationCity}
        })

      }
    })

  }

  componentDidShow() {
    // this.state.longitude && this.getStoreList()
  }

  toggleShowCitys = () => {
    this.setState({
      isShowCitys: !this.state.isShowCitys
    })
  }

  getStoreList = () => {

    const {longitude, latitude, city, locationCity, keyword} = this.state

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
      })

      this.showShopMakers(res)
    })
  }

  chooseCity = city => {
    this.setState({
      isShowCitys: false,
      city: city.name
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
      keywordTips: []
    })
  }

  chooseTip = (tip) => {
    if (typeof tip.location === 'string') {
      let {id, name} = tip
      let [longitude, latitude] = tip.location.split(',')

      this.setState({
        longitude,
        latitude,
        isSearching: false,
        keyword: name,
        markers: [{
          longitude,
          latitude,
          id,
          title: name,
          callout: {
            content: name,
            fontSize: 50,
            display: 'ALWAYS'
          }
        }]
      })
    } else {
      let markers = []
      this.state.keywordTips.map((item) => {
        if (typeof item.location === 'string') {
          let {id, name} = item
          let [longitude, latitude] = item.location.split(',')
          markers.push({
            longitude,
            latitude,
            id,
            title: name,
            callout: {
              content: name,
              fontSize: 50,
              display: 'ALWAYS'
            }
          })
        }
      })
      this.setState({
        isSearching: false,
        keyword: tip.name,
        markers
      })
    }
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
        this.toStandardPage()
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
      this.toStandardPage()
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

  toStandardPage = () => {
    const {store, selectedStoreIndex} = this.state
    const id = store[selectedStoreIndex].s_id
    Taro.navigateTo({
      url: '/pages/standard-detail/index?id=' + id
    })
  }

  calcDistance = (loca) => {
    if (typeof loca !== 'string') return ''
    let [lng1, lat1] = this.state.location.split(',')
    let [lng2, lat2] = loca.split(',')
    let rad1 = lat1 * Math.PI / 180.0;
    let rad2 = lat2 * Math.PI / 180.0;
    let a = rad1 - rad2;
    let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let r = 6378137;
    return ((r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))) / 1000).toFixed(1)

  }

  render() {
    const {theme} = this.props

    const {
      keyword, longitude, latitude, city, locationCity,
      isShowCitys, isSearching, markers,
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
        <View className='select-city' style={{display: isShowCitys ? 'block' : 'none'}}>
          <AtIndexes list={Citys} topKey='' onClick={this.chooseCity}>
            <View className='city-block' id='local'>
              <View className='title'>当前定位城市</View>
              <View className='item'>{locationCity}</View>
              <View className='re-position'>重新定位</View>
            </View>
          </AtIndexes>
        </View>
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
          !isSearching &&

          <Block>
            <Map
              style={{display: isShowCitys || !isShowMap ? 'none' : 'block'}}
              className='map'
              latitude={latitude}
              longitude={longitude}
              markers={markers}
              onMarkerTap={this.handleMarkerClick}
              showLocation
            />
            <View className='hide-map' onClick={this.toggleShowMap}><Text/></View>
            <ScrollView
              scrollY scrollIntoView={scrollStoreId}
              className={classnames('shop-list', isIphoneX ? 'iphonex' : '', !isShowMap ? 'long' : '')}>
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
                      <View className='info'>
                        <View>营业时间：{item.s_open_start}-{item.s_open_end}</View>
                        <View>门店电话：{item.s_telephone}</View>
                      </View>
                      {
                        selectedStoreIndex === index &&
                        <IdButton
                          className={'theme-grad-bg-' + theme}
                          disabled={item.s_business === 2}
                          onClick={this.startOrder.bind(this, item)}
                        >开始下单</IdButton>
                      }

                    </View>
                  )

                })
              }
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

      </View>
    )
  }
}

export default Choose
