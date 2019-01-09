import request from '../utils/request'

/**
 * 登陆
 * */
export const requestLogin = data => request({
  url: '/WeappLogin',
  method: 'POST',
  data,
  no_const: true
})

/**
 * 获取用户信息
 * */
export const postUserInfo = data => request({
  url: '/addons.diancan.api.Wxapp_getUserInfo',
  method: 'POST',
  data
})

/**
 * 获取用户电话
 * */
export const getUserMobile = data => request({
  url: '/addons.diancan.api.Wxapp_getPhoneNumber',
  method: 'POST',
  data
})

/**
 * 获取首页信息
 * */
export const requestHomeInfo = data => request({
  url: '/addons.diancan.api.Home_index',
  method: 'POST',
  data
})

/**
 * 获取优惠券列表
 * */
export const requestCouponList = data => request({
  url: '/addons.diancan.api.Home_couponList',
  method: 'POST',
  data
})

/**
 * 发送formId
 * */
export const postFormId = data => request({
  url: '/addons.diancan.api.Wxapp_collectFormId',
  method: 'POST',
  data
})

