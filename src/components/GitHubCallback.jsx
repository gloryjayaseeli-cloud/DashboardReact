
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useApi from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';


export default function GitHubCallback() {
  const { user, login, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const hasSentRequest = useRef(false);

  const [token, setToken] = useState("")
  const [loginuser, { data: loggedinUser, loginloading, loginerror }] = useApi();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const API = `${config.api.baseUrl}/users/me/`

        try {
          loginuser(API, "GET")
      
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
     
        }
      }
 
    };

    fetchUser();
  }, [token]); 

  useEffect(() => {
    localStorage.setItem("role", loggedinUser?.profile?.role)
    localStorage.setItem("userName", loggedinUser?.username)
    login(loggedinUser?.username, token, loggedinUser?.profile?.role)
    loggedinUser?.username && navigate("/dashboard")
  }, [loggedinUser])



  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');

    if (code && !hasSentRequest.current) {
    
      hasSentRequest.current = true;

      fetch(`${config.api.baseUrl}/auth/github/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error_description || 'Authentication failed');
          }
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token)

        })
        .catch(error => {
          navigate('/login');
        });
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
}