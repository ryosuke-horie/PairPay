import { IUserRepository } from '../repositories/user.repository';
import { LoginResponse, UserCreateInput, UserLoginInput, UserResponse } from '../types';
import { generateJWT, hashPassword } from '../utils/auth';

// 認証サービスのインターフェース
export interface IAuthService {
  register(input: UserCreateInput): Promise<void>;
  login(input: UserLoginInput): Promise<LoginResponse>;
}

// 認証サービスの実装
export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string
  ) {}

  async register(input: UserCreateInput): Promise<void> {
    // メールアドレスの重複チェック
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(input.password);

    // ユーザーの作成
    await this.userRepository.create({
      ...input,
      password: hashedPassword,
    });
  }

  async login(input: UserLoginInput): Promise<LoginResponse> {
    // ユーザーの検索
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // パスワードの検証
    const hashedPassword = await hashPassword(input.password);
    if (hashedPassword !== (user as any).password) {
      throw new Error('Invalid email or password');
    }

    // JWTの生成
    const token = await generateJWT({ id: user.id, email: user.email }, this.jwtSecret);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
