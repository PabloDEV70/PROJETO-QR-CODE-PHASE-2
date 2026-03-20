import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token obtained during login',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNPTlZJREFTyIsImlhdCI6MTc2NjQxMDk4NSwiZXhwIjoxNzY3MDAwMDAwfQ.XYZ123ABC',
  })
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
