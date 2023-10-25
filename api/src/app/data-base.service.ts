import { Injectable } from '@nestjs/common';
import {Surreal} from "surrealdb.js";

@Injectable()
export class DataBaseService {
  public db = new Surreal();
  async init(): Promise<void> {
    await this.db.connect('http://localhost:8000/rpc', {
      ns:'dnd', db: 'dnd',
      auth:  { user: 'admin', pass: 'admin' }
    });
    await this.db.query(
      `DEFINE SCOPE user
      SESSION 1d
      SIGNUP ( CREATE user SET user = $user, pass = crypto::argon2::generate($pass) )
      SIGNIN ( SELECT * FROM user WHERE user = $user AND crypto::argon2::compare(pass, $pass));`
    );
  }
}
