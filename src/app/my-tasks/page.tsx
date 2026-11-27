'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TasksView } from '@/modules/task-management/TasksView';

export default function MyTasksPage() {
  const { isChairperson } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isChairperson) {
      router.replace('/tasks');
    }
  }, [isChairperson, router]);

  if (isChairperson) return null;
  return <TasksView defaultMyTasks={true} />;
}
