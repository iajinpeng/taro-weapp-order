import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'

import './index.less'

@connect(({common}) => ({...common}))
class PresentGood extends Component {
  config = {
    navigationBarTitleText: '满单即送'
  }

  componentDidShow () {

  }

  getPresentGood = () => {
    this.props.dispatch({
      type: 'shop/getPresentGood',
      payload: {
        store_id: 2
      }
    })
  }

  render () {
    return (
      <View className='present-good'>
        <View className="banner"> tupian</View>
      </View>
    )
  }
}

export default PresentGood
