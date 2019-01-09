import request from '../utils/request'

/**
 * 获取店铺列表
 * */
export const getStoreList = data => request({
  url: '/addons.diancan.api.Home_storeList',
  method: 'POST',
  data
})

/**
 * 获取店铺商品列表
 * */
export const getGoodsList = data => request({
  url: '/addons.diancan.api.Goods_goodsList',
  method: 'POST',
  data
})

/**
 * 获取商品规格
 * */
export const getGoodsNorm = data => request({
  url: '/addons.diancan.api.Goods_goodsNorm',
  method: 'POST',
  data
})

/**
 * 获取满单即送商品
 * */
export const getPresentGood = data => request({
  url: '/addons.diancan.api.Goods_goodsSendList',
  method: 'POST',
  data
})



