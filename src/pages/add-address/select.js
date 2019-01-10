import Taro, {Component} from '@tarojs/taro'
import {View, Button, Input, Map, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './select.less'

import {mapKey} from '../../config'
import amapFile from '../../utils/amap-wx'

@connect(({common}) => ({...common}))
class SelectAddress extends Component {

  config = {
    // navigationStyle: 'custom',
  }

  state = {
    poisData: [],
    isSearch: false,
    querykeywords: '',
    curIndex: 0,
    lat: '',
    lng: ''
  }

  componentDidMount () {
    this.myAmapFun = new amapFile.AMapWX({key: mapKey})
    this.getRoundPois()
  }

  toSearch = () => {
    this.setState({isSearch: true})
  }

  getRoundPois = () => {
    const {querykeywords} = this.state
    const _this = this
    this.myAmapFun.getPoiAround({
      querytypes: '120000|100000',
      querykeywords,
      success({poisData}) {
        _this.setState({
          poisData,
          curIndex: 0
        })
      }
    })
  }

  cacelSearch = (e) => {
    e.stopPropagation()
    this.setState({isSearch: false})
  }

  typeInSearch = e => {
    this.setState({querykeywords: e.target.value}, () => {
      this.getRoundPois()
    })
  }


  selectItem = (item, i) => {
    const [lng, lat] = item.location.split(',')
    this.setState({
      curIndex: i,
      lng,
      lat
    })
  }

  pageConfirm = () => {
    const {poisData, curIndex} = this.state
    this.props.dispatch({
      type: 'address/curAddress',
      payload: poisData[curIndex]
    })
    Taro.navigateBack()
  }

  pageCacel = () => {
    Taro.navigateBack()
  }

  render () {
    const {theme, localInfo: {longitude, latitude}} = this.props
    const {poisData, isSearch, querykeywords, curIndex, lat, lng} = this.state

    const isIphoneX = !!(this.props.systemInfo.model &&
      this.props.systemInfo.model.replace(' ', '').toLowerCase().indexOf('iphonex') > -1)

    return (
      <View className='choose-addr'>
        <View className={classnames('header', isIphoneX ? 'iphonex' : '', isSearch ? 'isSearch' : '')}>
          <Button onClick={this.pageCacel} className='cacel'>取消</Button>
          <Button onClick={this.pageConfirm} className={classnames('ok', 'theme-bg-' + theme)}>确定</Button>
        </View>
        <View
          className={classnames('search-wrap', isIphoneX ? 'iphonex' : '', isSearch ? 'isSearch' : '')}
          onClick={this.toSearch}
        >
          <View className='search-box'>
            <View className='search'><AtIcon value='search' size='18' />
              {
                isSearch ?
                <Input focus
                  type='text' value={querykeywords} placeholder='搜索地点'
                  onChange={this.typeInSearch}
                />
                  :
                  <View className='input-alias'>搜索地点</View>
              }
            </View>
          </View>
          {
            isSearch &&
            <View className='cacel' onClick={this.cacelSearch}>取消</View>
          }
        </View>
        <Map
          className='map'
          showLocation
          latitude={lat || latitude}
          longitude={lng || longitude}
        />
        <ScrollView scrollY className='list'>
          {
            poisData.map((poi, index) => (
              <View className='item' key={index} onClick={this.selectItem.bind(this, poi, index)}>
                <View className='name'>{poi.name}</View>
                <View className='addr'>
                  {poi.pname + poi.cityname + poi.adname + poi.address}
                </View>

                {
                  curIndex === index &&
                  <View className={classnames('check', 'theme-c-' + theme)}>
                    <AtIcon value='check' size='20' />
                  </View>
                }
              </View>
            ))
          }
        </ScrollView>
      </View>
    )
  }
}

export default SelectAddress
