import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SanitizeString } from '../../../common/decorators/sanitize-string.decorator'; // Import SanitizeString

export class LoginDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'CONVIDADO',
  })
  @SanitizeString() // Apply sanitization
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'xztzu2222',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
