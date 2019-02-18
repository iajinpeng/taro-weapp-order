import Taro, {Component} from '@tarojs/taro'
import {View, Text, Block, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'


import './index.less'
import '../../app.less'

@connect(({common, cart}) => ({...common, ...cart}))
class Numbox extends Component {

  render () {
    const {theme, showNum, num, onAdd, onReduce} = this.props
    const baseUrl = this.props.ext.domain
    return (
      <View className='num-box'>
        {
          showNum &&
          <Block>
            <Image
              src={require('../../assets/images/icon-reduce.png')}
              onClick={onReduce}
              className='icon-reduce'
            >-</Image>
            <Text className='num'>{num}</Text>
          </Block>
        }
        <Image src={theme ? `${baseUrl}/static/addons/diancan/img/style/style_${theme}_8.png` : ''}
          onClick={onAdd}
          className={classnames('add-circle')}>
          +
        </Image>
      </View>
    )
  }
}

export default Numbox
