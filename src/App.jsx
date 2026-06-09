import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogIN from "./Component/login/LogIN";
import Hero from "./Component/HomeDashBord/Hero";
import AllCar from "./Component/cars/allCar/AllCar";
import AddCar from "./Component/cars/addCar/AddCar";
import EditCar from "./Component/cars/editCar/EditCar";
import AllUser from "./Component/users/allUser/AllUser";
import AddUser from "./Component/users/addUser/AddUser";
import Classification from "./Component/classification/Classification"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/LogIN" />} />
          <Route path="/login" element={<LogIN />} />

          <Route path="/Dashbord" element={<Hero />}>
            <Route index element={<AllCar />} />
            <Route path="allCar" element={<AllCar />} />
            <Route path="allcar/addCar" element={<AddCar />} />
            <Route path="allcar/editCar/:id" element={<EditCar />} />
            <Route path="alluser" element={<AllUser />} />
            <Route path="alluser/adduser" element={<AddUser />} />
            <Route path="Classification" element={<Classification/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

