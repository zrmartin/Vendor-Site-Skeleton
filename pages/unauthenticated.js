import { Login } from '../components'
const UnauthenticatedPage = ({message}) => {
  return (
      <>
          <h3>{message}</h3>
          <Login></Login>
      </>
  );
};

export default UnauthenticatedPage