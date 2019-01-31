import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import classnames from 'classnames'
import './index.less'


class Curtain extends Component {

  static defaultProps = {
    show: false,
    onCLose: null
  }

  stopPro = e => {
    e.stopPropagation()
  }

  render () {
    const {show} = this.props
    return (
      <View
        className={classnames('curtain', show ? 'active' : '')}
        onClick={this.props.onClose}
        onTouchMove={this.stopPro}
      >
        <View className='content'>
          <View className='curtain-body' onClick={this.stopPro}>
            {this.props.children}

            <View className='icon' onClick={this.props.onClose}>
              <AtIcon value='close-circle' size='36' />
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Curtain
