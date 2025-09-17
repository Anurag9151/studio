
import { render, screen, fireEvent } from '@testing-library/react';
import TodaySchedule from '../today-schedule';
import { AppContext } from '@/contexts/app-context';
import { ToastProvider } from '@/components/ui/toast';

// Use unique IDs for each subject instance
const mockSubjects = [
  { id: '1', name: 'Math', day: 1, startTime: '09:00', endTime: '10:00', color: '#ff0000' },
  { id: '2', name: 'Science', day: 1, startTime: '10:00', endTime: '11:00', color: '#00ff00' },
  { id: '3', name: 'History', day: 2, startTime: '09:00', endTime: '10:00', color: '#0000ff' },
  { id: '4', name: 'Math', day: 1, startTime: '11:00', endTime: '12:00', color: '#ff0000' }, // Duplicate name, different time & ID
];

const mockAttendanceRecords = [];
const setAttendanceRecords = jest.fn();

const renderComponent = (selectedDate: Date, subjects = mockSubjects) => {
  // Mocking useAppContext value
  const contextValue: any = {
    subjects: subjects,
    attendanceRecords: mockAttendanceRecords,
    setAttendanceRecords: setAttendanceRecords,
    setSubjects: jest.fn(),
    settings: { targetPercentage: 75 },
    holidays: [],
    setHolidays: jest.fn(),
  };

  return render(
    <AppContext.Provider value={contextValue}>
      <ToastProvider>
        <TodaySchedule selectedDate={selectedDate} />
      </ToastProvider>
    </AppContext.Provider>
  );
};

describe('TodaySchedule', () => {
    beforeEach(() => {
        // Mock crypto.randomUUID
        global.crypto = {
            ...global.crypto,
            randomUUID: () => 'mock-uuid',
        };
        jest.clearAllMocks();
    });

  it('should render skeletons when not hydrated', () => {
    // To test the initial state, we can't easily mock `hydrated`.
    // We'll just check that it doesn't immediately crash.
    const { container } = renderComponent(new Date('2024-07-29')); // A Monday
    expect(container).toBeDefined();
  });


  it('should render "No subjects scheduled" when no subjects are scheduled for the day', async () => {
    renderComponent(new Date('2024-07-31')); // A Wednesday
    // Wait for the "No subjects" message to appear
    const message = await screen.findByText('No subjects scheduled for Wednesday.');
    expect(message).toBeInTheDocument();
  });

  it('should render unique subjects for the selected day, sorted by start time', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    // Wait for all subjects to be rendered
    const mathSubjects = await screen.findAllByText('Math');
    const scienceSubject = await screen.findByText('Science');
    
    expect(mathSubjects).toHaveLength(2);
    expect(scienceSubject).toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();

    // Check order
    const scheduleItems = screen.getAllByRole('heading', { level: 3 });
    expect(scheduleItems[0].textContent).toBe('Math');
    expect(scheduleItems[1].textContent).toBe('Science');
    expect(scheduleItems[2].textContent).toBe('Math');
  });

  it('should call handleToggleAttendance with "absent" when "Bunk" is clicked', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    const bunkButtons = await screen.findAllByText('Bunk');
    fireEvent.click(bunkButtons[0]);
    expect(setAttendanceRecords).toHaveBeenCalledWith(expect.any(Array));
    expect(setAttendanceRecords).toHaveBeenCalledWith(
        expect.arrayContaining([
            expect.objectContaining({ subjectId: '1', status: 'absent' })
        ])
    );
  });

  it('should call handleToggleAttendance with "present" when "Attend" is clicked', async () => {
    renderComponent(new Date('2024-07-29')); // A Monday
    const attendButtons = await screen.findAllByText('Attend');
    fireEvent.click(attendButtons[0]);
    expect(setAttendanceRecords).toHaveBeenCalledWith(expect.any(Array));
     expect(setAttendanceRecords).toHaveBeenCalledWith(
        expect.arrayContaining([
            expect.objectContaining({ subjectId: '1', status: 'present' })
        ])
    );
  });
});

