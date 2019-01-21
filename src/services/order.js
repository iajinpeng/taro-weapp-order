import request from '../utils/request'


/**
 * 获取订单列表
 * */
export const getOrderList = data => request({
  url: '/addons.diancan.api.Home_orderList',
  method: 'POST',
  data
})

/**
 * 获取订单详情
 * */
export const getOrderDetail = data => request({
  url: '/addons.diancan.api.Home_orderDetail',
  method: 'POST',
  data
})


/**
 * 生成订单前获取信息获取订单详情
 * */
export const getPreOrderInfo = data => request({
  url: '/addons.diancan.api.order_index',
  method: 'POST',
  data
})

/**
 * 获取预约时间
 * */
export const getReserveTime = data => request({
  url: '/addons.diancan.api.order_getReserveTime',
  method: 'POST',
  data
})

/**
 * 保存订单
 * */
export const requestSaveOrder = data => request({
  url: '/addons.diancan.api.order_saveOrder',
  method: 'POST',
  data
})

/**
 * 支付订单
 * */
export const requestPayOrder = data => request({
  url: '/addons.diancan.api.Order_preparatoryPayOrder',
  method: 'POST',
  data
})

/**
 * 获取订单支付状态
 * */
export const getOrderPayStatus = data => request({
  url: '/addons.diancan.api.Order_getOrderPayStatus',
  method: 'POST',
  data
})

/**
 * 取消订单
 * */
export const requestCancelOrder = data => request({
  url: '/addons.diancan.api.Order_cancelOrder',
  method: 'POST',
  data
})

/**
 * 再来一单
 * */
export const requestOrderRepeat = data => request({
  url: '/addons.diancan.api.Home_repeatOrder',
  method: 'POST',
  data
})

