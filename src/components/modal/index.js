import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {connect} from '@tarojs/redux'
import { AtIcon } from 'taro-ui'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'

@connect(({common}) => ({...common}))
class Modal extends Component {

  static propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    show: PropTypes.bool,
    onHide: PropTypes.func,
    titleAlign: PropTypes.string,
  }

  static defaultProps = {
    title: '',
    className: '',
    show: false,
    onHide: null,
    titleAlign: 'left',
    blackTitle: false
  }

  stopPro = e => {
    e.stopPropagation()
  }

  render () {
    const { title, className, show, titleAlign, theme, blackTitle } = this.props
    return (
      <View
        className={classnames('modal-wrap', show ? 'modal-fade' : '')}
        onClick={this.props.onHide}
        onTouchMove={this.stopPro}
      >
        <View className='modal-wrap-inner'>
          <View className={classnames('modal', className)} onClick={this.stopPro}>
            <View className='title' style={{textAlign: titleAlign}}>
              <Text className={!blackTitle ? 'theme-c-' + theme : ''}>{title}</Text>
              <View className='icon-close'>
                <AtIcon value='close' size='20' onClick={this.props.onHide} />
              </View>
            </View>
            {this.props.children}
          </View>
        </View>
      </View>
    )
  }
}

export default Modal
