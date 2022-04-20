import { faker } from '@faker-js/faker'
import { User } from 'src/user/user.entity';
import { define } from 'typeorm-seeding';

define(User, () => {
    const username = faker.internet.userName()
    const user = new User()
    user.username = username, 
    user.email = faker.internet.email(username),
    user.password = username 
    return user
})