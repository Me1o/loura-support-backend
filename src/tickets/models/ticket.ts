export interface Ticket {
  id: string;
  subject: string;
  body: string;
  category: TicketCategory | undefined;
  priority: TicketPriority | undefined;
  summary: string | undefined;
  status: TicketStatus;
}

export enum TicketCategory {
  BILLING = "billing",
  TECHNICAL = "technical",
  ACCOUNT = "account",
  OTHER = "other",
}

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TicketStatus {
  PENDING = "pending",
  CLASSIFIED = "classified",
  FAILED = "failed",
}
