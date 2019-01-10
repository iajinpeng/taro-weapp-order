

export default {
  namespace: 'address',
  state: {
    curAddress: {}
  },

  reducers: {
    setCurAddress(state, {payload}) {
      return {...state, curAddress: payload};
    },
  }
}
