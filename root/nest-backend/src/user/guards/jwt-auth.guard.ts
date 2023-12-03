import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()
        try {
            let authHeader = req.headers.authorization;
            const bearer:string = authHeader.split(' ')[0];
            const token:string = authHeader.split(' ')[1]
            if(bearer !== "Bearer" || !token) {
                throw new UnauthorizedException("User is not authorized")
            };
            const user = this.jwtService.verify(token);
            req.user = user;
            return true
        } catch (error) {
            throw new UnauthorizedException("User is not authorized")
        }
    }
}