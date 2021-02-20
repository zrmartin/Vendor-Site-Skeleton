import { getCookie } from '../../util/helpers'

test('getCookie Succesfully grabs correct cookie', () => {

  let testSchema = {
    imageKeys: ["123"],
    entityId: "123",
    entityCollection: "testCollection"
  }
  let results = null

  try {
    results = await createImagesSchema.validate(testSchema)
  }
  catch (e){
    results = e
  }

  expect(results.errors).toBeUndefined();
});
