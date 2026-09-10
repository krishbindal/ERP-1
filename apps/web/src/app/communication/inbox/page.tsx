import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type ProfileRecord = { first_name?: string | null; last_name?: string | null } | null;

function formatName(profile: ProfileRecord | ProfileRecord[] | undefined): string {
  if (!profile) return '';
  const p = Array.isArray(profile) ? profile[0] : profile;
  if (!p) return '';
  return [p.first_name, p.last_name].filter(Boolean).join(' ');
}

export default async function InboxPage() {
  const supabase = await createClient();
  
  const { data: recipients, error } = await supabase
    .from('communication_recipients')
    .select(`
      message_id,
      status,
      recipient:profiles!recipient_id(first_name, last_name),
      communication_messages (
        subject,
        body,
        created_at,
        sender:profiles!sender_id(first_name, last_name)
      )
    `);
    
  if (error) {
    return (
      <div className="space-y-6 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox</h1>
        <div className="p-4 text-destructive border border-destructive/20 rounded-lg bg-destructive/10 text-sm">
          Error loading inbox: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View messages and announcements sent to your account.
        </p>
      </div>

      <div data-testid="inbox-list" className="space-y-4">
        {recipients && recipients.length > 0 ? (
          recipients.map((r, i) => {
            const msg = Array.isArray(r.communication_messages)
              ? r.communication_messages[0]
              : r.communication_messages;
            const senderName = formatName(msg?.sender as ProfileRecord) || 'Staff';
            const recipientName = formatName(r.recipient as ProfileRecord) || 'You';
            const sentDate = msg?.created_at
              ? new Date(msg.created_at as string).toLocaleDateString()
              : null;
            const badgeVariant =
              r.status === 'READ' || r.status === 'DELIVERED' || r.status === 'SENT'
                ? 'success'
                : r.status === 'FAILED'
                ? 'destructive'
                : 'default';

            return (
              <Card key={r.message_id || i} className="border border-border bg-surface text-surface-foreground">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {msg?.subject as string}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          From: <span className="font-medium text-foreground">{senderName}</span>
                        </span>
                        <span>
                          To: <span className="font-medium text-foreground">{recipientName}</span>
                        </span>
                        {sentDate && <span>Sent: {sentDate}</span>}
                      </div>
                    </div>
                    <Badge variant={badgeVariant}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {msg?.body as string}
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border border-border bg-surface">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Your inbox is empty.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


