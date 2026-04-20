import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import DomesticBookingForm from "../../features/DomesticBooking";
import { MyTripLibrary } from "../../features/MyTripLibrary";
import RootLayout from "./RootLayout";
import EmptyPage from "./EmptyPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <EmptyPage /> },
      { path: "home", element: <EmptyPage /> },
      { path: "domestic-travel", element: <DomesticBookingForm /> },
      { path: "library", element: <MyTripLibrary /> },
      { path: "international-travel", element: <EmptyPage /> },
      { path: "change-or-cancel", element: <EmptyPage /> },
      { path: "reservations", element: <EmptyPage /> },
      { path: "bulletin", element: <EmptyPage /> },
      { path: "reports", element: <EmptyPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

const renderRouteTree = (routeObjects: RouteObject[] | undefined): ReactNode =>
  routeObjects?.map((route, idx) => {
    const key = `${route.path ?? "index"}-${idx}`;
    const childRoutes = renderRouteTree(route.children);
    return route.index ? (
      <Route key={key} index element={route.element} />
    ) : (
      <Route key={key} path={route.path} element={route.element}>
        {childRoutes}
      </Route>
    );
  });

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>{renderRouteTree(routes)}</Routes>
  </BrowserRouter>
);

export default AppRoutes;
