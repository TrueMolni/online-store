import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new Error("User with this email already exists");
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  public async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      return null;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new Error("Email is already in use");
      }
    }

    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ["orders"],
    });
  }
}
