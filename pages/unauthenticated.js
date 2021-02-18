import { Login } from '../components'
const UnauthenticatedPage = ({ message, showLogin }) => {
  return (
      <>
        <h3>{message}</h3>
        {showLogin && <Login/>}
      </>
  );
};

export default UnauthenticatedPage