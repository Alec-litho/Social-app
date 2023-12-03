import { Controller, Get, Body, Post, Res, Param, Delete, Patch} from '@nestjs/common';
import { PostService } from './post.service';
import {CreatePostDto} from './dto/create-post.dto'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostModel } from './entities/post-entity';
import mongoose from 'mongoose';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService:PostService) {}
  @ApiOperation({summary:"Create a post"})
  @ApiResponse({status:201,type:PostModel})
  @Post() 
  async createPost(@Body() createPostDto:CreatePostDto, @Res() res:Response) {

    const newPost = await this.postService.createPost(createPostDto);
    res.json(newPost);
  }
  @ApiOperation({summary:"Get all user's posts"})
  @ApiResponse({status:200,type:[PostModel]})
  @Get("user/:id")
  async getUserPosts(@Param("id") id:string, @Res() res:Response) {
    const posts = await this.postService.getUserPosts(id);
    res.json(posts);
  }
  @ApiOperation({summary:"Get user post"})
  @ApiResponse({status:200,type:PostModel})
  @Get(":id")
  async getOnePost(@Param("id") id: string, @Res() res: Response) {
    const post = await this.postService.getOnePost(id);
    res.json(post);
  }
  @ApiOperation({summary:"Delete a post"})
  @ApiResponse({status:204,type:mongoose.Types.ObjectId})
  @Delete(":id")
  async deletePost(@Param("id") id:string, @Res() res: Response) {
    const postId = await this.postService.deletePost(id);
    res.json(postId);
  }
  @ApiOperation({summary:"Update post"})
  @ApiResponse({status:204,type:mongoose.Types.ObjectId})
  @Patch(":id") 
  async updatePost(@Param("id") id: string, @Body() dto: UpdatePostDto, @Res() res: Response) {
    const postId = await this.postService.updatePost(id, dto);
    res.json(postId);
  }
  @ApiOperation({summary:"Get user's posts"})
  @ApiResponse({status:200,type:mongoose.Types.ObjectId})
  @Get("watched/:id")
  async postWatched(@Param("id") id: string, @Res() res: Response) {
    const postId = await this.postService.postWatched(id);
    res.json(postId);
  }
}
 