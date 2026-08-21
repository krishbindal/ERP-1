export interface Room {
  id: string;
  branch_id: string;
  name: string;
  capacity: number;
  status: string;
}

export interface BellSchedule {
  id: string;
  branch_id: string;
  name: string;
  status: string;
}

export interface Period {
  id: string;
  bell_schedule_id: string;
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: string;
  bell_schedules?: { name: string };
}
