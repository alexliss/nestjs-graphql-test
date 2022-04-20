import { User } from "src/user/user.entity";
import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import * as argon2 from "argon2";

export default class UserSeed implements Seeder {
    public async run(factory: Factory, connection: Connection) {
        const users = await factory(User)().map(async user =>  {
            user.password = await argon2.hash(user.username)
            return user
        }).createMany(1000)
    }
}