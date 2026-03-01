const initialState = {
  id: null,
  username: "",
  full_name: "",
  email: "",
  phone: "",
  gender: null,
  date_of_birth: null,
  address: "",
  is_active: true,
  created_at: null,
  updated_at: null,
  roles: [],
};

// action types
const SET_USER_INFO = "SET_USER_INFO";
const GET_USER_INFO = "GET_USER_INFO";
const CLEAR_USER_INFO = "CLEAR_USER_INFO";
const LOGOUT = "LOGOUT";

// action creators
export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});

export const getUserInfo = () => ({
  type: GET_USER_INFO,
});

export const clearUserInfo = () => ({
  type: CLEAR_USER_INFO,
});

export const logout = () => ({
  type: LOGOUT,
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      console.log('Redux: Setting user info:', action.payload);
      return { ...state, ...action.payload };
    
    case GET_USER_INFO:
      return state;
    
    case CLEAR_USER_INFO: 
      console.log('Redux: Clearing user info');
      return initialState;
    
    case LOGOUT:
      console.log('Redux: Logout');
      return initialState;
    
    default:
      return state;
  }
};

export default userReducer;