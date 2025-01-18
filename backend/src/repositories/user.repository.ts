import { eq } from 'drizzle-orm';
import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { users } from '../../drizzle/schema';
import type { UserCreateInput, UserResponse } from '../types';

// ユーザーリポジトリのインターフェース
export interface IUserRepository {
  findByEmail(email: string): Promise<UserResponse | undefined>;
  findById(id: number): Promise<UserResponse | undefined>;
  create(input: UserCreateInput & { password: string }): Promise<void>;
}

// ユーザーリポジトリの実装
export class UserRepository implements IUserRepository {
  private db: DrizzleD1Database;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async findByEmail(email: string): Promise<UserResponse | undefined> {
    const user = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .get();

    return user;
  }

  async findById(id: number): Promise<UserResponse | undefined> {
    const user = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, id))
      .get();

    return user;
  }

  async create(input: UserCreateInput & { password: string }): Promise<void> {
    await this.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password: input.password,
      })
      .execute();
  }
}
