import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from "./user.controller";
import { DataBaseService } from './data-base.service';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, DataBaseService],
})
export class AppModule {}
