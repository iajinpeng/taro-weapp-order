import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Input, Textarea} from '@tarojs/components'

class Alias extends Component {

  render () {
    return (
      <View>
        {/*<Image style={{width: '100%'}} src='https://gss3.bdstatic.com/-Po3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike72%2C5%2C5%2C72%2C24/sign=250d3ca0fa1f4134f43a0d2c4476feaf/e824b899a9014c08ed1589e60d7b02087bf4f443.jpg' />*/}
        <Image style={{width: '100%', height: 'calc(670vw)'}} src={'https://wxapp.xiaomafeiteng.com/static/addons/diancan/img/index.png?' + Math.random() * 100} />
      </View>
    )
  }
}

export default Alias
