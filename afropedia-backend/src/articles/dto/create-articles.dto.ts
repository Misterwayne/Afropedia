import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string; // Raw title from user

  @IsString()
  @IsNotEmpty()
  content: string; // Initial Markdown content

  @IsString()
  @IsOptional() // Edit comment is optional
  comment?: string;

  // We'll add userId later when authentication is implemented
  // @IsInt()
  // @IsNotEmpty()
  // userId: number;
}