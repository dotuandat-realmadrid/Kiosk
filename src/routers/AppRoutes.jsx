import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ScrollRestoration from "../components/ScrollRestoration";
import MainLayout from "../layouts/MainLayout";
import UserHome from "../pages/home/UserHome";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import AdminLayout from "../layouts/AdminLayout";
import UserAdmin from "../pages/admin/UserAdmin";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PrivateRoute from "./PrivateRoutes";
import NotFound from "../pages/admin/404NotFound";
import MyProfiles from "../pages/admin/MyProfiles";
import Info from "../pages/admin/Info";
import MyPassword from "../pages/admin/MyPassword";
import UserDetailAdmin from "../pages/admin/UserDetailAdmin";
import Province from "../pages/admin/Province";
import ProvinceDetail from "../pages/admin/ProvinceDetail";
import District from "../pages/admin/District";
import DistrictDetail from "../pages/admin/DistrictDetail";
import TransactionOffice from "../pages/admin/TransactionOffice";
import TransactionOfficeDetail from "../pages/admin/TransactionOfficeDetail";
import TicketFormat from "../pages/admin/TicketFormat";
import TicketFormatDetail from "../pages/admin/TicketFormatDetail";
import Service from "../pages/admin/Service";
import ServiceDetail from "../pages/admin/ServiceDetail";
import ServiceGroup from "../pages/admin/ServiceGroup";
import ServiceGroupDetail from "../pages/admin/ServiceGroupDetail";
import Branch from "../pages/admin/Branch";
import BranchDetail from "../pages/admin/BranchDetail";
import Kiosk from "../pages/admin/Kiosk";
import KioskDetail from "../pages/admin/KioskDetail";
import Counter from "../pages/admin/Counter";
import CounterDetail from "../pages/admin/CounterDetail";
import UserLayout from "../layouts/UserLayout";
import DashboardUser from "../pages/user/DashboardUser";
import MonitorUser from "../pages/user/MonitorUser";
import SettingUser from "../pages/user/SettingUser";
import ECenterBoard from "../pages/home/ECenterBoard";
import ECenterBoardAdmin from "../pages/admin/ECenterBoardAdmin";
import ECenterBoardDetailAdmin from "../pages/admin/ECenterBoardDetailAdmin";
import ReportAdmin from "../pages/admin/ReportAdmin";

const AppRoutes = () => {
  return (
    <Router>
      <ScrollRestoration />

      <Routes>
        {/* HOME */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<UserHome />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={ 
          <PrivateRoute
            element={<AdminLayout />}
            requiredRoles={[
              "ADMIN",
            ]}
          />
         }>
          <Route path="" element={<DashboardAdmin />} />
          <Route path="users" element={
            <PrivateRoute 
              element={<UserAdmin />}
              requiredRoles={["ADMIN"]}
            />
          } />
          <Route path="users/:id" element={
            <PrivateRoute 
              element={<UserDetailAdmin />}
              requiredRoles={["ADMIN"]}
            />
          } />
          {/* private routes */}
          <Route path="" element={<Info />}>
            <Route path="my-profiles" element={<MyProfiles />} />
            <Route path="password" element={<MyPassword />} />
          </Route>

          {/* QUẢN LÝ DỊCH VỤ */}
          <Route path="ticket-formats" element={<TicketFormat />} />
          <Route path="ticket-formats/:id" element={<TicketFormatDetail />} />
          <Route path="services" element={<Service />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="service-groups" element={<ServiceGroup />} />
          <Route path="service-groups/:id" element={<ServiceGroupDetail />} />

          {/* QUẢN LÝ PGD */}
          <Route path="provinces" element={<Province />} />
          <Route path="provinces/:id" element={<ProvinceDetail />} />
          <Route path="districts" element={<District />} />
          <Route path="districts/:id" element={<DistrictDetail />} />
          <Route path="transaction-offices" element={<TransactionOffice />} />
          <Route path="transaction-offices/:id" element={<TransactionOfficeDetail />} />
          <Route path="branches" element={<Branch />} />
          <Route path="branches/:id" element={<BranchDetail />} />

          {/* QUẢN LÝ THIẾT BỊ */}
          <Route path="kiosks" element={<Kiosk />} />
          <Route path="kiosks/:id" element={<KioskDetail />} />
          <Route path="counters" element={<Counter />} />
          <Route path="counters/:id" element={<CounterDetail />} />
          <Route path="e-center-boards" element={<ECenterBoardAdmin />} />
          <Route path="e-center-boards/:id" element={<ECenterBoardDetailAdmin />} />
          <Route path="transactions" element={<ReportAdmin />} />
        </Route>

        {/* USER */}
        <Route path="/user" element={ 
          <PrivateRoute
            element={<UserLayout />}
            requiredRoles={[
              "USER",
            ]}
          />
         }>
          <Route path="" element={<DashboardUser />} />
          <Route path="monitors" element={<MonitorUser />} />
          <Route path="settings" element={<SettingUser />} />
        </Route>

        {/* E Center Board */}
        <Route path="/e-center-board/:code" element={<ECenterBoard />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
