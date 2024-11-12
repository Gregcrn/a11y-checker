export interface AuditViolation {
  help: string;
  description: string;
  impact: string;
  helpUrl: string;
}

export interface AuditIncomplete {
  help: string;
  description: string;
}

export interface AuditPass {
  help: string;
  description: string;
}

export interface AuditResults {
  violations: AuditViolation[];
  incomplete: AuditIncomplete[];
  passes: AuditPass[];
}

export interface AuditResponse {
  auditId: string;
  results: AuditResults;
} 