import { ApiProperty } from "@nestjs/swagger";
import { TicketCategory, TicketPriority } from "../ticket";

export class ListTicketDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ enum: TicketCategory, nullable: true })
  category: TicketCategory | null;

  @ApiProperty({ enum: TicketPriority, nullable: true })
  priority: TicketPriority | null;

  @ApiProperty({ nullable: true })
  summary: string | null;
}
