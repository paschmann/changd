export const isAuthenticated = () => {
  if (localStorage.getItem("token") == null) {
    return false;
  } else {
    return true;
  }
};

export const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const logoutAndReload = () => {
  logout();
  window.location.reload(false)
};