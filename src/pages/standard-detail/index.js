import Taro, {Component} from '@tarojs/taro'
import {View, Text, Block, Image, ScrollView} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'
import classnames from 'classnames'
import PayBox from '../../components/pay-box'

import './index.less'

import {baseUrl} from '../../config'


@connect(({common}) => ({...common}))
class StandardDetail extends Component {

  state = {
    g_description: '',
    g_image: null,
    fixed: [],
    optional: []
  }

  componentDidShow() {
    this.getGoodNorm()
  }

  getGoodNorm = () => {
    this.props.dispatch({
      type: 'shop/getGoodsNorm',
      payload: {
        store_id: +this.$router.params.store_id,
        goods_id: +this.$router.params.id
      }
    }).then(({g_description, g_image, norm: {fixed, optional}}) => {
      this.setState({g_description, g_image, fixed, optional})
    })
  }

  selectOther = (index, i, num) => {
    const opt = this.state.optional[index]
    const totalNum = opt.list.reduce((total, item) => {
      return total += (item.num || 0)
    }, 0)

    if (totalNum >= opt.gn_num && num === 1) {
      Taro.showToast({
        title: '超出可选最大数量',
        icon: 'none'
      })

      return
    }
    const good = opt.list[i]
    !good.num && (good.num = 0)
    good.num += num

    this.setState({optional: this.state.optional}, () => {
      console.log(this.state.optional)
    })
  }

  render() {
    const {theme, menu_cart} = this.props
    const {g_description, g_image, fixed, optional} = this.state



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
              fixed.map((good, index) => (
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
            optional.map((opt, index) => (
              <View className='goods' key={index}>
                <View className='goods-title'>请选择{opt.title}{opt.gn_num}份</View>
                {
                  opt.list && opt.list.map((good, i) => (
                    <View className='others-item' key={i}>
                      <Image className="pic" src={baseUrl + good.gn_image}/>
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
                              onClick={this.selectOther.bind(this, index, i, -1)}
                              value='subtract-circle' size={26}
                            />
                            <Text className='num'>{good.num}</Text>
                          </Block>
                        }
                        <View
                          onClick={this.selectOther.bind(this, index, i, 1)}
                          className={classnames('add-circle', 'theme-bg-' + theme)}
                        >+</View>
                      </View>
                    </View>
                  ))
                }
              </View>
            ))

          }
        </View>

        <View className="pay-wrap">
          <PayBox
            simple
            theme={theme} totalPrice={21.00} storeId={+this.$router.params.id}
            themeInfo={menu_cart} btnText='选好了'
          />
        </View>


      </ScrollView>
    )
  }
}

export default StandardDetail
