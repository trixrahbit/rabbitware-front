import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

//–– Point at your FastAPI backend & send cookies:
axios.defaults.withCredentials = true;

// Global axios response interceptor for handling 401 Unauthorized errors
const setupAxiosInterceptors = (navigate) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        console.log('[Auth] Intercepted 401 error, redirecting to login');

        // Clear authentication data
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];

        // Redirect to login page with message
        navigate('/login', { 
          state: { message: 'Your session has expired. Please log in again.' } 
        });
      }
      return Promise.reject(error);
    }
  );
};

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const popupRef                      = useRef(null);
  const navigate                      = useNavigate();
  const activityTimerRef              = useRef(null);
  const inactivityTimerRef            = useRef(null);
  const renewalTimerRef               = useRef(null);
  const lastActivityRef               = useRef(Date.now());

  // Set up axios interceptors for handling 401 errors
  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  // Note on token storage security:
  // Tokens are stored in sessionStorage only to minimise exposure.
  // sessionStorage is cleared when the browser tab is closed, reducing the
  // attack window compared to localStorage. For maximum security, consider
  // using HttpOnly cookies instead, but this requires server-side changes.

  // 1️⃣ Bootstrap: try stored JWT, then cookie‐session if token exists
  useEffect(() => {
    (async () => {
      // Check if we have a token in sessionStorage
      const token = sessionStorage.getItem('authToken');

      console.log('[Auth] bootstrap: JWT in SS?', !!token);

      if (token) {
        // If we have a token, try to use it
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const decoded = jwt_decode(token);
          console.log('[Auth] decoded JWT:', decoded);

          // Now that we have a token, we can try to get the user from the API
          try {
            console.log('[Auth] bootstrap: calling GET /api/auth/me with token');
            const { data } = await axios.get('/api/auth/me');
            console.log('[Auth] /me succeeded:', data.user);
            setCurrentUser(data.user);
            return;
          } catch (apiErr) {
            console.log('[Auth] /me failed with token:', apiErr.message);

            // Try to get user from sessionStorage if available
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
              try {
                const parsedUser = JSON.parse(sessionUser);
                console.log('[Auth] Using user from sessionStorage:', parsedUser);
                setCurrentUser(parsedUser);
                return;
              } catch (parseErr) {
                console.log('[Auth] Failed to parse user from sessionStorage:', parseErr.message);
              }
            }

            // If API call fails and no sessionStorage user, fall back to using the decoded token
            setCurrentUser({
              id: decoded.id || decoded.sub,
              name: decoded.name,
              email: decoded.email || decoded.sub,
              role: decoded.role,
              tenant_id: decoded.tenant_id
            });
            return;
          }
        } catch (dErr) {
          console.log('[Auth] JWT decode failed:', dErr.message);
          // If token is invalid, remove it from storage
          sessionStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
  // No JWT token found. Check if a session cookie exists by calling /api/auth/me
      try {
        console.log('[Auth] bootstrap: calling GET /api/auth/me with session cookie');
        const { data } = await axios.get('/api/auth/me');
        console.log('[Auth] /me succeeded via cookie:', data.user);
        setCurrentUser(data.user);
        return;
      } catch (err) {
        console.log('[Auth] /me failed without token:', err.message);
      }

      console.log('[Auth] no session/jwt – setting currentUser=null');
      setCurrentUser(null);
    })()
      .finally(() => {
        console.log('[Auth] bootstrap complete');
        setLoading(false);
      });
  }, []);

  // 2️⃣ Email/password login
  const login = async (email, password, token = null, userData = null) => {
    console.log('[Auth] login()', { email, hasToken: !!token, hasUserData: !!userData });
    setError(''); setLoading(true);

    try {
      let user = userData;
      let access_token = token;

      // If we don't have user data or token, make the API call
      if (!user || !access_token) {
        const { data } = await axios.post('/api/auth/login', { email, password });
        console.log('[Auth] login OK, response:', data);
        user = data.user;
        access_token = data.access_token;
      }

      // Store the token in sessionStorage if it exists
      if (access_token) {
        console.log('[Auth] Storing access token in sessionStorage');
        sessionStorage.setItem('authToken', access_token);

        // Also store user data in sessionStorage for fallback
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }

      setCurrentUser(user);
      try {
        await axios.post('/api/auth/check-in');
      } catch (_) {}
      return user;
    } catch (err) {
      console.error('[Auth] login error:', err.response?.data || err.message);

      // Check if the error has a structured format with message and errors
      if (err.response?.data?.message && err.response?.data?.errors) {
        // For structured errors (like "Email not verified"), show the specific error
        const errorMessages = err.response.data.errors;
        setError(errorMessages.join('. '));
      } else {
        // For simple string errors or when there's no response, use the detail or a fallback
        setError(err.response?.data?.detail || err.message || 'Login failed');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Microsoft SSO popup login
const loginWithM365 = () => {
    console.log('[Auth] loginWithM365() opening popup');
    setError('');
    setLoading(true);
    const popup = window.open(
      `/api/auth/m365/login?popup=true&next_path=%2Fdashboard`, // Path will be proxied to /api/auth/m365/login
      'MicrosoftLogin',
      'width=600,height=700'
    );
    popupRef.current = popup;


    return new Promise((resolve, reject) => {
      const onMessage = async (e) => {
        console.log('[Auth] popup onMessage', e.data);
        if (e.origin !== window.location.origin) return;
        if (e.data?.type !== 'MS365_AUTH_CALLBACK') return;

        window.removeEventListener('message', onMessage);
        clearInterval(checkPopup);
        popup.close();

        try {
          // The callback already set the session cookie via the popup response.
          // Just fetch the user profile now.
          console.log('[Auth] fetching /api/auth/me after SSO');
          const { data } = await axios.get('/api/auth/me');
          console.log('[Auth] SSO /me succeeded:', data.user);

          // Store user data in sessionStorage
          if (data.user) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
          }

          // If the popup sent a session token, store it
          if (e.data.session) {
            sessionStorage.setItem('authToken', e.data.session);
            axios.defaults.headers.common['Authorization'] = `Bearer ${e.data.session}`;
          }

          setCurrentUser(data.user);
          resolve(data.user);
        } catch (err) {
          console.error('[Auth] SSO /me failed:', err);
          setError('Failed to fetch user after SSO');
          reject(err);
        } finally {
          setLoading(false);
        }
      };

      window.addEventListener('message', onMessage);

      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          console.log('[Auth] popup closed by user');
          clearInterval(checkPopup);
          window.removeEventListener('message', onMessage);
          setLoading(false);
          reject(new Error('Authentication window closed'));
        }
      }, 500);
    });
  };

  // 4️⃣ Logout
  const logout = async () => {
    console.log('[Auth] logout()');
    try { await axios.post('/api/auth/check-out'); } catch (_) {}
    try { await axios.post('/api/auth/logout'); } catch (_) {}

    // Clear sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);

    // Clear activity timers
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
      activityTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (renewalTimerRef.current) {
      clearInterval(renewalTimerRef.current);
      renewalTimerRef.current = null;
    }
  };

  // 5️⃣ Update session timeout
  const updateSessionTimeout = async (timeoutMinutes) => {
    console.log('[Auth] updateSessionTimeout()', { timeoutMinutes });
    try {
      // The API expects session_timeout as a query parameter
      const response = await axios.post(`/api/auth/users/session-timeout?session_timeout=${timeoutMinutes}`);

      // Update the currentUser with the new session timeout
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          session_timeout: timeoutMinutes
        });
      }

      // Reset the inactivity timer with the new timeout
      resetInactivityTimer();

      return response.data;
    } catch (err) {
      console.error('[Auth] updateSessionTimeout error:', err.response?.data || err.message);
      throw err;
    }
  };

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear any existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Don't set a new timer if there's no user or no session timeout
    if (!currentUser || !currentUser.session_timeout) return;

    // Set a new inactivity timer
    const timeoutMs = currentUser.session_timeout * 60 * 1000; // Convert minutes to milliseconds
    inactivityTimerRef.current = setTimeout(() => {
      console.log('[Auth] Session expired due to inactivity');

      // Handle logout directly instead of calling the logout function to avoid circular dependency
      (async () => {
        try {
          await axios.post('/api/auth/check-out');
        } catch (_) {}
        try { await axios.post('/api/auth/logout'); } catch (_) {}

        // Clear sessionStorage
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');

        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);

        // Clear activity timers
        if (activityTimerRef.current) {
          clearInterval(activityTimerRef.current);
          activityTimerRef.current = null;
        }
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }

        navigate('/login', { state: { message: 'Your session has expired due to inactivity. Please log in again.' } });
      })();
    }, timeoutMs);
  }, [currentUser, navigate]);

  // 6️⃣ Renew the session before it expires
  const renewSession = useCallback(async () => {
    try {
      const { data } = await axios.post('/api/auth/renew');
      console.log('[Auth] session renewed, expires at:', data.expires_at);

      // Store the new token so the Bearer header uses the fresh one
      if (data.token) {
        sessionStorage.setItem('authToken', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }

      // Reset inactivity timer since the session was renewed
      resetInactivityTimer();
    } catch (err) {
      console.error('[Auth] session renewal failed:', err.response?.data || err.message);
    }
  }, [resetInactivityTimer]);

  // Set up a timer to renew the session periodically while the user is active.
  // Renews every 10 minutes (or half the session timeout if < 20 min) to ensure
  // the JWT and cookie stay fresh for active users.
  useEffect(() => {
    if (!currentUser || !currentUser.session_timeout) return;

    const timeoutMs = currentUser.session_timeout * 60 * 1000;
    // Renew at half the timeout or every 10 minutes, whichever is less
    const intervalMs = Math.min(timeoutMs / 2, 10 * 60 * 1000);

    if (intervalMs <= 0) return;

    renewalTimerRef.current = setInterval(() => {
      // Only renew if there has been recent activity (last 2 minutes)
      if (Date.now() - lastActivityRef.current < 2 * 60 * 1000) {
        renewSession();
      }
    }, intervalMs);

    return () => {
      if (renewalTimerRef.current) {
        clearInterval(renewalTimerRef.current);
        renewalTimerRef.current = null;
      }
    };
  }, [currentUser, renewSession]);

  // 6️⃣ Activity tracking
  const trackActivity = useCallback(() => {
    // Update the last activity timestamp
    lastActivityRef.current = Date.now();

    // Reset the inactivity timer
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Update the last activity timestamp on the server
  const updateLastActivity = useCallback(async () => {
    if (!currentUser) return;

    try {
      await axios.post('/api/auth/users/activity');
      console.log('[Auth] Updated last activity timestamp on server');
    } catch (err) {
      console.error('[Auth] Failed to update last activity:', err);
    }
  }, [currentUser]);

  // Set up activity tracking
  useEffect(() => {
    if (!currentUser) return;

    // Set up event listeners for user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'click',
      'keydown',
      'touchstart',
      'scroll'
    ];

    // Throttle activity tracking to at most once per 30 seconds to avoid
    // excessive timer resets on rapid mouse movements
    let lastTracked = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastTracked > 30000) { // 30 seconds
        lastTracked = now;
        trackActivity();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Set up a timer to periodically update the last activity timestamp on the server
    activityTimerRef.current = setInterval(() => {
      // Only update if there has been activity since the last update
      if (Date.now() - lastActivityRef.current < 60000) { // 1 minute
        updateLastActivity();
      }
    }, 60000); // Update every minute

    // Initialize the inactivity timer
    resetInactivityTimer();

    // Clean up
    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });

      // Clear timers
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [currentUser, trackActivity, updateLastActivity, resetInactivityTimer]);

  // While bootstrapping, render nothing (or a spinner)
  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      error,
      login,
      loginWithM365,
      logout,
      updateSessionTimeout,
      renewSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}
