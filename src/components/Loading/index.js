import Taro, {Component} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'

import './index.less'

class Loading extends Component {

  static defaultProps = {
    show: false
  }

  render () {

    return (
      <View className='loading'>
        <Image src={require('../../assets/images/icon-loading.gif')} />
      </View>
    )
  }
}

export default Loading
