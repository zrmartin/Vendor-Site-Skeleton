import { getId } from '../../util/helpers'


test('getId Succesfully grabs Id when found', () => {
  const testObj = {
    ref: {
      ['@ref']: {
        id: "123"
      }
    }
  }

  const id = getId(testObj)
  expect(id).toEqual("123");
});

test('getId Succesfully returns null when no match found', () => {
  const testObj = {
    ref: {
      ref: {
        id: "123"
      }
    }
  }

  const nullId = getId(testObj)
  expect(nullId).toBeUndefined();
});
