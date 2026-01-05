import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER_URL,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    // Debug: show payload summary to confirm which token is received
    // console.log('JWT payload:', payload);

    // Extract roles from Auth0 token - check multiple possible claim names and shapes
    const roles =
      payload['dev-3ta8qvqwr3z4tzl2.au.auth0.com/roles'] ||
      payload['dev-3ta8qvqwr3z4tzl2.au.auth0.com/auth-roles'] ||
      (payload.authorization && payload.authorization.roles) ||
      payload.permissions ||
      [];
    
    const email = payload.email ||
    payload['dev-3ta8qvqwr3z4tzl2.au.auth0.com/email'] || '';
    
    
    // console.log('Extracted roles:', roles);

    return {
      userId: payload.sub,
      email: email,
      roles: roles,
    };
  }
}
