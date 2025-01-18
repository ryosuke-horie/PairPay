import * as jose from 'jose';

// パスワードのハッシュ化
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// JWT生成
export async function generateJWT(
  payload: { id: number; email: string },
  secret: string
): Promise<string> {
  const encodedSecret = new TextEncoder().encode(secret);
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('72h') // トークンの有効期限を3日間に設定
    .sign(encodedSecret);
  return jwt;
}

// JWTの検証
export async function verifyJWT(
  token: string,
  secret: string
): Promise<{ id: number; email: string }> {
  const encodedSecret = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, encodedSecret);
  return {
    id: payload.id as number,
    email: payload.email as string,
  };
}
