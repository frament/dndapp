import {Body, Controller, Post} from '@nestjs/common';
import {DataBaseService} from "./data-base.service";
import {WebSocketStrategy} from "surrealdb.js/script/strategies/websocket";


@Controller('user')
export class UserController {
  private db: WebSocketStrategy;
  constructor(private surreal: DataBaseService) {
    this.db = this.surreal.db;
  }

  @Post('signup')
  async signup(@Body() body: { user:string, pass:string}){
    return this.db.signup({NS:'dnd', DB:'dnd', SC:'user', ...body})
  }

  @Post('signin')
  async signin(@Body() body: { user:string, pass:string}){
    return this.db.signin({NS:'dnd', DB:'dnd', SC:'user',...body})
  }

  @Post('auth')
  async auth(@Body('token') token:string){
    return this.db.authenticate(token);
  }
}
