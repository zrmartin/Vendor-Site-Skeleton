const faunadb = require('faunadb')
const q = faunadb.query
const { Create, Collection, Map, Paginate, Index, Lambda, Get, Var, Match, Delete, Ref, CurrentIdentity, Count, If, Exists, GT, ToString, Concat, Select } = q

const { COLLECTIONS: { Images } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Images_For_Entity }} = require('../../util/constants/database/indexes')
const { HTTP_CODES: { Success, Not_Found }} = require('../../util/constants/httpCodes')

function CreateImages(imageKeys, entityId, entityCollection) {
  return {
    code: Success,
    message: If(
      GT(Count(imageKeys), 1),
      Concat([ToString(Count(imageKeys)), "Images Uploaded Successfully"], " "),
      Concat([ToString(Count(imageKeys)), "Image Uploaded Successfully"], " "),
    ),
    images: Map(imageKeys,
      Lambda('imageKey',
        Create(Collection(Images), {
        data: {
          key: Var('imageKey'),
          entity: Ref(Collection(entityCollection), entityId),
          account: CurrentIdentity(),
        }  
      }))
    )
  }
}


function GetAllImagesForEntity(entityId, entityCollection) {
  return If(
    Exists(Index(All_Images_For_Entity)), 
    {
      images: Select(["data"],
        Map(
          Paginate(Match(Index(All_Images_For_Entity), Ref(Collection(entityCollection), entityId))),
          Lambda("X", Get(Var("X")))
        )
      ),
      code: Success,
    },
    {
      code: Not_Found,
      message: "Could not find All_Images_For_Entity Index"
    }
  )
}

function DeleteImage(id) {
  return If(
    Exists(Ref(Collection(Images), id)),
    {
      deletedImage: Delete(Ref(Collection(Images), id)),
      code: Success,
      message: "Image Deleted"
    },
    {
      code: Not_Found,
      message: "Image not found, could not delete"
    }
  )
}
module.exports = { CreateImages, GetAllImagesForEntity, DeleteImage }
