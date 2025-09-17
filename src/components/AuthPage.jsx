import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useApi from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import AlertMessage from './AlertMessage';
import config from '../config/config';

const AuthPage = () => {
  const { user, login, logout } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUserName] = useState("")
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'info'
  });

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [error, setError] = useState("")
  const [loading, setLoading] = useState("")
  const navigate = useNavigate()

  const gitUrl = process.env.REACT_APP_GITHUB_AUTH_URL
  const [loginuser, { data: loggedinUser, loading: loginloading, error: loginerror }] = useApi();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const API = `${config.api.baseUrl}/users/me/`

        try {
          loginuser(API, "GET")

        } catch (error) {
          setError(error)
          handleApiError();
          localStorage.removeItem('token');
          setToken(null);
          setUserName(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    setError(loginerror)

  }, [loginerror])

  useEffect(() => {
    localStorage.setItem("role", loggedinUser?.profile?.role)
    localStorage.setItem("userName", loggedinUser?.username)
    setUserName(loggedinUser?.username)
    login(loggedinUser?.username, token, loggedinUser?.profile?.role)
    loggedinUser && handleApiSuccess()

    loggedinUser?.username && navigate("/dashboard")

  }, [loggedinUser])


  const toggleForm = (e) => {
    e.preventDefault();
    setIsSignUp(!isSignUp);
  };

  const handleChange = (e) => {
    setUserDetails((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      }
    }
    )
  }

  const handleSubmit = async (event) => {

    try {

      const API_URL = isSignUp ? `${config.api.baseUrl}/signup/` : `${config.api.baseUrl}/login/`
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {

          'Content-Type': 'application/json',
        },

        body: isSignUp ? JSON.stringify({ username: userDetails?.username, password: userDetails?.password, email: userDetails?.email }) :
          JSON.stringify({ username: userDetails?.username, password: userDetails?.password }),
      });

      if (!response.ok) {

        const errorData = await response.json();
        throw new Error(errorData.non_field_errors?.[0] || 'Login failed. Please check your credentials.');
      }

      const data = await response.json();
      handleApiSuccess()
      localStorage.setItem("token", data?.access)

      setToken(data.access);
    } catch (err) {
      localStorage.setItem("token", "")

      handleApiError()
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setToken('');
    } finally {
      setLoading(false);
    }
  };


  const handleApiSuccess = () => {
    setAlert({
      show: true,
      message: `${isSignUp ? "Sign Up" : "Login"}  successful✅`,
      variant: 'success'
    });
  };

  const handleApiError = () => {
    setAlert({
      show: true,
      message: 'Oops! Something went wrong. Please try again. ❌',
      variant: 'danger'
    });
  };


  const closeAlert = () => {
    setAlert({ ...alert, show: false });
  };


  return (<>

    {alert.show && (
      <AlertMessage
        variant={alert.variant}
        message={alert.message}
        onClose={closeAlert}
      />
    )}


    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 violetfaded" >


      <div className="card auth-card shadow-lg">

        <div className="card-body p-3 p-lg-5">


          <ul className="nav nav-pills nav-fill mb-2 nav-pills-container rounded-pill p-1">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill ${!isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill ${isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </li>
          </ul>

          <div className="mb-2">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              className="form-control"
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              onChange={(e) => handleChange(e)}
              value={userDetails.username}
            />
          </div>

          {isSignUp && (
            <div className="mb-2">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                className="form-control"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                onChange={(e) => handleChange(e)}
                value={userDetails.email}
              />
            </div>
          )}

          <div className="mb-2">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              onChange={(e) => handleChange(e)}
              value={userDetails.password}
            />
          </div>

          <div className="d-grid">
            <button
              className="btn btn-violet"
              onClick={(e) => {
                handleSubmit(e)
              }}
              name={isSignUp ? 'Sign Up' : 'Login'}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </div>

          <div className="d-flex align-items-center my-2">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted small">OR</span>
            <hr className="flex-grow-1" />
          </div>

          <div className="d-grid">
            <button className="btn btn-violet">

              <a className='a1' href={gitUrl}>
                <span>Continue with Github</span>
              </a>
            </button>
          </div>

          <p className="text-center text-muted small mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <a href="#" onClick={toggleForm} className="fw-bold text-violet text-decoration-none ms-1">
              {isSignUp ? 'Login' : 'Sign Up'}
            </a>
          </p>
        </div>
      </div>

    </div>
  </>
  );

};

export default AuthPage;