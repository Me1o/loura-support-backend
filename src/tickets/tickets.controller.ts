import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TicketsService } from "./tickets.service";
import { ListTicketDto } from "./models/dtos/list-ticket.dto";
import { PaginatedListResponse } from "./../shared/models/dtos/paginatedListResponse.dto";
import { TicketsFilterDto } from "./models/dtos/filter-tickets.dto";
import { CreateTicketDto } from "./models/dtos/create-ticket.dto";
import { GetTicketDto } from "./models/dtos/get-ticket.dto";
import { TicketsDetailsFilterDto } from "./models/dtos/filter-tickets-details.dto";

@ApiTags("tickets")
@Controller("tickets")
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  @ApiOperation({ summary: "tickets create" })
  @ApiOkResponse({
    description: "Creates a new ticket",
  })
  async create(@Body() dto: CreateTicketDto) {
    return await this.service.create(dto);
  }

  @Get("list")
  @ApiOperation({ summary: "tickets list" })
  @ApiOkResponse({
    description: "Returns a paginated, filtered list of tickets",
  })
  async list(
    @Query() filters: TicketsFilterDto,
  ): Promise<PaginatedListResponse<ListTicketDto>> {
    return await this.service.list(filters);
  }

  @Get()
  @ApiOperation({ summary: "tickets details" })
  @ApiOkResponse({
    description: "Returns a ticket by id",
  })
  async get(@Query() filter: TicketsDetailsFilterDto): Promise<GetTicketDto> {
    return await this.service.get(filter);
  }
}
