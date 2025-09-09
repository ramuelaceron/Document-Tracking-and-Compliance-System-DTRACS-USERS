// App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import StartUp from "./pages/StartUp/StartUp";
import Login from "./pages/Login/Login";
import RegisterSchool from "./pages/Register/RegisterSchool";
import RegisterOffice from "./pages/Register/RegisterOffice";
import SchoolHome from "./pages/Home/SchoolHome";
import Schools from "./pages/Schools/Schools";
import OfficeHome from "./pages/Home/OfficeHome";
import SchoolDashboard from "./pages/Dashboard/SchoolDashboard";
import SGOD from "./pages/SGOD/SGOD";
import SectionPage from "./pages/Sections/SectionPage";
import ManageAccount from "./pages/ManageAccount/ManageAccount";
import AccountDisplay from "./pages/Schools/AccountDisplay/AccountDisplay"

//CID and OSDS placeholder page
import NoService from "./pages/OSDS_CID/NoService";

// School ToDo Dashboard
import ToDoPage from "./pages/Todo/ToDoPage/ToDoPage";
import RoleBasedRedirect from "./components/RoleBasedRedirect/RoleBasedRedirect";
import ToDoPastDue from "./pages/Todo/ToDoPastDue/ToDoPastDue";
import ToDoCompleted from "./pages/Todo/ToDoCompleted/ToDoCompleted";
import ToDoUpcoming from "./pages/Todo/ToDoUpcoming/ToDoUpcoming";
import ToDoListPage from "./pages/ToDoListPage/ToDoListPage";
import ToDoDetailPage from "./pages/ToDoDetailPage/ToDoDetailPage";

// Office Task
import TaskPage from "./pages/Task/TaskPage/TaskPage"
import TaskOngoing from "./pages/Task/TaskOngoing/TaskOngoing"
import TaskIncomplete from "./pages/Task/TaskIncomplete/TaskIncomplete"
import TaskHistory from "./pages/Task/TaskHistory/TaskHistory"
import TaskDetailPage from "./pages/TaskDetailPage/TaskDetailPage"
import AttachmentsPage from "./pages/AttachmentsPage/AttachmentsPage"

function App() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public routes */}
      <Route path="/" element={<StartUp />} />
      <Route path="/login/school" element={<Login />} />
      <Route path="/login/office" element={<Login />} />
      <Route path="/register/school" element={<RegisterSchool />} />
      <Route path="/register/office" element={<RegisterOffice />} />

      {/* School Protected Routes */}
      <Route element={<SchoolHome />}>
        <Route path="/home" element={<SchoolDashboard />} />
        <Route path="/SGOD" element={<SGOD />} />
        <Route path="/SGOD/:sectionId" element={<SectionPage />}>
          <Route path="task-list" element={<ToDoListPage />} />
          <Route path="task-list/:taskSlug" element={<ToDoDetailPage />} />
        </Route>
        
        {/* CID and OSDS Routes */}
        <Route path="/no-service" element={<NoService />} />

        <Route path="/to-do" element={<ToDoPage />} >
          <Route path="upcoming" element={<ToDoUpcoming />} />
          <Route path="past-due" element={<ToDoPastDue />} />
          <Route path="completed" element={<ToDoCompleted />} />
        </Route>
        
        <Route path="/todo/:sectionId/:taskSlug" element={<ToDoDetailPage />} />
        <Route path="/s-manage-account" element={<ManageAccount />} />
      </Route>

      {/* Office Protected Routes */}
      <Route element={<OfficeHome />} >
        <Route path="/task" element={<TaskPage />} >
          <Route path="ongoing" element={<TaskOngoing />} />
          <Route path="incomplete" element={<TaskIncomplete />} />
          <Route path="history" element={<TaskHistory />} /> 
        </Route>
        
        <Route path="/task/:sectionId/:taskSlug" element={<TaskDetailPage />} />
        <Route path="/task/:sectionId/:taskSlug/attachments" element={<AttachmentsPage />} /> {/* Updated to use taskSlug */}
        <Route path="/schools" element={<Schools />} />
        <Route path="/schools/:schoolSlug" element={<AccountDisplay />} />
        <Route path="/o-manage-account" element={<ManageAccount />} />
      </Route>

      {/* ✅ Unified redirect */}
      <Route
        path="/manage-account"
        element={
          <RoleBasedRedirect
            schoolPath="/s-manage-account"
            officePath="/o-manage-account"
          />
        }
      />
    </Routes>
  );
}

export default App;