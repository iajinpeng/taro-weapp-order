import request from '../utils/request'

/**
 * 保存地址
 * */
export const postAddress = data => request({
  url: '/addons.diancan.api.address_add',
  method: 'POST',
  data
})

/**
 * 删除地址
 * */
export const delAddress = data => request({
  url: '/addons.diancan.api.address_del',
  method: 'POST',
  data
})



