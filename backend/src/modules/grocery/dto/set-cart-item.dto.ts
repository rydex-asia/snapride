import { IsInt, Max, Min } from 'class-validator';

export class SetCartItemDto {
  @IsInt()
  @Min(0)
  @Max(99)
  quantity!: number;
}
