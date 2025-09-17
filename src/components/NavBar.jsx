import React from 'react'
import { useAuth } from '../context/AuthContext';



function NavBar(props) {

    const { user, login, logout } = useAuth();
    const token = localStorage.getItem("token")
    const role=localStorage.getItem("role")
   

    const handleLogOut = () => {
        logout();

    }

    return (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand fw-bold fs-4" href="#">
                    <i className="bi bi-kanban-fill icon me-2"></i>
                    Project Tracker
                </a>
                <div className="d-flex align-items-center">
                    <span className="navbar-text me-3 d-none d-sm-block">
                        Welcome To  Project Tracker!
                    </span>
                </div>
                <div>
                    {user ? (
                        <>

                            <button className={`bgbtn2`} onClick={handleLogOut}>Logout</button>
                        </>
                    ) : (
                        <button className={`bgbtn2`} onClick={() => login(user, token,role)}>Login</button>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default NavBar
