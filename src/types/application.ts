export type ApplicationStatus =
  | "new"
  | "in_review"
  | "approved"
  | "rejected";

export type ApplicationPriority = "low" | "medium" | "high";

export interface Application {
  id: number;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  amount: number;
  createdAt: string;
  description: string;
}
