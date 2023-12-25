import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException  } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import getAge from '../../utils/getAge'; //rewrite this func in fe
import { JwtService } from '@nestjs/jwt';
import {User, UserDocument} from './entities/user.entity'
import mongoose, {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import { Album } from 'src/album/entities/album.entity';
import { LoginUserDto } from './dto/login-user.dto';
import bcrypt, { genSaltSync, hashSync } from 'bcrypt';
import {getAge} from '../../utils/getUserAge'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Album.name) private readonly albumModel: Model<Album>,
    @InjectModel(User.name) private readonly userModel: Model <User>,
    private jwtService: JwtService

    ) {} 

  async register(createUserDto: CreateUserDto) {

      const userExists = await this.userModel.findOne({email:createUserDto.email})
      console.log(userExists);
      
      if(userExists) throw new BadRequestException({message: "User already exists"})
      console.log("1")
      // const salt = await bcrypt.genSalt(5);
      // const hashPassword = await bcrypt.hash(createUserDto.password, salt);
      // console.log(hashPassword)
      const age = getAge(createUserDto.birth)
      console.log("3")
      const model = new this.userModel({...createUserDto,age})
      console.log(model)
      const user = await model.save();
      console.log(user)
      const access_token =  await this.jwtService.signAsync({sub:user._id,username:user.fullName});
      console.log(access_token)
      const newAlbum = new this.albumModel({name: "All", user: user._id})
      console.log(newAlbum)
      const album = await newAlbum.save();
      console.log(album)
      return {access_token, id:user._id.toString()}

  }
  async login(loginUserDto: LoginUserDto)/*:Promise<User|ServiceResponse>*/ {
    try {
      const user:any = await this.userModel.findOne({email:loginUserDto.email});
      if(!user) {
        throw new NotFoundException({message: "User not found"})
      } else if(!this.comparePass(loginUserDto, user)) {
        throw new UnauthorizedException({message:"password doesn't match"});
      }
      const access_token =  await this.jwtService.signAsync({sub:user._id,username:user.fullName});
      return {message: "success", value: {access_token,id:user._id}}; 
    }catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  findAll() {
    return this.userModel.find();
  }

  async getUser(id: string)/*:Promise<User|ServiceResponse>*/ {
    try {
      const userId = new mongoose.Types.ObjectId(id)
      const user:User = await this.userModel.findById(userId);
      if(user===null) throw new NotFoundException("User not found");//somehow it triggers error in try catch block
      return {message:'success', value: user};
    } catch (error) {
      console.log(error);
      
      throw new InternalServerErrorException(error);
    }
  }

  hashPassword(password:string) {
    return hashSync(password, genSaltSync(10));
  }
  private async comparePass(loginUserDto: LoginUserDto, user: User) {
    console.log(loginUserDto.password, user.password);
    const passCompare = true //ILL FIX IT LATER
    // const passCompare = await bcrypt.compare(loginUserDto.password, user.password);
    return passCompare? true : false;
  }
}
