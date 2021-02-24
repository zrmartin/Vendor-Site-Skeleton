const HTTP_CODES = {
  Success: 200,
  Bad_Request: 400,
  Unauthenticated: 401,
  Not_Found: 404,
  Validation_Error: 422,
};
Object.freeze(HTTP_CODES)

module.exports = {
  HTTP_CODES
}
