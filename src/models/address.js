import {postAddress} from "../services/address";

export default {
  namespace: 'address',
  state: {
    curAddress: {}
  },

  effects: {
    * postAddress({payload}, {put, call}) {
      return yield call(postAddress, payload)
    },
  },

  reducers: {
    setCurAddress(state, {payload}) {
      return {...state, curAddress: payload};
    },
  }
}
