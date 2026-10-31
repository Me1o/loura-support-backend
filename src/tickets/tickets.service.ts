import { Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus, type Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { PaginatedListResponse } from "../shared/models/dtos/paginatedListResponse.dto";
import type { CreateTicketDto } from "./models/dtos/create-ticket.dto";
import type { TicketsFilterDto } from "./models/dtos/filter-tickets.dto";
import type { GetTicketDto } from "./models/dtos/get-ticket.dto";
import type { ListTicketDto } from "./models/dtos/list-ticket.dto";
import { TicketCategory, TicketPriority } from "./models/ticket";
import { TicketsDetailsFilterDto } from "./models/dtos/filter-tickets-details.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TicketsService {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue("classifier") private classifierQueue: Queue
  ) {}

  async create(dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.upsert({
      where: {
        id: dto.id,
      },
      update: { id: dto.id },
      create: dto,
    });

    const isCreated = ticket.createdAt.getTime() === ticket.updatedAt.getTime();

    if (isCreated) {
      await this.classifierQueue.add("classifier", ticket, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      });
    }

    return ticket;
  }

  async list(
    filters: TicketsFilterDto
  ): Promise<PaginatedListResponse<ListTicketDto>> {
    const where: Prisma.TicketWhereInput = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }

    const [tickets, count] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const results: ListTicketDto[] = tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      body: ticket.body,
      category: ticket.category as TicketCategory | null,
      priority: ticket.priority as TicketPriority | null,
      summary: ticket.summary,
    }));

    return { results, count };
  }

  async get(filter: TicketsDetailsFilterDto): Promise<GetTicketDto> {
    const id = filter.id.toString();
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      body: ticket.body,
      category: ticket.category as TicketCategory | null,
      priority: ticket.priority as TicketPriority | null,
      summary: ticket.summary,
    };
  }

  async retryFailedClassificationJobs(): Promise<void> {
    const parsedLimit = parseInt(
      this.configService.get<string>("RETRY_SIZE_LIMIT") ?? "5",
      5
    );
    const retryLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 1;

    const where: Prisma.TicketWhereInput = { status: TicketStatus.failed };

    const tickets = await this.prisma.ticket.findMany({
      where,
      take: retryLimit,
    });

    if (tickets.length === 0) {
      return;
    }

    const pendingTickets = tickets.map((ticket) => ({
      ...ticket,
      status: TicketStatus.pending,
    }));

    await this.prisma.$transaction(
      pendingTickets.map((ticket) =>
        this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.pending },
        })
      )
    );

    await Promise.all(
      pendingTickets.map((ticket) =>
        this.classifierQueue.add("classifier", ticket, {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        })
      )
    );
  }
}
