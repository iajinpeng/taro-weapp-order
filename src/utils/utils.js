
export const getTouchData = (endX, endY, startX, startY)=> {
  let turn = '';
  if (endX - startX > 50 && Math.abs(endY - startY) < 50) {      //右滑
    turn = 'right';
  } else if (endX - startX < -50 && Math.abs(endY - startY) < 50) {   //左滑
    turn = 'left';
  }
  return turn;
}


export const sortCartGood = (curCart, good, num) => {
  if (!good.propertyTagIndex || good.propertyTagIndex.length === 0) {
    let index = curCart.findIndex(item => !item.fs_id && (item.g_id === good.g_id))

    if (index > -1) {
      !curCart[index].num && (curCart[index].num = 0)
      curCart[index].num += num
      good.again_id && (curCart[index].again_id = good.again_id)

      curCart[index].num === 0 && curCart.splice(index, 1)
    } else {
      curCart.push({...good, num})
    }
  } else {
    curCart.map((item, index) => item.index = index)
    let idAlikes = curCart.filter(item => item.g_id === good.g_id)

    if (idAlikes.length === 0) {
      curCart.push({...good, num})
    } else{
      let index = idAlikes.findIndex(item => !item.fs_id && (item.optionalstr === good.optionalstr))
      if (index > -1) {

        let i = idAlikes[index].index
        curCart[i].num += num
        curCart[i].num === 0 && curCart.splice(i, 1)

        good.again_id && (curCart[i].again_id = good.again_id)

      } else {
        curCart.push({...good, num})
      }
    }

  }

  return curCart
}
