import dva from './utils/dva'
import models from './models'

const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});

export default dvaApp.getStore();
