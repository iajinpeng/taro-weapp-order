import Taro, { Component } from '@tarojs/taro'
import { CoverView, Block, Button } from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'
import '../../app.less'

class ConfirmModal extends Component {

  static propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    show: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    theme: PropTypes.number,
    type: PropTypes.number
  }

  static defaultProps = {
    title: '提示',
    className: '',
    show: false,
    onOk: null,
    onCancel: null,
    theme: 1,
    type: 1
  }

  render () {
    const { title, className, show, onOk, onCancel, theme, type, warnDistance } = this.props
    return (
      <CoverView className={classnames('modal-wrap', show ? 'modal-fade' : '')}>
        <CoverView className={classnames('modal', className)}>
          <CoverView className='title'>{title}</CoverView>
          <CoverView className='content'>
            {
              warnDistance ? `我这好像离你有点儿远，还继续点吗(${warnDistance}km)` : this.props.children
            }
          </CoverView>
          <CoverView className='footer'>
            {
              type === 1 &&
              <Block>
                <Button onClick={onCancel}>
                  <CoverView className='btn'>取消</CoverView>
                </Button>
                <CoverView className='gap' />
                <Button onClick={onOk}>
                  <CoverView className={classnames('btn', 'theme-c-' + theme)}>确定</CoverView>
                </Button>
              </Block>
            }
            {
              type === 2 &&
              <Button onClick={onCancel}>
                <CoverView className={classnames('btn', 'theme-c-' + theme)}>确定</CoverView>
              </Button>
            }
          </CoverView>
        </CoverView>
      </CoverView>
    )
  }
}

export default ConfirmModal
