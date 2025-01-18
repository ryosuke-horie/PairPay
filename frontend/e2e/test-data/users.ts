export const generateTestUser = () => ({
  name: `テストユーザー${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
});

export const invalidUser = {
  email: 'invalid@example.com',
  password: 'wrongpassword',
};