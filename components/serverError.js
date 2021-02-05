export const ServerError = ({ error }) => {
  return (
    <>
      Could not reach server, please try again. If this issue persists please contact Admin.
      <br/>
      Error Info: {error}
    </>
  )
};