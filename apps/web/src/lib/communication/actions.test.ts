import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessage, sendMessage, markMessageRead } from './actions';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Communication Server Actions', () => {
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue({
      rpc: mockRpc,
    });
  });

  it('createMessage calls rpc_create_message successfully', async () => {
    mockRpc.mockResolvedValue({ data: 'mock-uuid', error: null });

    const result = await createMessage(
      'org-1',
      'branch-1',
      'Test Subject',
      'Test Body',
      'ANNOUNCEMENT',
      [{ target_type: 'BRANCH' }]
    );

    expect(result).toBe('mock-uuid');
    expect(mockRpc).toHaveBeenCalledWith('rpc_create_message', expect.objectContaining({
      p_organization_id: 'org-1',
      p_branch_id: 'branch-1',
      p_subject: 'Test Subject',
      p_targets: [{ target_type: 'BRANCH' }],
    }));
    expect(revalidatePath).toHaveBeenCalledWith('/communication');
  });

  it('sendMessage calls rpc_send_message successfully', async () => {
    mockRpc.mockResolvedValue({ error: null });
    await sendMessage('msg-1');
    expect(mockRpc).toHaveBeenCalledWith('rpc_send_message', { p_message_id: 'msg-1' });
  });

  it('markMessageRead calls rpc_mark_read successfully', async () => {
    mockRpc.mockResolvedValue({ error: null });
    await markMessageRead('msg-1');
    expect(mockRpc).toHaveBeenCalledWith('rpc_mark_read', { p_message_id: 'msg-1' });
  });

  it('throws error on rpc failure', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'RPC Error' } });
    await expect(sendMessage('msg-1')).rejects.toThrow('Failed to send message: RPC Error');
  });
});
