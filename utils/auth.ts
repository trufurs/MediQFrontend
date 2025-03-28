export const isLoggedIn = (): boolean => {
    return !!localStorage.getItem("token");
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };
  