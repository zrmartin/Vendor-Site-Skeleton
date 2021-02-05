export const HttpError = ({ error }) => {
  return (
    <>
      Error code - {error.code}
      <br/>
      Error Message - {error.message}
    </>
  )
};