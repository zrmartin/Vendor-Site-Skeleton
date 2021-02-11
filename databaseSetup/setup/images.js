const { DeleteIfExists, IfNotExists, executeFQL, CreateOrUpdateRole, CreateOrUpdateFunction } = require('../helpers/fql')
const { CreateImages, GetAllImagesForEntity, DeleteImage } = require('../queries/images')
const { COLLECTIONS: { Images, Accounts } } = require('../../util/constants/database/collections')
const { INDEXES: { All_Images_For_Entity }} = require('../../util/constants/database/indexes')
const { FUNCTIONS: { Create_Images, Get_All_Images_For_Entity, Delete_Image }} = require('../../util/constants/database/functions')
const { MEMBERSHIP_ROLES: { MembershipRole_Shop_Owner_Image_Access }} = require('../../util/constants/database/membershipRoles')

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Var, Role, CreateCollection, CreateIndex, Collection, Index, Function, Select, Let, CurrentIdentity, Get, Equals, Indexes, And } = q

/* Collection */
const CreateImagesCollection = CreateCollection({ name: Images })

/* Indexes */
const CreateIndexAllImagesForEntity = CreateIndex({
  name: All_Images_For_Entity,
  source: Collection(Images),
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
const CreateShopOwnerImageRole = CreateOrUpdateRole({
  name: MembershipRole_Shop_Owner_Image_Access,
  membership: [{ resource: Collection(Accounts) }],
  privileges: [
    {
      resource: q.Function(Create_Images),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Get_All_Images_For_Entity),
      actions: {
        call: true
      }
    },
    {
      resource: q.Function(Delete_Image),
      actions: {
        call: true
      }
    },
    {
      resource: Index(All_Images_For_Entity),
      actions: { read: true }
    },
    {
      resource: Collection(Images),
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
            Equals(Var("imageRef"), CurrentIdentity())
          ))
        ),
      }
    }
  ]
})

async function createImagesCollection(client) {
  // Create Collection
  await client.query(IfNotExists(Collection(Images), CreateImagesCollection))

  // Create Indexes
  await client.query(IfNotExists(Index(All_Images_For_Entity), CreateIndexAllImagesForEntity))

  // Create Function Roles

  // Create Functions
  await executeFQL(client, CreateImagesUDF, 'functions - create images')
  await executeFQL(client, GetAllImagesForEntityUDF, 'functions - get all images for entity')
  await executeFQL(client, DeleteImageUDF, 'functions - delete image')

  // Create Membership Roles
  await executeFQL(client, CreateShopOwnerImageRole, 'roles - membership role - shop owner image access')
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
