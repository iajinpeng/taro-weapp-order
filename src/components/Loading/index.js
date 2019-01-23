import Taro, {Component} from '@tarojs/taro'
import {CoverView, CoverImage} from '@tarojs/components'

import './index.less'

class Loading extends Component {

  static defaultProps = {
    show: false
  }

  render () {

    return (
      <CoverView className='loading'>
        <CoverImage src={require('../../images/icon-loading.gif')} />
      </CoverView>
    )
  }
}

export default Loading
