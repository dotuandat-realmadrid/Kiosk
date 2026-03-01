import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";

const MainLayout = () => {
  return (
    <>
      <div className="container" style={{ flex: "1" }}>
        <main>
          <Outlet />
        </main>
      </div>
      <ScrollToTopButton />
    </>
  );
};

export default MainLayout;
