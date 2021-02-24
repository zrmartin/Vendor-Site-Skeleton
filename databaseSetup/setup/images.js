const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateImages, GetAllImagesForEntity, DeleteImage } = require('../queries/images')
const { COLLECTIONS: { Images, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Images_For_Entity }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Images, Get_All_Images_For_Entity, Delete_Image }} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner_Image_Access }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function, Select, Let, CurrentIdentity, Get, Equals, And } = q

/* Collection */
const CreateImagesCollection = CreateCollection({ name: Images })

/* Indexes */
const CreateIndexAllImagesForEntity = (imagesCollection) => CreateIndex({
  name: All_Images_For_Entity,
  source: imagesCollection,
  terms: [
    {
      field: ["data", "entity"]
    }
  ],
  serialized: true
})

/* Function Roles */

/* Functions */
const CreateImagesUDF = CreateOrUpdateFunction({
  name: Create_Images,
  body: Query(Lambda(['data'], CreateImages(Select(['imageKeys'], Var('data')), Select(['entityId'], Var('data')), Select(['entityCollection'], Var('data'))))),
})

const GetAllImagesForEntityUDF = CreateOrUpdateFunction({
  name: Get_All_Images_For_Entity,
  body: Query(Lambda(['data'], GetAllImagesForEntity(Select(['entityId'], Var('data')), Select(['entityCollection'], Var('data'))))),
})

const DeleteImageUDF = CreateOrUpdateFunction({
  name: Delete_Image,
  body: Query(Lambda(['data'], DeleteImage(Select(['id'], Var('data'))))),
})

/* Membership Roles */
const CreateShopOwnerImageRole = (createImagesFunction, getAllImagesForEntityFunction, deleteImageFunction, allImagesForEntityIndex, imagesCollection) => CreateOrUpdateRole({
  name: MembershipRole_Shop_Owner_Image_Access,
  membership: [{ resource: Collection(Accounts) }],
  privileges: [
    {
      resource: createImagesFunction,
      actions: {
        call: true
      }
    },
    {
      resource: getAllImagesForEntityFunction,
      actions: {
        call: true
      }
    },
    {
      resource: deleteImageFunction,
      actions: {
        call: true
      }
    },
    {
      resource: allImagesForEntityIndex,
      actions: { read: true }
    },
    {
      resource: imagesCollection,
      actions: {
        write: Query(
          Lambda(["oldData", "newData"],
            And(
              Equals(CurrentIdentity(), Select(["data", "account"], Var("oldData"))),
              Equals(
                Select(["data", "account"], Var("oldData")),
                Select(["data", "account"], Var("newData"))
              )
            )
          )
        ), 
        delete: Query(
          Lambda("imageRef", Let(
            {
              image: Get(Var("imageRef")),
              accountRef: Select(["data", "account"], Var("image"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        ), 
        create: true,
        read: Query(
          Lambda("imageRef", Let(
            {
              image: Get(Var("imageRef")),
              accountRef: Select(["data", "account"], Var("image"))
            },
            Equals(Var("accountRef"), CurrentIdentity())
          ))
        ),
      }
    }
  ]
})

async function createImagesCollection(client) {

  await client.query(
    Let([
      // Create Collections
      {
        images_collection: IfNotExists(Collection(Images), CreateImagesCollection)
      },
      // Create Indexes
      {
        all_images_for_entity_index: IfNotExists(Index(All_Images_For_Entity), CreateIndexAllImagesForEntity(
          Select(["ref"], Var("images_collection"))
        ))
      },
      // Create Function Roles
      // Create Functions
      {
        create_images_function: CreateImagesUDF
      },
      {
        get_all_images_for_entity_function: GetAllImagesForEntityUDF
      },
      {
        delete_image_function: DeleteImageUDF
      },
      // Create Membership Roles
      {
        create_shop_owner_image_role: CreateShopOwnerImageRole(
          Select(["ref"], Var("create_images_function")),
          Select(["ref"], Var("get_all_images_for_entity_function")),
          Select(["ref"], Var("delete_image_function")),
          Select(["ref"], Var("all_images_for_entity_index")),
          Select(["ref"], Var("images_collection"))
        ),
      },
    ]
    ,{})
  )
}

async function deleteImagesCollection(client) {
  await client.query(DeleteIfExists(Collection(Images)))
  await client.query(DeleteIfExists(Index(All_Images_For_Entity)))
  await client.query(DeleteIfExists(Function(Create_Images)))
  await client.query(DeleteIfExists(Function(Get_All_Images_For_Entity)))
  await client.query(DeleteIfExists(Function(Delete_Image)))
  await client.query(DeleteIfExists(Role(MembershipRole_Shop_Owner_Image_Access)))
}

module.exports = { createImagesCollection, deleteImagesCollection }
