import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTicketDto {
  @ApiProperty({ description: "Ticket ID" })
  @IsString()
  id: string;

  @ApiProperty({ description: "Ticket Subject" })
  @IsString()
  subject: string;

  @ApiProperty({ description: "Ticket body" })
  @IsString()
  body: string;
}
