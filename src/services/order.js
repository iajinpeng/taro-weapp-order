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
