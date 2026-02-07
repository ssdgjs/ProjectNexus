import React from 'react'
import { Card, Avatar, Badge } from '@/components/ui'

const LeaderboardPage: React.FC = () => {
  const users = [
    { rank: 1, name: 'Alice', score: 250, role: 'commander' },
    { rank: 2, name: 'Bob', score: 180, role: 'node' },
    { rank: 3, name: 'Charlie', score: 165, role: 'node' },
    { rank: 4, name: 'David', score: 140, role: 'node' },
    { rank: 5, name: 'Eve', score: 120, role: 'node' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">排行榜</h1>
        <p className="text-neutral-600">节点信誉分排名</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">排名</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">用户</th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-900">角色</th>
                <th className="text-right py-4 px-6 font-semibold text-neutral-900">信誉分</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.rank} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-4 px-6">
                    <span className={`font-bold ${user.rank <= 3 ? 'text-ethereal' : 'text-neutral-900'}`}>
                      #{user.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <Avatar name={user.name} size="sm" />
                      <span className="font-medium text-neutral-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={user.role === 'commander' ? 'info' : 'neutral'}>
                      {user.role === 'commander' ? '指挥官' : '节点'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-lg font-bold text-primary-500">{user.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
