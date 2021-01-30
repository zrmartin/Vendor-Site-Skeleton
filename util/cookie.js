function getCookie(cookie, name) {
  var match = cookie?.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  }
  else{
    return null;
  }
}

module.exports = {
  getCookie
}