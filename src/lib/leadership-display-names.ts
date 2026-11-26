interface LeadershipNameSource {
  name: string;
  employeeId?: string | null;
  designation?: string | null;
}

const leadershipNamesByEmployeeId: Record<string, string> = {
  'ML-F01': 'Pooja Ahire',
  'ML-D01': 'Anchal Agawane',
  'ML-D02': 'Rutuja Botre',
  'ML-D03': 'Shubham Jadhav',
};

const leadershipNamesByDesignation: Record<string, string> = {
  'Founder & Managing Director': 'Pooja Ahire',
  'Director of Sales & Partnerships': 'Anchal Agawane',
  'Director of Technology & Product': 'Rutuja Botre',
  'Director of Operations & People': 'Shubham Jadhav',
};

export function getLeadershipDisplayName(person: LeadershipNameSource): string {
  return (
    (person.employeeId && leadershipNamesByEmployeeId[person.employeeId]) ||
    (person.designation && leadershipNamesByDesignation[person.designation]) ||
    person.name
  );
}
