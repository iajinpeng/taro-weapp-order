
export const getTouchData = (endX, endY, startX, startY)=> {
  let turn = '';
  if (endX - startX > 50 && Math.abs(endY - startY) < 50) {      //右滑
    turn = 'right';
  } else if (endX - startX < -50 && Math.abs(endY - startY) < 50) {   //左滑
    turn = 'left';
  }
  return turn;
}
