import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { introspect, refresh } from "./api/auth";
import AppRoutes from "./routers/AppRoutes";
import "./App.css";
import { getMyInfo } from "./api/user";
import { AppProvider } from "./context/AppContext";
import { getToken } from "./services/localStorageService";

function App() {
  const token = getToken();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const refreshToken = async (token) => {
      try {
        const isValidAccessToken = await introspect(token);

        if (!isValidAccessToken) {
          await refresh(token);
        }

        dispatch(getMyInfo(token, false));
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    };

    if (token) {
      refreshToken(token);
    }
  }, [token, dispatch]);

  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;