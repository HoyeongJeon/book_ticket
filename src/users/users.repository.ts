import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpUserDto } from './dto/user.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersReposiory {
  private usersRepository: Repository<User>;
  private profilesReposiory: Repository<Profile>;
  constructor(private readonly dataSource: DataSource) {
    this.usersRepository = this.dataSource.getRepository(User);
    this.profilesReposiory = this.dataSource.getRepository(Profile);
  }

  async signup(signUpUserDto: SignUpUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const profile = this.profilesReposiory.create();
      const userObj = { ...signUpUserDto, profile };
      const user = await this.usersRepository.save(userObj);
      await this.profilesReposiory.save(profile);
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
    delete user.password;
    return user;
  }
}
