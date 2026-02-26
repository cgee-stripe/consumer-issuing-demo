export interface Statement {
  id: string;
  period_start: string | null;
  period_end: string | null;
  statement_url: string | null;
  balance: number;
  amount_due: number;
  due_date: string | null;
  status: string;
}

export interface StatementListResponse {
  statements: Statement[];
}
