import isEmpty from '../validation/is-empty';

import { SET_CURRENT_USER } from '../actions/types';

const initalState = {
  isAuthenicated: false,
  user: {}
};

export default function(state = initalState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        // because the payload will be full it is going to set isAuthenicated to 'true'
        isAuthenticated: !isEmpty(action.payload),
        // check again how it works exactly that the user IS actual payload
        user: action.payload
      };
    default:
      return state;
  }
}
