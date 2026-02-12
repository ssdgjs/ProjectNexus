import React from 'react'
import { Card, Badge, Avatar } from '@/components/ui'
import { useModules } from '@/services/queries'

const LeaderboardPage: React.FC = () => {
  const { data: modules } = useModules()

  // 计算所有用户的信誉分
  const userScores = React.useMemo(() => {
    const scores: Record<string, { username: string; role: string; score: number; modules: number }> = {}

    // 初始化分数
    modules?.forEach((module: any) => {
      module.assignees?.forEach((assignee: any) => {
        if (!scores[assignee.username]) {
          scores[assignee.username] = {
            username: assignee.username,
            role: assignee.role,
            score: 100, // 初始分数
            modules: 0,
          }
        }
        scores[assignee.username].modules += 1
        if (assignee.allocated_score) {
          scores[assignee.username].score += assignee.allocated_score
        }
      })
    })

    return Object.values(scores).sort((a, b) => b.score - a.score)
  }, [modules])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">排行榜</h1>
        <p className="text-neutral-600">按信誉分排名</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">排名</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">用户</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">角色</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">完成任务</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-900">信誉分</th>
              </tr>
            </thead>
            <tbody>
              {userScores.length > 0 ? (
                userScores.map((user, index) => (
                  <tr key={user.username} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && <span className="text-neutral-500">#{index + 1}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Avatar name={user.username} size="sm" />
                        <span className="font-medium text-neutral-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.role?.toLowerCase() === 'commander' && (
                        <Badge variant="success">指挥官</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{user.modules}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-lg font-bold text-primary-500">{user.score}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
