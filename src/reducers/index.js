import {
  STORE_IMAGE
} from "../types/actions";

const initialState = {
  image: null,
};

export default function reducer(
  state = initialState,
  action
) {
  switch (action.type) {
   case STORE_IMAGE:
       return {...state, image: action.image}; //to be changed
    default:
      return state;
  }
}
