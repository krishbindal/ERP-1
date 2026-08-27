import { createClient } from '@/lib/supabase/server';

export default async function InboxPage() {
  const supabase = await createClient();
  
  const { data: recipients, error } = await supabase
    .from('communication_recipients')
    .select(`
      message_id,
      status,
      communication_messages (
        subject,
        body
      )
    `);
    
  if (error) {
    return <div>Error loading inbox</div>;
  }

  return (
    <div>
      <h1>Inbox</h1>
      <div data-testid="inbox-list">
        {recipients?.map((r, i) => {
          const msg = Array.isArray(r.communication_messages) ? r.communication_messages[0] : r.communication_messages;
          return (
            <div key={i} className="message">
              <h3>{msg?.subject as string}</h3>
              <p>{msg?.body as string}</p>
              <p>Status: {r.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
