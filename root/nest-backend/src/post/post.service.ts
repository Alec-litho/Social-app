import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PostModel, PostDocument } from './entities/post-entity';
import { Image, ImageDocument } from 'src/image/entities/image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ImageService } from 'src/image/image.service';
import { CreateImageDto } from 'src/image/dto/create-image.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Post') private readonly postModel:Model<PostModel>,
        @InjectModel('Image') private readonly imageModel:Model<Image>,
        private readonly imageService:ImageService
    ){}
    async createPost(createPostDto:CreatePostDto) {
        try {
            const authorId:mongoose.Types.ObjectId = new mongoose.Types.ObjectId(createPostDto.author);
            async function createPostModel(postData:any/*think about it*/):Promise<PostDocument> {
                if(postData.images.length!==0) {
                    const images:mongoose.Types.ObjectId[] = postData.images.map((img:ImageDocument):mongoose.Types.ObjectId => img._id)
                    postData.images = images
                }
                const post:PostDocument = new this.postModel(postData);
                await post.save()
                return post;
            }
            if(createPostDto.images.length!==0) {
                //------------------load post's images------------------
                const images:Image[] = await Promise.all(createPostDto.images.map(async(img:any/*it will always be CreateImageDto type*/):Promise<Image> => {
                    return await this.imageService.uploadImage(img);
                }))
                //------------------load post itself------------------
                const post:PostDocument = await createPostModel.call(this,{...createPostDto, author: authorId, images})
                //-----update loaded images to change postId field as we already got it-----
                images.forEach(async (img:ImageDocument):Promise<void> => {await this.imageModel.findOneAndUpdate({_id:img._id}, {postId:post._id})})
                return post;
            } else {
                return await createPostModel.call(this,{...createPostDto, author: authorId});
            }
        } catch (error) {
            throw new InternalServerErrorException({message: error})
        }
      
    }
    async getUserPosts(id: string) {
        const authorId = new mongoose.Types.ObjectId(id);
        const userImages:PostDocument[] = await this.postModel.find({author: authorId}).populate("images")
        // .populate({
        //     path: 'comments',
        //     populate: {path:"replies"}
        // });
        console.log(userImages,id);
        
        if(!userImages) return []
        return userImages
    }
    async getOnePost(id:string) {
        try {
            const post = await this.postModel.findById(id);
            if(!post) throw new NotFoundException()
            return post
        } catch (error) {
            throw new InternalServerErrorException({message:error})
        }
    }
    async deletePost(id:string) {
        try {
            const isDeleted = await this.postModel.findByIdAndDelete(id).populate("images");
            console.log(isDeleted, id);
            if(isDeleted.images.length!==0) {
                isDeleted.images.forEach((img:ImageDocument) => {
                    console.log(img._id);
                    
                    this.postModel.findByIdAndDelete(img._id)
                })
            }
            if(!isDeleted) throw new NotFoundException({message:"Post wasn't deleted successfully, probably provided id is invalid"});
            return isDeleted._id;

        } catch (error) {
            throw new InternalServerErrorException({message:error})
        }
    }
    async updatePost(id:string, dto:UpdatePostDto) {
        try {
            let images: mongoose.Types.ObjectId[];
        if(dto.images.length!==0) {
            const imageIds = await Promise.all(dto.images.map(async(img:CreateImageDto):Promise<mongoose.Types.ObjectId> => {
                const image:ImageDocument = await this.imageService.uploadImage(img)
                return image._id
            }));
            images = imageIds;
        }
        const post = await this.postModel.findByIdAndUpdate(id, {...dto, images});
        if(!post) throw new NotFoundException({message:"Post wasn't updated successfully, probably provided id is invalid"});
        } catch (error) {
            throw new InternalServerErrorException({message:error});
        }
        

    }
    async postWatched(id:string) {
        try {
            const updatedPost = await this.postModel.findByIdAndUpdate(id, {$inc: {viewsCount:1}});
            if(!updatedPost) throw new NotFoundException({message:"Post wasn't updated successfully, probably provided id is invalid"});
            return updatedPost._id
        } catch (error) {
            throw new InternalServerErrorException({message:error})
        }
    }
}