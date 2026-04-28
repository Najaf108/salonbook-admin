// app/(dashboard)/users/page.js
'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { useAdminUsers } from '@/hooks/useUsers';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Badge      from '@/components/Badge';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import { Users } from 'lucide-react';
import clsx from 'clsx';

const ROLES = [null, 'CUSTOMER', 'SALON_OWNER', 'ADMIN'];
const ROLE_LABELS = { null: 'All', CUSTOMER: 'Customers', SALON_OWNER: 'Salon Owners', ADMIN: 'Admins' };

export default function UsersPage() {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [role,   setRole]   = useState(null);

  const params = { page, limit: 25, search: search || undefined, role: role ?? undefined };
  const { data, isLoading } = useAdminUsers(params);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Users
        </h2>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or phone..." />
        </div>
      </div>

      {/* Role filter */}
      <div className="flex gap-2">
        {ROLES.map(r => (
          <button
            key={String(r)}
            onClick={() => { setRole(r); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
              role === r ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: total, color: 'text-gray-900' },
            { label: 'Customers', value: data?.customerCount ?? 0, color: 'text-blue-600' },
            { label: 'Salon Owners', value: data?.ownerCount ?? 0, color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <Thead>
            <Th>User</Th><Th>Phone</Th><Th>Role</Th>
            <Th>Gender</Th><Th>Bookings</Th><Th>Joined</Th>
          </Thead>
          <Tbody>
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <Tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <Td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></Td>
                    ))}
                  </Tr>
                ))
              : users.map(user => (
                  <Tr key={user.id}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          {user.fcmToken && <p className="text-xs text-green-500">● Push enabled</p>}
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-sm text-gray-600">{user.phone}</Td>
                    <Td><Badge label={user.role} variant={user.role} /></Td>
                    <Td className="text-gray-500">{user.gender ?? '—'}</Td>
                    <Td className="font-medium">{user._count?.bookings ?? 0}</Td>
                    <Td className="text-gray-400 text-xs">{format(new Date(user.createdAt), 'dd MMM yyyy')}</Td>
                  </Tr>
                ))
            }
          </Tbody>
        </Table>
        <Pagination page={page} total={total} limit={25} onChange={setPage} />
      </div>
    </div>
  );
}
