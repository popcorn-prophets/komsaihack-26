export type AdvisoryActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: {
    templateName?: string[];
    title?: string[];
    message?: string[];
  };
  stats?: {
    targeted: number;
    delivered: number;
    failed: number;
  };
};

export const INITIAL_ADVISORY_ACTION_STATE: AdvisoryActionState = {
  status: 'idle',
};

export type AdvisoryListItem = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  created_by: string | null;
  creator_name: string | null;
};

export type AdvisoryTemplateItem = {
  id: string;
  name: string;
  title: string;
  message: string;
  created_at: string;
  created_by: string | null;
};
