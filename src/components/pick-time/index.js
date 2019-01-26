import Taro, {Component} from '@tarojs/taro'
import {View, Block, Text, ScrollView} from '@tarojs/components'
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
    dayIndex: 0
  }

  componentDidMount () {
    this.setState({dayIndex: this.props.dayIndex})
  }

  chooseDay = index => {
    if (index === this.state.dayIndex) return
    this.setState({dayIndex: index})
  }

  chooseTime = index => {
    if (index === this.props.timeIndex) return
    this.props.onChangeTime(this.state.dayIndex, index)
  }

  stopPro = e => {
    e.stopPropagation()
  }

  render() {
    const {show, reserveTime, theme, showPrice, timeIndex} = this.props
    const {dayIndex} = this.state

    return (
      <Block>
        <View
          className='mask' style={{display: show ? 'block' : 'none'}}
          onClick={this.props.onClose} onTouchMove={this.stopPro}
        />
        <View className={classnames('pick-time', show ? 'active' : '')}>
          <View className='title'>选择预约时间
            <Text className='cacel' onClick={this.props.onClose}>取消</Text>
          </View>
          <View className='picker'>
            <ScrollView scrollY className='day-list' onTouchMove={this.stopPro}>
              {
                reserveTime.map((day, index) => (
                  <View
                    className={classnames('day-item', dayIndex === index ? 'active theme-c-' + theme : '')}
                    key={index}
                    onClick={this.chooseDay.bind(this, index)}
                  >{day.title}</View>
                ))
              }
            </ScrollView>
            <ScrollView scrollY className='time-list'>
              {
                reserveTime.length > 0 && reserveTime[dayIndex].time.length > 0 &&
                reserveTime[dayIndex].time.map((time, index) => (
                  <View
                    className={classnames('time-item', dayIndex === this.props.dayIndex && timeIndex === index ? 'active theme-c-' + theme : '')}
                    key={index}
                    onClick={this.chooseTime.bind(this, index)}
                  >
                    <Text className='time'>
                      {
                        dayIndex === 0 && index === 0 &&
                        <Text>现在下单，</Text>
                      }
                      {
                        dayIndex === 0 && index === 0 ? '预计' : ''
                      }
                      {time.time}
                    </Text>
                    {
                      showPrice &&
                      <Text className='price'>
                        {time.price}元配送费
                      </Text>
                    }
                  </View>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Block>
    )
  }
}

export default PickTime
