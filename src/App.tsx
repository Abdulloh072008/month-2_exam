
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./pages/Layout/Layout";
import { Suspense } from "react";
import { Contacts, DashBoard, DebtProfile, Debts, Folders, Login, MyProfile, Registration } from "./router/router";

const App = () => {
  const route = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/dashboard",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <DashBoard />
            </Suspense>
          )
        },
        {
          path: "/folders",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Folders />
            </Suspense>
          )
        },
        {
          path: "/debts",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Debts />
            </Suspense>
          )
        },
        {
          path: "/contacts",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Contacts />
            </Suspense>
          )
        },
        {
          path: "/myprofile",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <MyProfile />
            </Suspense>
          )
        },
        {
          path: "/debt-profile/:id",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <DebtProfile />
            </Suspense>
          )
        },
        
      ]
    },
    {
      index: true,
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <Login />
        </Suspense>
      )
    },
    {
      path: "/register",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <Registration />
        </Suspense>
      )
    }

  ])
  return (
    <>
      <RouterProvider router={route} />
    </>
  )
}

export default App