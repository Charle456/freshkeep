import { ChartColumn, House, PackageSearch, UserRound } from 'lucide-react'
import type { NavigationItem } from '@/components/BottomNav'

export const navigationItems: NavigationItem[] = [
  { label: '首页', path: '/', icon: House },
  { label: '记录', path: '/inventory', icon: PackageSearch },
  { label: '统计', path: '/insights', icon: ChartColumn },
  { label: '我的', path: '/profile', icon: UserRound },
]

export const insightCards = [
  {
    title: '本周风险峰值',
    value: '周四',
    description: '食品、零食、药品和日化用品都会按保质期进入提醒窗口。',
  },
  {
    title: '最活跃分类',
    value: '零食 / 药品',
    description: '适合继续拆成常温零食、家庭药箱、保健品和日化用品。',
  },
  {
    title: '处理完成率',
    value: '76%',
    description: '完成临期复核、使用或清理任务后，Fresh Score 会更好看。',
  },
]

export const profileGroups = [
  {
    title: '提醒设置',
    items: ['临期提前 3 天提醒', '药品到期复核提醒', '高风险状态置顶显示'],
  },
  {
    title: '数据管理',
    items: ['导入历史记录', '导出 CSV', '管理零食 / 药品 / 日化分类'],
  },
]
