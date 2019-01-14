import Taro, {Component} from '@tarojs/taro'
import {View, Block, Text} from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'
import '../../app.less'

class PickTime extends Component {

  static propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func
  }

  static defaultProps = {
    show: false,
    onClose: null,
    reserveTime: []
  }

  state = {
    dayIndex: 0,
    timeIndex: 0
  }

  chooseDay = index => {
    if (index === this.state.dayIndex) return
    this.setState({
      dayIndex: index,
      timeIndex: 0
    })
  }

  chooseTime = index => {
    this.setState({timeIndex: index})
  }

  handleClose = () => {
    const {dayIndex, timeIndex} = this.state
    this.props.onClose([dayIndex, timeIndex])
  }

  render() {
    const {dayIndex, timeIndex} = this.state
    const {show, reserveTime, theme} = this.props

    return (
      <Block>
        <View className='mask' style={{display: show ? 'block' : 'none'}} onClick={this.handleClose} catchTouchMove/>
        <View className={classnames('pick-time', show ? 'active' : '')}>
          <View className='title'>选择预约时间
            <Text className='cacel' onClick={this.props.onClose.bind(this, null)}>取消</Text>
          </View>
          <View className='picker'>
            <View className='day-list'>
              {
                reserveTime.map((day, index) => (
                  <View
                    className={classnames('day-item', dayIndex === index ? 'active theme-c-' + theme : '')}
                    key={index}
                    onClick={this.chooseDay.bind(this, index)}
                  >{day.title}</View>
                ))
              }
            </View>
            <View className='time-list'>
              {
                reserveTime.length > 0 && reserveTime[dayIndex].time.length > 0 &&
                reserveTime[dayIndex].time.map((time, index) => (
                  <View
                    className={classnames('time-item', timeIndex === index ? 'active theme-c-' + theme : '')}
                    key={index}
                    onClick={this.chooseTime.bind(this, index)}
                  >
                    {
                      index === 0 &&
                        <Text>现在下单，</Text>
                    }
                    {
                      index === 0 ? '预计' : ''
                    }
                    {time.time}
                  </View>
                ))
              }
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default PickTime
