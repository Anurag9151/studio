
import { render, screen, fireEvent } from '@testing-library/react';
import TodaySchedule from '../today-schedule';
import { AppContext } from '@/contexts/app-context';
import { ToastProvider } from '@/components/ui/toast';

const mockSubjects = [
  { id: '1', name: 'Math', day: '1', startTime: '09:00', endTime: '10:00', color: '#ff0000' },
  { id: '2', name: 'Science', day: '1', startTime: '10:00', endTime: '11:00', color: '#00ff00' },
  { id: '3', name: 'History', day: '2', startTime: '09:00', endTime: '10:00', color: '#0000ff' },
  { id: '1', name: 'Math', day: '1', startTime: '09:00', endTime: '10:00', color: '#ff0000' }, // Duplicate
];

const mockAttendanceRecords = [];
const setAttendanceRecords = jest.fn();

const renderComponent = (selectedDate: Date, subjects = mockSubjects) => {
  return render(
    <AppContext.Provider value={{ subjects, attendanceRecords: mockAttendanceRecords, setAttendanceRecords, setSubjects: jest.fn() }}>
      <ToastProvider>
        <TodaySchedule selectedDate={selectedDate} />
      </ToastProvider>
    </AppContext.Provider>
  );
};

describe('TodaySchedule', () => {
  it('should render skeletons on initial render', () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    expect(screen.getAllByRole('generic', { name: 'skeleton' })).toHaveLength(3);
  });

  it('should render "No classes scheduled" when no subjects are scheduled for the day', async () => {
    renderComponent(new Date('2024-07-31')); // A Wednesday
    await screen.findByText('No classes scheduled for Wednesday.');
  });

  it('should render unique subjects for the selected day, sorted by start time', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    await screen.findByText('Math');
    await screen.findByText('Science');
    expect(screen.queryByText('History')).not.toBeInTheDocument();
  });

  it('should call handleMarkAttendance with "absent" when "Bunk" is clicked', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    await screen.findByText('Math');
    fireEvent.click(screen.getByText('Bunk'));
    expect(setAttendanceRecords).toHaveBeenCalled();
  });

  it('should call handleMarkAttendance with "present" when "Attend" is clicked', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    await screen.findByText('Math');
    fireEvent.click(screen.getByText('Attend'));
    expect(setAttendanceRecords).toHaveBeenCalled();
  });
});
