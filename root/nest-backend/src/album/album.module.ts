import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './entities/album.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Album", schema: AlbumSchema }]),
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumModule, MongooseModule]
})
export class AlbumModule {}
