import request from '../utils/request'

/**
 * 获取店铺列表
 * */
export const postAddress = data => request({
  url: '/addons.diancan.api.address_add',
  method: 'POST',
  data
})



