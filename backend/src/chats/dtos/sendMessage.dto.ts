import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class SendMessageDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Please enter a message' })
  @MaxLength(2000)
  content!: string;
}
