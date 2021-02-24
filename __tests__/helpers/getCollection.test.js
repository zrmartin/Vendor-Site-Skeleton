import { getCollection } from '../../util/helpers'

test('getCollection Succesfully grabs Id when found', () => {
  const testObj = {
    ref: {
      ['@ref']: {
        collection: {
          ['@ref']: {
            id: "123"
          }
        }
      }
    }
  }

  const id = getCollection(testObj)
  expect(id).toEqual("123");
});

test('getCollection Succesfully returns null when no match found', () => {
  const testObj = {
    ref: {
      ref: {
        id: "123"
      }
    }
  }

  const nullId = getCollection(testObj)
  expect(nullId).toBeUndefined();
});
