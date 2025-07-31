import { Injectable } from '@nestjs/common';
import {Surreal} from "surrealdb";

@Injectable()
export class DataBaseService {
  public db = new Surreal();
  async init(): Promise<void> {
    await this.db.connect('http://localhost:8000/rpc', {
      namespace:'dnd', database: 'dnd',
      auth:  { username: 'admin', password: 'admin' }
    });
    // await this.firstTimeInit();
    // setInterval(async () => console.log(await this.db.select('select * from user;')), 10000);
  }

  async firstTimeInit():Promise<void>{
    // создание таблицы пользователей
    //await this.db.query(`drop table user;`);
    await this.db.query(`
REMOVE TABLE user;
DEFINE TABLE user SCHEMAFULL
	PERMISSIONS
		FOR select, update, delete WHERE id = $auth.id;

DEFINE FIELD name ON user TYPE string;
DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD password ON user TYPE string;

DEFINE INDEX email ON user FIELDS email UNIQUE;`);
    await this.db.query(`
DEFINE SCOPE user SESSION 1d
  SIGNIN (
    SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(password, $password)
  )
  SIGNUP (
    CREATE user CONTENT {
      name: $name,
      email: $email,
      password: crypto::argon2::generate($password)
    }
  );`
    );
  }
}
