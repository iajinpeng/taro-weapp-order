import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image, ScrollView, Form} from '@tarojs/components'
import './index.less'

class Notice extends Component {
  config = {
    navigationBarTitleText: '顾客须知'
  }

  submitInfo = e => {
    console.log(e)
  }

  render() {
    return (
      <View>
        <View>顾客须知页面</View>
        <Form onSubmit={this.submitInfo} reportSubmit='true'>
          <Button formType='submit'>dianji</Button>
        </Form>
      </View>
    )
  }
}

export default Notice
