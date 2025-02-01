import type { IUserRepository } from '../repositories/user.repository';
import type { LoginResponse, UserCreateInput, UserLoginInput } from '../types';
import { generateJWT, hashPassword, verifyJWT } from '../utils/auth.js';
import { AuthenticationError, DuplicateError } from '../utils/error.js';

export interface TokenPayload {
  sub: string;
  email: string;
}

// 認証サービスのインターフェース
export interface IAuthService {
  register(input: UserCreateInput): Promise<void>;
  login(input: UserLoginInput): Promise<LoginResponse>;
  verifyToken(token: string): Promise<TokenPayload>;
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
      throw new DuplicateError('このメールアドレスは既に登録されています');
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
      throw new AuthenticationError('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワードの検証
    const hashedPassword = await hashPassword(input.password);
    if (hashedPassword !== user.password) {
      throw new AuthenticationError('メールアドレスまたはパスワードが正しくありません');
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

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await verifyJWT(token, this.jwtSecret);
      return {
        sub: payload.id.toString(),
        email: payload.email,
      };
    } catch (error) {
      throw new AuthenticationError('トークンが無効です');
    }
  }
}
