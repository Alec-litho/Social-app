import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from './entities/image.entity';
import mongoose, { Model } from 'mongoose';
import { Album, AlbumDocument } from 'src/album/entities/album.entity';
import { UpdateResult } from 'mongodb';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel("Image") private readonly imageModel: Model<Image>,
    @InjectModel("Album") private readonly albumModel: Model<Album>
  ){} 
  async uploadImage(createImageDto: CreateImageDto):Promise<ImageDocument> {
    try {
      const album:AlbumDocument = createImageDto.album !== undefined? await this.albumModel.findById(createImageDto.album) : undefined;
      createImageDto.album = new mongoose.Types.ObjectId(createImageDto.album);
      createImageDto.user = new mongoose.Types.ObjectId(createImageDto.user);
      console.log(createImageDto);
      
      const doc:ImageDocument = new this.imageModel(createImageDto);
      await doc.save();
      if(album) { 
          album.images.push(doc._id);
          await album.save();
      }
      return doc;
    
  } catch(error) {
    throw new InternalServerErrorException(error);
  }
  }

  findAll() {
    return `This action returns all image`;
  }

  async getOneImage(id:string) {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException({message:"id is not valid"});
      let result = await this.imageModel.findById(id);
      if(result!==null) {
        return {message: 'success', value: result}
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

};

  async deleteImage(id:string) {
    try {
    const imageId = new mongoose.Types.ObjectId(id)
    let result:ImageDocument = await this.imageModel.findByIdAndDelete(id);
    await this.albumModel.findOneAndUpdate({ _id: result.album}, { $pull: { images: imageId }});
    if(result!==null) {
      return {message: 'success', value: result}
    } else {
      throw new NotFoundException();
    }
  } catch (error) {
    throw new InternalServerErrorException();
  }
};
  async updateImage(id:string, image:CreateImageDto):Promise<Image> {
    const updatedImage = await this.imageModel.findByIdAndUpdate(id, {
      ...image
    });
    return updatedImage;
  }
}

