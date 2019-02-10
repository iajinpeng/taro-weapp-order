import Taro, {Component} from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import './index.less'

class BackToHome extends Component {

  state = {
    x: 200,
    y: 400
  }

  componentDidMount () {
    this.calcSize()
  }

  calcSize = async () => {
    const {windowWidth, windowHeight} = await Taro.getSystemInfo()

    const imageWidth = 120/750 * windowWidth

    this.windowWidth = windowWidth
    this.windowHeight = windowHeight
    this.imageWidth = imageWidth
    this.setState({
      x: windowWidth - imageWidth - 20,
      y: windowHeight - imageWidth - 100
    })
  }

  handleBack = () => {
    Taro.navigateTo({
      url: '/pages/index/index'
    })
  }

  touchMove = e => {
    e.stopPropagation()
    const {clientX, clientY} = e.touches[0]
    const r = this.imageWidth / 2
    let x = clientX - r, y = clientY - r
    if (clientX <= r) {
      x = 0
    }
    if (clientX >= this.windowWidth -r) {
      x = this.windowWidth - 2 * r
    }
    if (clientY <= r) {
      y = 0
    }
    if (clientY >= this.windowHeight -r) {
      y = this.windowHeight - 2 * r
    }
    this.setState({
      x, y
    })
  }

  render () {
    const {x, y} = this.state
    return (
      <View onTouchMove={this.touchMove}
        direction='all' onClick={this.handleBack}
        style={{left: x + 'Px', top: y + 'Px'}}
        className='back-to-home'
      >
        <Image id='back-image' className='image' src={require('../../assets/images/icon-backtohome.png')} />
      </View>
    )
  }
}

export default BackToHome
