import Taro, {Component} from '@tarojs/taro'
import {View, Text, Block, Image, ScrollView} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'

import './index.less'

import {baseUrl} from '../../config'


@connect(({common, cart}) => ({...common, ...cart}))
class StandardDetail extends Component {

  state = {
    g_description: '',
    g_image: null,
    norm: {},
  }

  getGoodNorm = () => {
    this.props.dispatch({
      type: 'shop/getGoodsNorm',
      payload: {
        store_id: +this.$router.params.store_id || 2,
        goods_id: +this.$router.params.id || 2
      }
    }).then(({g_description, g_image, norm}) => {
      this.setState({g_description, g_image, norm})
    })
  }

  componentDidShow() {
    this.getGoodNorm()
  }

  render() {
    const {g_description, g_image, norm} = this.state

    return (
      <ScrollView className='standard-detail' scrollY>
        <View className='content'>
          <View className='banner'>
            <Image src={g_image ? baseUrl + g_image : ''}/>
          </View>
          <View className='title'>{g_description}</View>
          <View className='goods'>
            <View className='goods-title'>已选商品</View>
            {
              norm.fixed.map((good, index) => (
                <View className='goods-item' key={index}>
                  <Image className='pic' src={baseUrl + good.gn_image}/>
                  <View className='info'>
                    <View className='name'>{good.gn_name}</View>
                    <View className='standard'>{good.gn_append}</View>
                  </View>
                  <View className='num'>x{good.gn_num}份</View>
                </View>
              ))
            }
          </View>
          {
            norm.optional && norm.optional.map((opt, index) => (
              <View className='goods' key={index}>
                <View className='goods-title'>请选择饮料{opt.gn_num}份</View>
                {
                  opt.list && opt.list.map((good, i) => (
                    <View className='others-item' key={i}>
                      <View className='pic'>图片</View>
                      <View className='info'>
                        <View className='name'>{good.gn_name}</View>
                        <View className='standard'>{good.gn_append}</View>
                        <View className='price'>加&yen;{good.gn_price}</View>
                      </View>
                      <View className='num-box'>
                        {
                          good.num && good.num > 0 &&
                          <Block>
                            <AtIcon
                              value='subtract-circle' size={26}
                            />
                            <Text className='num'>{good.num}</Text>
                          </Block>
                        }
                        <Image
                          className='add-circle'
                          src={require('../../images/icon-add-1.png')}
                        />
                      </View>
                    </View>
                  ))
                }
              </View>
            ))

          }
        </View>


      </ScrollView>
    )
  }
}

export default StandardDetail
