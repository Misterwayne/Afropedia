import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsNotEmpty()
  content: string; // New Markdown content

  @IsString()
  @IsOptional()
  comment?: string; // Optional edit comment

  // We'll add userId later
  // @IsInt()
  // @IsNotEmpty()
  // userId: number;
}