import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { selectUsername } from '../../features/UserSlice/user';
import { persistor } from '../../store/index';

function NavBar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUsername);

    const handleLogOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');

        dispatch({ type: 'USER_LOGOUT' });


        persistor.purge().then(() => {
            console.log('Persisted state has been purged.');
        });


        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand fw-bold fs-4" href="#">
                    <i className="bi bi-kanban-fill icon me-2"></i>
                    Project Tracker
                </a>

                {user && (
                    <div className="d-flex align-items-center">  Welcome,
                        <span className="navbar-text me-3 d-none d-sm-block" style={{ padding: "3px" }}>
                            <div className='capitalize-first'>{user}</div>
                        </span>
                    </div>
                )}

                <div>
                    {user ? (
                        <button className="bgbtn2" onClick={handleLogOut}>Logout</button>
                    ) : (

                        <button className="bgbtn2" onClick={() => navigate('/')}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
