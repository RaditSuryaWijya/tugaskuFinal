import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (date) => {
  try {
    if (!date) return '-';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!parsedDate || isNaN(parsedDate.getTime())) return '-';
    if (isToday(parsedDate)) {
      return 'Hari ini';
    } else if (isTomorrow(parsedDate)) {
      return 'Besok';
    } else if (isYesterday(parsedDate)) {
      return 'Kemarin';
    }
    return format(parsedDate, 'dd MMMM yyyy', { locale: id });
  } catch {
    return '-';
  }
};

export const formatTime = (date) => {
  try {
    if (!date) return '-';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!parsedDate || isNaN(parsedDate.getTime())) return '-';
    return format(parsedDate, 'HH:mm', { locale: id });
  } catch {
    return '-';
  }
};

export const getDummyTasks = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      id: '1',
      title: 'Meeting Project TugasKu',
      description: 'Diskusi progress dan timeline project',
      status: 'ongoing',
      startTime: new Date(today.setHours(10, 0)).toISOString(),
      endTime: new Date(today.setHours(11, 30)).toISOString(),
    },
    {
      id: '2',
      title: 'Presentasi Client',
      description: 'Presentasi hasil pengembangan aplikasi',
      status: 'completed',
      startTime: new Date(today.setHours(14, 0)).toISOString(),
      endTime: new Date(today.setHours(15, 0)).toISOString(),
    },
    {
      id: '3',
      title: 'Review Code',
      description: 'Code review untuk fitur baru',
      status: 'delayed',
      startTime: new Date(tomorrow.setHours(9, 0)).toISOString(),
      endTime: new Date(tomorrow.setHours(10, 30)).toISOString(),
    },
  ];
}; 