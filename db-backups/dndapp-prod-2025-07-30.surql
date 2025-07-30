-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- ACCESSES
-- ------------------------------

DEFINE ACCESS user ON DATABASE TYPE RECORD SIGNUP (CREATE user CONTENT { email: $email, name: $name, password: crypto::argon2::generate($password) }) SIGNIN (SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(password, $password)) WITH JWT ALGORITHM HS512 KEY 'GijIb76opbUyL6iafrTjruUBnmzoeZt68L3VHhAxLbmTeMKQuVQ9at2AWDSymBzXTGYbsjxLzRRNdrvqzxHbRjProIYeix2dRcAG1fba7MLd2dPcU4QsaZ9EFZvyMrlz' WITH ISSUER KEY 'GijIb76opbUyL6iafrTjruUBnmzoeZt68L3VHhAxLbmTeMKQuVQ9at2AWDSymBzXTGYbsjxLzRRNdrvqzxHbRjProIYeix2dRcAG1fba7MLd2dPcU4QsaZ9EFZvyMrlz' DURATION FOR TOKEN 1h, FOR SESSION 1d;

-- ------------------------------
-- TABLE: user
-- ------------------------------

DEFINE TABLE user TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select, update, delete WHERE id = $auth.id, FOR create NONE;

DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value) PERMISSIONS FULL;
DEFINE FIELD name ON user TYPE string PERMISSIONS FULL;
DEFINE FIELD password ON user TYPE string PERMISSIONS FULL;

DEFINE INDEX email ON user FIELDS email UNIQUE;


-- ------------------------------
-- TABLE DATA: user
-- ------------------------------


