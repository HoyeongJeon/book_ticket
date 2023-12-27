import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpUserDto } from './dto/user.dto';

@Injectable()
export class UsersReposiory {
  private usersRepository: Repository<User>;
  constructor(private readonly dataSource: DataSource) {
    this.usersRepository = this.dataSource.getRepository(User);
  }

  async signup(signUpUserDto: SignUpUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userObj = { ...signUpUserDto };
      const user = await this.usersRepository.save(userObj);
      await queryRunner.commitTransaction();
      delete user.password;
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({
      email,
    });
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('로그인 해주세요');
    }
    delete user.password;
    return user;
  }
}
