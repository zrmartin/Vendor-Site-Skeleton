import { getCookie } from '../../util/helpers'

test('getCookie Succesfully grabs correct cookie when found', () => {
  const cookie = "Cookie: yummy_cookie=choco; tasty_cookie=strawberry"

  const yummyCookie = getCookie(cookie, "yummy_cookie")
  const tastyCookie = getCookie(cookie, "tasty_cookie")

  expect(yummyCookie).toEqual("choco");
  expect(tastyCookie).toEqual("strawberry");
});

test('getCookie Succesfully returns null when no match found', () => {
  const cookie = "Cookie: yummy_cookie=choco; tasty_cookie=strawberry"

  const nullCookie = getCookie(cookie, "nullCookie")

  expect(nullCookie).toBeNull();
});
