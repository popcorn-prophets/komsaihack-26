import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdvisoryListItem } from '@/lib/advisories/types';
import { formatSmartDateTime } from '@/lib/date';

export function AdvisoryCard({ advisory }: { advisory: AdvisoryListItem }) {
  const authorName = advisory.creator_name?.trim() || 'Response team';

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex gap-1.5 items-center flex-wrap">
          <span>{authorName}</span>
          <span>posted {formatSmartDateTime(advisory.created_at)}</span>
        </CardDescription>
        <CardTitle className="text-lg leading-tight">
          {advisory.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {advisory.message}
        </p>
      </CardContent>
    </Card>
  );
}
