import React from 'react'
import { selectUsername, selectUserRole } from '../features/user';
import { useSelector } from "react-redux"
import { useDispatch } from 'react-redux';
import { persistor } from '../store';

function NavBar(props) {
    const dispatch = useDispatch();

    const user = useSelector(selectUsername);
    const role = useSelector(selectUserRole);

    const handleLogOut = () => {
        localStorage.removeItem('token');
        localStorage.setItem("role", "");
        localStorage.setItem("userName", "")
        window.location.href = '/login';


        dispatch({ type: 'USER_LOGOUT' });
        persistor.purge().then(() => {
            console.log('Persisted state has been purged.');
        });

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
                        <button className={`bgbtn2`} onClick={() => {
                            window.location.href("/")
                        }}>Login</button>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default NavBar
