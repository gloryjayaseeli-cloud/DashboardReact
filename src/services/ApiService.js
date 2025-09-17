import {  useState,useCallback } from "react";

const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * An asynchronous function to perform the fetch request.
   * @param {string} url - The URL to which the API request will be made.
   * @param {object} body - The request body to be JSON stringified.
   * @param {object} options - Optional fetch options (e.g., method, headers).
   */
  const callApi = useCallback(async (url,method, body, options = {}) => {
    setLoading(true);
    setError(null);
    setData(null);

    const token = localStorage.getItem('token');


    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: method,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.non_field_errors?.[0] || responseData.detail || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
      }
      console.log("Actual data", responseData)
      setData(responseData);
      return { success: true, data: responseData };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return [callApi, { data, loading, error }];
};

export default useApi;
