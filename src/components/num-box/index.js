import Taro, {Component} from '@tarojs/taro'
import {View, Text, Block, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'

import {baseUrl} from "../../config/index";

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
            <Image
              src={require('../../images/icon-reduce.png')}
              onClick={onReduce}
              className='icon-reduce'
            >-</Image>
            <Text className='num'>{num}</Text>
          </Block>
        }
        <Image src={`${baseUrl}/static/addons/diancan/img/style/style_${theme}_8.png`}
          onClick={onAdd}
          className={classnames('add-circle')}>
          +
        </Image>
      </View>
    )
  }
}

export default Numbox
