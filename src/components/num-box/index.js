import Taro, {Component} from '@tarojs/taro'
import {View, Text, Block} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'

import './index.less'
import '../../app.less'

@connect(({common, cart}) => ({...common, ...cart}))
class Numbox extends Component {

  render () {
    const {theme, showNum, num, onAdd, onReduce} = this.props
    return (
      <View className='num-box'>
        {
          showNum &&
          <Block>
            <View
              onClick={onReduce}
              className='icon-reduce'
            >-</View>
            <Text className='num'>{num}</Text>
          </Block>
        }
        <View
          onClick={onAdd}
          className={classnames('add-circle', 'theme-bg-' + theme)}>
          +
        </View>
      </View>
    )
  }
}

export default Numbox
