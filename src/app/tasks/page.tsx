'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TasksView } from '@/modules/task-management/TasksView';

export default function TasksPage() {
  const { isChairperson, isDirector, isOperationHead } = useApp();
  const router = useRouter();
  const canViewTaskManagement = isChairperson || isDirector || isOperationHead;

  useEffect(() => {
    if (!canViewTaskManagement) {
      router.replace('/my-tasks');
    }
  }, [canViewTaskManagement, router]);

  if (!canViewTaskManagement) return null;
  return <TasksView />;
}
