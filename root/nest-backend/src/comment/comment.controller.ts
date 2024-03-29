import { Body, Controller, Get, Res,Param, Post, Patch, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Response } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './entities/comment';
import { LikeComment } from './dto/like-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @ApiOperation({summary:"Upload the comment"})
  @ApiResponse({status:201, type: Comment})
  @Post()
  async uploadComment(@Body() dto:CreateCommentDto, @Res() res:Response) {
    const comment:Comment = await this.commentService.uploadComment(dto);
    res.json(comment);

  }
  @ApiOperation({summary:"Update the comment"})
  @ApiResponse({status:200, type: Comment})
  @Patch()
  async updateComment(@Body() dto: UpdateCommentDto, @Res() res:Response) {
    const updatedComment = await this.commentService.updateComment(dto);
    res.json(updatedComment);
  }
  @ApiOperation({summary:"Like the comment"})
  @ApiResponse({status:200, type: Boolean})
  @Post("like/:id")
  async likeComment(@Param("id") commentId: string, @Body() {userId}:{userId:string}, @Res() res:Response) {
    const response = await this.commentService.likeComment(commentId, userId);
    res.json(response);
  }
  @ApiOperation({summary:"Remove like from comment"})
  @ApiResponse({status:200, type: Boolean})
  @Post("remove-like/:id")
  async removeLike(@Param("id") commentId: string, @Body() {userId}:{userId:string}, @Res() res:Response) {
    const response = await this.commentService.removeLike(commentId, userId);
    res.json(response);
  }
  @ApiOperation({summary:"Upload reply to the comment"})
  @ApiResponse({status:201, type: Comment})
  @Post(":id")
  async uploadReply(@Param("id") id: string, @Body() dto: CreateCommentDto, @Res() res:Response) {
    console.log("id -->", id);
    
    const reply = await this.commentService.uploadReply(id, dto);
    res.json(reply);
  }
  @ApiOperation({summary:"Delete the comment"})
  @ApiResponse({status:204, type: Boolean})
  @Delete(":id")
  async deleteComment(@Param("id") id: string, @Res() res:Response) {
    const response = await this.commentService.deleteComment(id);
    res.json(response);
  }
}
