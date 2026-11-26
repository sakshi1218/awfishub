'use client';

import { TasksView } from '@/modules/task-management/TasksView';

export default function MyTasksPage() {
  return <TasksView defaultMyTasks={true} />;
}
