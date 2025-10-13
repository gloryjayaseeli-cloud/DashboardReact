import logo from './logo.svg';
import './App.css';
import AuthPage from "./components/AuthPage"
import ProjectDashboard from './components/ProjectDashboard';
import ViewProject from './components/ViewProject';
import AddTaskPage from './components/AddTaskPage';
import CreateProject from "./components/CreateProject"
import EditProject from './components/EditProject';
import { useState } from 'react';
import NavBar from './components/NavBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GitHubCallback from "./components/GitHubCallback"
import { selectUsername, selectUserStatus, selectUserError } from '../src/features/user';
import ManageUsers from '../src/components/ManageUsers';
import { useSelector } from 'react-redux';

function App() {
    const [route, setRoute] = useState('home');
    const AppContent = () => {

        const user = useSelector(selectUsername);
        const userStatus = useSelector(selectUserStatus)
        const userError = useSelector(selectUserError)

        const isProtectedRoute = ['dashboard', 'projects', 'tasks', "admin"].includes(route);
        if (isProtectedRoute && !user) {
            return <AuthPage />;
        }
        return (
            <>

                <BrowserRouter>
                    <Routes>

                        <Route
                            path="/login/github/callback"
                            element={<GitHubCallback />}
                        />

                        <Route path="/" element={<AuthPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/dashboard" element={<ProjectDashboard />} />
                        <Route path="/projects" element={<CreateProject />} />
                        <Route path="/admin" element={<ManageUsers />} />
                        <Route path="/AddTaskPage/:projectID/:ProjectName" element={<AddTaskPage />} />
                        <Route path="/viewProject/:projectID" element={<ViewProject />} />
                        <Route path="/editProject/:projectID" element={<EditProject />} />

                    </Routes>
                </BrowserRouter>

            </>
        );
    };

    return (

        <div className="min-h-screen bg-gray-100 font-sans">
            <NavBar
                user=""
            />
            <main >
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <AppContent />
                    </div>
                </div>
            </main>
        </div>

    );

}

export default App;
