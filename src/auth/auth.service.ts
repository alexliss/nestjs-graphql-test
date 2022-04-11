import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    getToken(userId: string): string {
        const payload = { userId }
        return this.jwtService.sign({ payload })
    }
}