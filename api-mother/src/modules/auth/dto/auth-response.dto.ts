import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({ description: 'Type of token', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Expires in seconds', example: 3600 })
  expiresIn: number;

  @ApiProperty({
    description: 'JWT Refresh Token (long-lived)',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFTyIsImlhdCI6MTc2NjQxMDk4NSwiZXhwIjoxNzY3MDAwMDAwfQ.XYZ123ABC',
  })
  refreshToken: string;
}
