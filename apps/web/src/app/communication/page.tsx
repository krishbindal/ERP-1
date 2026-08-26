import { getAppContext } from '@/lib/branch-context';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CommunicationDashboard() {
  const context = await getAppContext();
  if (!context) redirect('/login');

  const supabase = await createClient();

  const isAdmin = context.roles.includes('branchadmin') || context.roles.includes('superadmin');
  const isTeacher = context.roles.includes('teacher');

  // Fetch Inbox
  const { data: inboxData } = await supabase
    .from('communication_recipients')
    .select(`
      id,
      status,
      read_at,
      message:communication_messages(
        id, subject, body, created_at, sender:profiles!sender_id(first_name, last_name)
      )
    `)
    .eq('recipient_id', context.userId)
    .order('created_at', { referencedTable: 'communication_messages', ascending: false });

  // Fetch Sent Messages (If Admin or Teacher)
  let sentMessages: any[] = [];
  if (isAdmin || isTeacher) {
    const { data } = await supabase
      .from('communication_messages')
      .select(`id, subject, status, created_at`)
      .eq('sender_id', context.userId)
      .order('created_at', { ascending: false });
    sentMessages = data || [];
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communication Center</h1>
        {(isAdmin || isTeacher) && (
          <Link href="/communication/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            New Message
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inbox Section */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
          {inboxData && inboxData.length > 0 ? (
            <ul className="space-y-4">
              {inboxData.map((item: any) => {
                const msg = Array.isArray(item.message) ? item.message[0] : item.message;
                if (!msg) return null;
                const isUnread = item.status === 'UNREAD';
                return (
                  <li key={item.id} className={`p-4 border rounded-md hover:bg-gray-50 ${isUnread ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex justify-between">
                      <h3 className={`font-bold ${isUnread ? 'text-blue-900' : ''}`}>{msg.subject}</h3>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                      <span>{msg.sender?.first_name} {msg.sender?.last_name}</span>
                      <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">Your inbox is empty.</p>
          )}
        </div>

        {/* Sent Messages Section */}
        {(isAdmin || isTeacher) && (
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Sent Messages</h2>
            {sentMessages && sentMessages.length > 0 ? (
              <ul className="space-y-4">
                {sentMessages.map((msg: any) => (
                  <li key={msg.id} className="p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{msg.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${msg.status === 'SENT' || msg.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                      <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                      
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">You haven't sent any messages.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
