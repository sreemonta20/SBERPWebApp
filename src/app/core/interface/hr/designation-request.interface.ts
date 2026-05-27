export interface DesignationRequest {
  actionName?: string | null;
  id?: string;
  name: string;
  code?: string;
  description?: string;
  grade?: number;
  createUpdateBy?: string | null;
  isActive?: boolean;
}
