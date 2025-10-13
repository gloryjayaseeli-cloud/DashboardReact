import React, { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap';
import config from '../config/config'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserList, selectUserError, selectUserList, selectUserStatus, setUserRole } from '../features/user';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './AlertMessage';


function ManageUsers() {

  const dispatch = useDispatch()
  const UserList = useSelector(selectUserList)
  const navigate = useNavigate()
  const [users, setUsers] = useState([]);
  const [roleChanges, setRoleChanges] = useState({});
  const [justSavedUserId, setJustSavedUserId] = useState(null);
  const availableRoles = ['admin', 'member'];
  const [role, setRole] = useState('member');
  const [justSaved, setJustSaved] = useState(false);
  const userList = useSelector(selectUserList);
  const status1 = useSelector(selectUserStatus);
  const error = useSelector(selectUserError);

  const [alert, setAlert] = useState({ show: false, message: '', variant: 'info' });


  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);

  useEffect(() => {
    console.log("mmm", status1, error, roleChanges, justSaved, userList)
    if (status1 === 'succeeded') {
      if (justSaved) {
        handleApiSuccess("User role updated successfully");
        setJustSaved(false);
      }
    } else if (status1 === 'failed') {
      handleApiError(error || "An unknown error occurred");
    }
  }, [status1, error, roleChanges, justSaved, userList]);

  const handleSave = (userId) => {

    const newRole = roleChanges[userId];

    if (newRole) {
      setJustSaved(!justSaved)
      setJustSavedUserId(userId);
      dispatch(setUserRole({ userId, role: newRole }));
    }
  };



  useEffect(() => {

    dispatch(fetchUserList())

  }, []);

  useEffect(() => {
    setUsers(UserList)
  }, [UserList])


  const handleRoleChange = (userId, newRole) => {
    setRoleChanges(prevChanges => ({
      ...prevChanges,
      [userId]: newRole,
    }));
    setRole(newRole)
  };

  const handleApiSuccess = (msg) => {
    setAlert({ show: true, message: `${msg} ✅`, variant: 'success' });
  };

  const handleApiError = (msg) => {
    setAlert({ show: true, message: `${msg} ❌`, variant: 'danger' });
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });
  };


  return (
    <>
      {status1 === 'loading' && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="light" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {alert.show && (
        <AlertMessage
          variant={alert.variant}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

      <button className={`btn btn-purple btn-icon`} onClick={() => { navigate(`/dashboard`) }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
        </svg>
      </button>
      <div className="container py-5">
        <div className="text-center mb-4">
          <h4 className="mb-2">User Management</h4>
        </div>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa' }}>




          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Current Role</th>
                <th scope="col">New Role</th>
                <th scope="col" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?.id}>
                  <td>{user?.id}</td>
                  <td>{user?.username}</td>
                  <td>{user?.email}</td>
                  <td>{user?.profile?.role}</td>
                  <td>
                    <select
                      className="form-select"

                      value={user?.role || roleChanges[user?.id] || ""}

                      onChange={(e) => handleRoleChange(user?.id, e.target.value)}
                    >
                      <option value="" disabled hidden>
                        SELECT
                      </option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  {roleChanges[user.id] && roleChanges[user.id] !== user.role ? (
                    <td className="text-center">
                      <Button variant="purple" onClick={() => handleSave(user.id)}>
                        Save
                      </Button>
                    </td>
                  ) : (

                    <td></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>

  )
}

export default ManageUsers
