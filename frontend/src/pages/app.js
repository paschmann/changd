import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { Layout } from 'antd';

//CSS
import 'antd/dist/antd.css';

// Public Pages
import Login from './public/login/Login';
import Register from './public/register/Register';
import Reset from './public/password/Reset';
import SetPassword from './public/password/Set';

// SAAS Pages
import Jobs from './saas/jobs/Jobs';
import Notifications from './saas/notifications/Notifications';
import Usage from './saas/usage/Usage';
import Timeline from './saas/timeline/Timeline';
import Account from './saas/account/Account';
import JobDetail from './saas/jobs/jobDetail/JobDetail';
import AddJob from './saas/jobs/jobAdd/JobAdd';
import JobEdit from './saas/jobs/jobEdit/JobEdit';
import AddNotifications from './saas/notifications/notificationAdd/NotificationAdd';
import EditNotification from './saas/notifications/notificationEdit/NotificationEdit';
import ChangePassword from './saas/account/changePassword/ChangePassword';

//Components
import AppHeader from '../components/header/Header';
import AppSider from '../components/sider/Sider';

// API
import { getMyUser, getMyUserSettings } from "../services/api.service";

//Services
import ProtectedRoute from "../services/protectedRoute";
import { logout, logoutAndReload } from "../services/auth.service";

//Matomo
import { useMatomo } from '@datapunt/matomo-tracker-react';

function App() {
  const { trackPageView } = useMatomo()
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(()=>{
    getUser()
    trackPageView()
  })
  
  const getUser = () => {
    getMyUser().then(response => {
      if (response.data.user_id) {
          setLoggedIn(true)
          sessionStorage.setItem('emailMd5', response.data.emailMD5);
          sessionStorage.setItem('fullname', response.data.firstname + ' ' + response.data.lastname);

          getUserSettings();
      } else {
        console.log("Invalid token")
      }
    })
      .catch(error => {
        setLoggedIn(false);
        logout();

        /*
        Bug - multiple reloads
        if (window.location.pathname !== '/login' || window.location.pathname !== '/setpassword') {
          logoutAndReload();
        } else {
          logout();
        }
        */
      })
  }

  const getUserSettings = () => {
    getMyUserSettings().then(response => {
      if (response.data) {
          sessionStorage.setItem('filepath', response.data.filepath);
      }
    })
      .catch(error => {
        console.log('Unable to get filepath from server, screenshots may not display correctly. Check the environment variables are setup correctly.')
      })
  }

  return (
      <Router>
        <Layout>
          {loggedIn && <AppHeader />}
          <Layout>
            {loggedIn && <AppSider />}
            <Layout style={{ padding: '0 24px 0', minHeight: '100vh' }}>
              <Switch>
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/reset" component={Reset} />
                <Route exact path="/setpassword" component={SetPassword} />

                <ProtectedRoute exact path="/" component={Jobs} />
                <ProtectedRoute exact path="/jobs" component={Jobs} />
                <ProtectedRoute exact path="/jobs/:job_id" component={JobDetail} />
                <ProtectedRoute exact path="/jobs/:job_id/edit" component={JobEdit} />
                <ProtectedRoute exact path="/addjob" component={AddJob} />
                <ProtectedRoute exact path="/notifications" component={Notifications} />
                <ProtectedRoute exact path="/addnotification" component={AddNotifications} />
                <ProtectedRoute exact path="/notifications/:notification_id/edit" component={EditNotification} />
                <ProtectedRoute exact path="/usage" component={Usage} />
                <ProtectedRoute exact path="/timeline" component={Timeline} />
                <ProtectedRoute exact path="/account" component={Account} />
                <ProtectedRoute exact path="/account/setpassword" component={ChangePassword} />
              </Switch>
            </Layout>
          </Layout>
        </Layout>
      </Router>
  )
}

export default App;


