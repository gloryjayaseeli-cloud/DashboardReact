
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import config from '../config/config';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, selectUserProfile } from '../features/user';


export default function GitHubCallback() {

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasSentRequest = useRef(false);
  const loggedinUser = useSelector(selectUserProfile)

  const [token, setToken] = useState("")
  useEffect(() => {
    const fetchUserapi = async () => {
      if (token) {
        const API = `${config.api.baseUrl}/users/me/`

        try {
          dispatch(fetchUser())

        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }

    };

    fetchUserapi();
  }, [token]);

  useEffect(() => {
    localStorage.setItem("role", loggedinUser?.profile?.role)
    localStorage.setItem("userName", loggedinUser?.username)
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