import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

// import DomesticBooking from "../../features/DomesticBooking/DomesticBooking";
import RootLayout from "./RootLayout";
import Home from "../../features/Home/Home";
import DomesticBookingForm from "../../features/DomesticBooking";
import MyTripTibraryPage from "../../features/Trip Library/MyTripLibraryPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <div>Home</div> },
      { path: "home", element: <Home /> },
      { path: "domestic-travel", element: <DomesticBookingForm /> },
      {path: "library", element: <MyTripTibraryPage />},
      // {
      //     path: "travel/international",
      //     element: <PlaceholderTravelPage title="International travel" />,
      // },
      // {
      //     path: "travel/change-cancel",
      //     element: <PlaceholderTravelPage title="Change or cancel" />,
      // },
      // {
      //     path: "travel/library",
      //     element: <PlaceholderTravelPage title="My trip library" />,
      // },
      // {
      //     path: "admin/reservations",
      //     element: <PlaceholderTravelPage title="Reservation list" />,
      // },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element}>
            {route.children?.map((child, childIndex) => (
              <Route
                key={childIndex}
                index={child.index}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
