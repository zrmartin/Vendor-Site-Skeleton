// Create Users table
CreateCollection({name: "users"})

// Create users_by_email index
CreateIndex({
  name: "users_by_email",
  source: Collection("users"),
  terms: [{field: ["data", "email"]}],
  unique: true
})

// Create user_sessions table
CreateCollection({name: "user_sessions"})

// Create create_refresh_token Function
CreateFunction({
  name: 'create_refresh_token',
  body: Query(
    Lambda("userRef",
    Let(
      {
        session_refresh: Create(Collection('user_sessions'), {
          data: {
            user: Var("userRef"),
            used: false
          }
        })
      },
      {
        token: Create(Tokens(), {
          instance: Select(['ref'], Var('session_refresh')),
          // 8 hours is a good time for refresh tokens.
          ttl: TimeAdd(Now(), 8, 'hour'),
          data: {
            // We do not do anything with the type, it's just for readability in case we retrieve a token later on
            type: 'refresh'
          }
        }),
        session_refresh_doc: Var('session_refresh')
      }
    )
  )
  )
})

// Create create_access_token Function
CreateFunction({
  name: 'create_access_token',
  body: Query(
    Lambda(["userRef", "sessionRef"],
    Create(Tokens(), {
      instance: Var("userRef"),
      // A  token is just like a document (everything in FaunaDB is),
      // we can store metadata on the token if we'd like.
      data: {
        // We do not do anything with the type, it's just for readability in case we retrieve a token later on
        type: 'access',
        // We store which refresh token that created the access tokens.
        // That way we can invalidate access tokens that were granted by this refresh token if we'd like.
        session: Select(['ref'], Var("sessionRef"))
      },
      // access tokens live for 10 minutes, which is typically a good livetime for short-lived tokens.
      ttl: TimeAdd(Now(), 10, 'minutes')
    })
  )
  )
})

// Create create_access_and_refresh_token Function
CreateFunction({
  name: 'create_access_and_refresh_token',
  body: Query(
    Lambda("userRef",
    Let(
      {
        refresh: Call(Function("create_refresh_token"), Var("userRef")),
        access: Call(Function("create_access_token"), 
          [
            Var("userRef"), 
            Select(['session_refresh_doc'], Var('refresh'))
          ]
        )
      },
      {
        refresh: Select(['token'], Var('refresh')),
        access: Var('access')
      }
    )
  )
  )
})


// Create Login Function
CreateFunction({
  name: "login",
  body:  Query(
    Lambda(['email', 'password'],
    If(
      Exists(Match(Index('users_by_email'), Var('email'))),
      Let(
        {
          userRef: Select([0], Paginate(Match(Index('users_by_email'), Var('email')))),
          user: Get(Var('userRef')),
          // First we verify whether our login credentials are correct without retrieving a token using Identify.
          authenticated: Identify(Var('userRef'), Var('password')),
          // Then we make a token manually in case authentication succeeded. By default the Login function
          // would provide an instance, but it would not add data to the token. Here we will use it to
          // differentiate between a refresh and an access token.
          tokens: If(Var('authenticated'), Call(Function("create_access_and_refresh_token"), (Var('userRef'))), false)
        },
        {
          access: Select(['access'], Var('tokens'), false),
          refresh: Select(['refresh'], Var('tokens'), false),
          user: If(Var('authenticated'), Var('user'), false) // Do not give information about existance of the user
        }
      ),
      {
        access: false,
        refresh: false,
        user: false
      }
    )
  )
  )
})