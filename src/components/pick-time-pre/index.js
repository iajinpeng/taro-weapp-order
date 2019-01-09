import Taro, {Component} from '@tarojs/taro'
import {View, PickerView, PickerViewColumn} from '@tarojs/components'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.less'

class PickTime extends Component {

  static propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func
  }

  static defaultProps = {
    show: false,
    onClose: null
  }

  state = {
    days: ['今天（周四）', '明天（周五）', '12-15（周六）', '12-16（周日）', '12-17（周一）', '12-18（周二）', '12-19（周三）'],
    times: ['现在下单 预计14:22', '14:22', '14:30', '14:45', '14:50', '15:10', '15:25'],
    value: [0, 0],
    dayIndex: 0,
    timeIndex: 0
  }

  handleChange = (e) => {
    this.setState({value: e.detail.value})
  }

  handleClose = () => {
    const {days, times, value} = this.state
    this.props.onClose(days[value[0]], times[value[1]])
  }

  render() {
    const {days, times, value, dayIndex, timeIndex} = this.state
    const {show, reserveTime} = this.props

    return (
      <View>
        <View className='mask' style={{display: show ? 'block' : 'none'}} onClick={this.handleClose}/>
        <View className={classnames('pick-time', show ? 'active' : '')}>
          <View className='title'>选择预约时间</View>
          <PickerView value={value} className='picker' onChange={this.handleChange}>
            <PickerViewColumn style={{width: '270px'}}>
              {
                reserveTime.map((day, index) => (
                  <View className='col-item' key={index}>{day.title}</View>
                ))
              }
            </PickerViewColumn>
            <PickerViewColumn>
              {
                reserveTime.length > 0 && reserveTime[0].time.length > 0 &&
                reserveTime[0].time.map((time, index) => (
                  <View className='col-item' key={index}>{time.time}</View>
                ))
              }
            </PickerViewColumn>
          </PickerView>
        </View>
      </View>
    )
  }
}

export default PickTime
