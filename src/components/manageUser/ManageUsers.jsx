import React, { useEffect, useState } from 'react'
import { Button, Spinner,Container,Table,
  Modal,Form
 } from 'react-bootstrap';
import config from '../../config/config'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserList, selectUserError, selectUserList, selectUserStatus, setUserRole } from '../../features/UserSlice/user';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../alertMessage/AlertMessage';


function EditUserModal({ show, handleClose, user, onSave, isLoading }) {
  const dispatch=useDispatch()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    id:""
  });
  const availableRoles = ['admin', 'member'];

  useEffect(() => {
    console.log("id", user)
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.profile.role,
        id:user.id
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; 
      const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email,
      profile: {
        ...user.profile,
        role: formData.role,
      },
    };
    
    dispatch(setUserRole({ userId:formData.id, role: formData.role }));
    
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit User Details 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="editUserForm" onSubmit={handleSubmit}>
         
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancel
        </Button>
        <Button
          variant="purple"
          type="submit"
          form="editUserForm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-1">Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


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


  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


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



  

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };


  const handleCloseModal = () => {
    if (status1 === 'loading') return;
    setShowModal(false);
    setSelectedUser(null)
    dispatch(fetchUserList())

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
            <Container className="py-5">

        <div className="text-center mb-4">
          <h4 className="mb-2">User Management</h4>
          <p className="text-muted">Click on a user row to edit their details.</p>
        </div>

   
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            fontFamily: 'sans-serif',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '2rem',
          }}
        >
          <Table responsive hover className="align-middle table-clickable">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Current Role</th>
              </tr>
            </thead>
            <tbody>
             {status1 === 'loading' && !users.length && (
                <tr>
                  <td colSpan="4" className="text-center">
                    <Spinner animation="border" variant="purple" />
                    <span className="ms-2">Loading users...</span>
                  </td>
                </tr>
              )}

             {status1 === 'failed' && !users.length && (
                <tr>
                  <td colSpan="4" className="text-center text-danger">
                    {error || 'Could not load user data.'}
                  </td>
                </tr>
              )}

               {status1 === 'succeeded' &&
                users.map((user) => (
                  <tr
                    key={user?.id}
                    onClick={() => handleRowClick(user)}
                    style={{ cursor: 'pointer' }}
                    title={`Click to edit ${user.username}`}
                  >
                    <td>{user?.id}</td>
                    <td>{user?.username}</td>
                    <td>{user?.email}</td>
                    <td>
                      <span
                       
                      >
                        {user?.profile?.role}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </Container>


      {selectedUser && (
        <EditUserModal
          show={showModal}
          handleClose={handleCloseModal}
          user={selectedUser}
          onSave={handleSave}
          isLoading={status1 === 'loading'}
        />
      )}
  

    </>

  )
}

export default ManageUsers
