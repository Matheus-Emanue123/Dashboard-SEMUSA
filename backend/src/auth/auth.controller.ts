import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user,
    };
  }
}
