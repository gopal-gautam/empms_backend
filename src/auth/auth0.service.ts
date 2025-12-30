import { Injectable, Logger } from '@nestjs/common';
import { ManagementClient } from 'auth0';

@Injectable()
export class Auth0Service {
  private readonly logger = new Logger(Auth0Service.name);
  private managementClient: ManagementClient;

  constructor() {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      this.logger.warn(
        'Auth0 Management API credentials not configured. User creation will be skipped.',
      );
      return;
    }

    this.managementClient = new ManagementClient({
      domain,
      clientId,
      clientSecret,
    });
  }

  async createUser(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    if (!this.managementClient) {
      this.logger.warn(
        'Auth0 Management API not configured. Skipping user creation.',
      );
      return;
    }

    try {
      const password = this.generateTemporaryPassword();

      const user = await this.managementClient.users.create({
        email,
        password,
        name: `${firstName} ${lastName}`,
        given_name: firstName,
        family_name: lastName,
        connection: 'Username-Password-Authentication',
        email_verified: false,
      });

      this.logger.log(`Auth0 user created successfully: ${email}`);

      await this.managementClient.tickets.changePassword({
        user_id: user.user_id,
        result_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      });

      this.logger.log(
        `Password change ticket created for user: ${email}. User will receive a password reset email.`,
      );
    } catch (error) {
      this.logger.error(`Failed to create Auth0 user: ${email}`, error.stack);
      throw new Error(
        `Failed to create Auth0 user: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private generateTemporaryPassword(): string {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
