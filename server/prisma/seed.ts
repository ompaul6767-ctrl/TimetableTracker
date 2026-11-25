import { PrismaClient, UserRole, SubjectType, SlotType, Day, SemesterType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertTeachingAssignment(data: {
  termId: string;
  facultyId: string;
  subjectId: string;
  divisionId: string;
  batchId: string | null;
  hoursPerWeek: number;
}) {
  const existing = await prisma.teachingAssignment.findFirst({
    where: {
      termId: data.termId,
      facultyId: data.facultyId,
      subjectId: data.subjectId,
      divisionId: data.divisionId,
      batchId: data.batchId,
    },
  });

  if (existing) {
    return prisma.teachingAssignment.update({
      where: { id: existing.id },
      data: { hoursPerWeek: data.hoursPerWeek, isActive: true },
    });
  }

  return prisma.teachingAssignment.create({ data });
}

async function main() {
  console.log('🌱 Starting CTMS seed...\n');

  // =============================================
  // DEPARTMENT
  // =============================================
  const dept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Department of Computer Engineering',
      code: 'CSE',
      isActive: true,
    },
  });
  console.log(`✅ Department: ${dept.name} (${dept.code})`);

  // Department Settings
  await prisma.departmentSettings.upsert({
    where: { departmentId: dept.id },
    update: {},
    create: {
      departmentId: dept.id,
      workingDays: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY],
      minStudentDailyHours: 4,
      maxStudentDailyHours: 5,
      practicalBlockSlots: 2,
      availabilityDeadlineDays: 3,
    },
  });

  // =============================================
  // ACADEMIC TERM (Idempotent)
  // =============================================
  let term = await prisma.academicTerm.findFirst({
    where: {
      departmentId: dept.id,
      year: '2026-27',
      semester: SemesterType.ODD,
    },
  });

  if (!term) {
    term = await prisma.academicTerm.create({
      data: {
        departmentId: dept.id,
        year: '2026-27',
        semester: SemesterType.ODD,
        isCurrent: true,
      },
    });
  }
  console.log(`✅ Academic Term: ${term.year} ${term.semester} (current)`);

  // =============================================
  // DEMO USERS (ADMIN, COORDINATOR, FACULTY)
  // =============================================
  const BCRYPT_ROUNDS = 10;

  const adminPassword = 'Admin@1234';
  const coordinatorPassword = 'Coord@1234';
  const facultyPassword = 'Faculty@1234';

  await prisma.user.upsert({
    where: { email: 'admin@zeal.edu.in' },
    update: {},
    create: {
      email: 'admin@zeal.edu.in',
      passwordHash: await bcrypt.hash(adminPassword, BCRYPT_ROUNDS),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const coordinatorUser = await prisma.user.upsert({
    where: { email: 'coordinator@zeal.edu.in' },
    update: {},
    create: {
      email: 'coordinator@zeal.edu.in',
      passwordHash: await bcrypt.hash(coordinatorPassword, BCRYPT_ROUNDS),
      role: UserRole.COORDINATOR,
      isActive: true,
    },
  });

  // Link coordinator to department
  await prisma.coordinatorDepartment.upsert({
    where: { userId_departmentId: { userId: coordinatorUser.id, departmentId: dept.id } },
    update: {},
    create: { userId: coordinatorUser.id, departmentId: dept.id },
  });

  const facultyUserAccount = await prisma.user.upsert({
    where: { email: 'kinjal.vele@zeal.edu.in' },
    update: {},
    create: {
      email: 'kinjal.vele@zeal.edu.in',
      passwordHash: await bcrypt.hash(facultyPassword, BCRYPT_ROUNDS),
      role: UserRole.FACULTY,
      isActive: true,
    },
  });

  console.log('\n🔑 Demo Credentials:');
  console.log('─────────────────────────────────────────');
  console.log(`ADMIN       → email: admin@zeal.edu.in       | password: ${adminPassword}`);
  console.log(`COORDINATOR → email: coordinator@zeal.edu.in  | password: ${coordinatorPassword}`);
  console.log(`FACULTY     → email: kinjal.vele@zeal.edu.in | password: ${facultyPassword}`);
  console.log('─────────────────────────────────────────\n');

  // =============================================
  // TIME SLOTS (MONDAY–SATURDAY, 8 slots/day)
  // =============================================
  const days: Day[] = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
    Day.SATURDAY,
  ];

  const slotTemplates: Array<{
    slotNumber: number;
    startTime: string;
    endTime: string;
    type: SlotType;
  }> = [
    { slotNumber: 1, startTime: '09:00', endTime: '10:00', type: SlotType.LECTURE },
    { slotNumber: 2, startTime: '10:00', endTime: '11:00', type: SlotType.LECTURE },
    { slotNumber: 3, startTime: '11:00', endTime: '11:15', type: SlotType.RECESS },
    { slotNumber: 4, startTime: '11:15', endTime: '12:15', type: SlotType.LECTURE },
    { slotNumber: 5, startTime: '12:15', endTime: '13:15', type: SlotType.LECTURE },
    { slotNumber: 6, startTime: '13:15', endTime: '14:00', type: SlotType.LUNCH },
    { slotNumber: 7, startTime: '14:00', endTime: '15:00', type: SlotType.LECTURE },
    { slotNumber: 8, startTime: '15:00', endTime: '16:00', type: SlotType.LECTURE },
  ];

  for (const day of days) {
    for (const slot of slotTemplates) {
      await prisma.timeSlot.upsert({
        where: { day_slotNumber: { day, slotNumber: slot.slotNumber } },
        update: {
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: slot.type,
          isActive: true,
        },
        create: {
          day,
          slotNumber: slot.slotNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: slot.type,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Upserted ${days.length * slotTemplates.length} time slots (Mon–Sat × 8 slots)`);

  // =============================================
  // SUBJECTS (S.Y.B.Tech Sem-I / Semester 3)
  // =============================================
  const subjects = [
    { code: 'CS301', name: 'Data Structures', type: SubjectType.THEORY, theoryHoursPerWeek: 3, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS302', name: 'Processor Architecture & System Design', type: SubjectType.THEORY, theoryHoursPerWeek: 2, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS303', name: 'Java Programming', type: SubjectType.THEORY, theoryHoursPerWeek: 3, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS304', name: 'Discrete Mathematics', type: SubjectType.THEORY, theoryHoursPerWeek: 3, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS305', name: 'Open Elective-I: Digital Literacy and Applications', type: SubjectType.THEORY, theoryHoursPerWeek: 2, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS306', name: 'Digital Marketing & Social Media', type: SubjectType.THEORY, theoryHoursPerWeek: 2, practicalHoursPerWeek: null, semester: 3 },
    { code: 'CS301L', name: 'Data Structures Lab', type: SubjectType.PRACTICAL, theoryHoursPerWeek: null, practicalHoursPerWeek: 4, semester: 3 },
    { code: 'CS302L', name: 'Processor Architecture & System Design Lab', type: SubjectType.PRACTICAL, theoryHoursPerWeek: null, practicalHoursPerWeek: 2, semester: 3 },
    { code: 'CS303L', name: 'Java Programming Lab', type: SubjectType.PRACTICAL, theoryHoursPerWeek: null, practicalHoursPerWeek: 4, semester: 3 },
    { code: 'CS304L', name: 'Project Based Learning', type: SubjectType.PRACTICAL, theoryHoursPerWeek: null, practicalHoursPerWeek: 2, semester: 3 },
  ];

  const subjectMap: Record<string, string> = {};
  for (const s of subjects) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        type: s.type,
        theoryHoursPerWeek: s.theoryHoursPerWeek,
        practicalHoursPerWeek: s.practicalHoursPerWeek,
        semester: s.semester,
      },
      create: { departmentId: dept.id, ...s },
    });
    subjectMap[s.code] = subject.id;
  }
  console.log(`✅ Upserted ${subjects.length} subjects`);

  // =============================================
  // FACULTY
  // =============================================
  const facultyData = [
    // Theory faculty
    { firstName: 'Kinjal', lastName: 'Vele', email: 'kinjal.vele@zeal.edu.in', employeeCode: 'F001', userId: facultyUserAccount.id },
    { firstName: 'Sanjay', lastName: 'Dhage', email: 'sanjay.dhage@zeal.edu.in', employeeCode: 'F002' },
    { firstName: 'Pradnya', lastName: 'Igave', email: 'pradnya.igave@zeal.edu.in', employeeCode: 'F003' },
    { firstName: 'A. S.', lastName: 'Pijdurkar', email: 'as.pijdurkar@zeal.edu.in', employeeCode: 'F004' },
    { firstName: 'Santosh', lastName: 'Varpe', email: 'santosh.varpe@zeal.edu.in', employeeCode: 'F005' },
    { firstName: 'J. S.', lastName: 'Nadaf', email: 'js.nadaf@zeal.edu.in', employeeCode: 'F006' },
    { firstName: 'Ganesh', lastName: 'Warule', email: 'ganesh.warule@zeal.edu.in', employeeCode: 'F007' },
    { firstName: 'Vidya', lastName: 'Salunkhe', email: 'vidya.salunkhe@zeal.edu.in', employeeCode: 'F008' },
    { firstName: 'Pooja', lastName: 'Kachare', email: 'pooja.kachare@zeal.edu.in', employeeCode: 'F009' },
    { firstName: 'R. R.', lastName: 'Jadhav', email: 'rr.jadhav@zeal.edu.in', employeeCode: 'F010' },
    { firstName: 'Y. P.', lastName: 'Shirbhate', email: 'yp.shirbhate@zeal.edu.in', employeeCode: 'F011' },
    { firstName: 'A. S.', lastName: 'Khaple', email: 'as.khaple@zeal.edu.in', employeeCode: 'F012' },
    // Lab faculty
    { firstName: 'A. M.', lastName: 'Shinde', email: 'am.shinde@zeal.edu.in', employeeCode: 'F013' },
    { firstName: 'R.', lastName: 'Yawalkar', email: 'r.yawalkar@zeal.edu.in', employeeCode: 'F014' },
    { firstName: 'B.', lastName: 'Gorde', email: 'b.gorde@zeal.edu.in', employeeCode: 'F015' },
    { firstName: 'S. D.', lastName: 'Nanaware', email: 'sd.nanaware@zeal.edu.in', employeeCode: 'F016' },
    { firstName: 'Sonali', lastName: 'Goral', email: 'sonali.goral@zeal.edu.in', employeeCode: 'F017' },
    { firstName: 'P. S.', lastName: 'Kachare', email: 'ps.kachare@zeal.edu.in', employeeCode: 'F018' },
    { firstName: 'Rohit', lastName: 'Sonone', email: 'rohit.sonone@zeal.edu.in', employeeCode: 'F019' },
    { firstName: 'Ashwini', lastName: 'Golande', email: 'ashwini.golande@zeal.edu.in', employeeCode: 'F020' },
  ];

  const facultyMap: Record<string, string> = {};
  for (const f of facultyData) {
    const existing = await prisma.faculty.findFirst({ where: { email: f.email } });
    if (!existing) {
      const faculty = await prisma.faculty.create({
        data: { departmentId: dept.id, ...f },
      });
      facultyMap[f.employeeCode] = faculty.id;
    } else {
      facultyMap[f.employeeCode] = existing.id;
    }
  }
  console.log(`✅ Ensured ${facultyData.length} faculty members`);

  // =============================================
  // DIVISIONS & BATCHES (S.Y.B.Tech = Year 2, Sem 3)
  // =============================================
  const divisionNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
  const batchNames = ['E1', 'E2', 'E3'] as const;
  const divisionMap: Record<string, string> = {};
  const allBatches: Array<{ divName: string; batchName: string; divisionId: string; batchId: string }> = [];

  for (const divName of divisionNames) {
    let division = await prisma.division.findFirst({
      where: { departmentId: dept.id, name: divName, semester: 3 },
    });
    if (!division) {
      division = await prisma.division.create({
        data: {
          departmentId: dept.id,
          name: divName,
          year: 2,
          semester: 3,
          strength: 60,
        },
      });
    }
    divisionMap[divName] = division.id;

    // Create E1, E2, E3 batches
    for (const batchName of batchNames) {
      let batch = await prisma.batch.findFirst({
        where: { divisionId: division.id, name: batchName },
      });
      if (!batch) {
        batch = await prisma.batch.create({
          data: { divisionId: division.id, name: batchName, strength: 20 },
        });
      }
      allBatches.push({
        divName,
        batchName,
        divisionId: division.id,
        batchId: batch.id,
      });
    }
  }
  console.log(`✅ Ensured 7 divisions (A–G) with E1/E2/E3 batches each (21 batches)`);

  // =============================================
  // TEACHING ASSIGNMENTS (S.Y.B.Tech Sem-I, 2026-27 ODD)
  // =============================================
  const theoryAssignments: Array<{
    subjectCode: string;
    hoursPerWeek: number;
    groups: Array<{ divisions: string[]; facultyCode: string }>;
  }> = [
    {
      subjectCode: 'CS301',
      hoursPerWeek: 3,
      groups: [
        { divisions: ['A', 'B', 'C'], facultyCode: 'F001' },
        { divisions: ['D', 'E', 'F', 'G'], facultyCode: 'F002' },
      ],
    },
    {
      subjectCode: 'CS302',
      hoursPerWeek: 2,
      groups: [
        { divisions: ['A', 'B', 'C'], facultyCode: 'F003' },
        { divisions: ['D', 'E', 'F', 'G'], facultyCode: 'F004' },
      ],
    },
    {
      subjectCode: 'CS303',
      hoursPerWeek: 3,
      groups: [
        { divisions: ['A', 'B', 'C'], facultyCode: 'F005' },
        { divisions: ['D', 'E', 'F', 'G'], facultyCode: 'F006' },
      ],
    },
    {
      subjectCode: 'CS304',
      hoursPerWeek: 3,
      groups: [
        { divisions: ['A', 'B', 'C'], facultyCode: 'F007' },
        { divisions: ['D', 'E', 'F', 'G'], facultyCode: 'F008' },
      ],
    },
    {
      subjectCode: 'CS305',
      hoursPerWeek: 2,
      groups: [
        { divisions: ['A', 'B', 'C'], facultyCode: 'F009' },
        { divisions: ['D', 'E', 'F', 'G'], facultyCode: 'F010' },
      ],
    },
    {
      subjectCode: 'CS306',
      hoursPerWeek: 2,
      groups: [
        { divisions: ['A', 'B', 'C', 'D'], facultyCode: 'F011' },
        { divisions: ['E', 'F', 'G'], facultyCode: 'F012' },
      ],
    },
  ];

  let assignmentCount = 0;

  for (const item of theoryAssignments) {
    for (const group of item.groups) {
      for (const divName of group.divisions) {
        await upsertTeachingAssignment({
          termId: term.id,
          facultyId: facultyMap[group.facultyCode],
          subjectId: subjectMap[item.subjectCode],
          divisionId: divisionMap[divName],
          batchId: null,
          hoursPerWeek: item.hoursPerWeek,
        });
        assignmentCount++;
      }
    }
  }

  // Practical assignments across all 21 division×batch combinations (indices 0..20)
  const practicalAllocations: Array<{
    subjectCode: string;
    allocations: Array<{ batchIndex: number; facultyCode: string; hoursPerWeek: number }>;
  }> = [
    {
      // CS301L Data Structures Lab (84h = 21 batches × 4h):
      // F013 [24h = 6×4h], F014 [24h = 6×4h], F015 [24h = 6×4h], F001 [12h = 3×4h]
      subjectCode: 'CS301L',
      allocations: [
        ...Array.from({ length: 6 }, (_, i) => ({ batchIndex: i, facultyCode: 'F013', hoursPerWeek: 4 })),
        ...Array.from({ length: 6 }, (_, i) => ({ batchIndex: 6 + i, facultyCode: 'F014', hoursPerWeek: 4 })),
        ...Array.from({ length: 6 }, (_, i) => ({ batchIndex: 12 + i, facultyCode: 'F015', hoursPerWeek: 4 })),
        ...Array.from({ length: 3 }, (_, i) => ({ batchIndex: 18 + i, facultyCode: 'F001', hoursPerWeek: 4 })),
      ],
    },
    {
      // CS302L PASD Lab (42h = 21 batches × 2h):
      // F003 [18h = 9×2h], F004 [16h = 8×2h], F016 [8h = 4×2h]
      subjectCode: 'CS302L',
      allocations: [
        ...Array.from({ length: 9 }, (_, i) => ({ batchIndex: i, facultyCode: 'F003', hoursPerWeek: 2 })),
        ...Array.from({ length: 8 }, (_, i) => ({ batchIndex: 9 + i, facultyCode: 'F004', hoursPerWeek: 2 })),
        ...Array.from({ length: 4 }, (_, i) => ({ batchIndex: 17 + i, facultyCode: 'F016', hoursPerWeek: 2 })),
      ],
    },
    {
      // CS303L Java Lab (84h across 21 batches):
      // F016 [16h = 4×4h], F017 [24h = 6×4h], F018 [16h = 4×4h],
      // F005 [14h = 3×4h + 1×2h], F012 [14h = 1×2h + 3×4h]
      subjectCode: 'CS303L',
      allocations: [
        ...Array.from({ length: 4 }, (_, i) => ({ batchIndex: i, facultyCode: 'F016', hoursPerWeek: 4 })),
        ...Array.from({ length: 6 }, (_, i) => ({ batchIndex: 4 + i, facultyCode: 'F017', hoursPerWeek: 4 })),
        ...Array.from({ length: 4 }, (_, i) => ({ batchIndex: 10 + i, facultyCode: 'F018', hoursPerWeek: 4 })),
        ...Array.from({ length: 3 }, (_, i) => ({ batchIndex: 14 + i, facultyCode: 'F005', hoursPerWeek: 4 })),
        { batchIndex: 17, facultyCode: 'F005', hoursPerWeek: 2 },
        { batchIndex: 17, facultyCode: 'F012', hoursPerWeek: 2 },
        ...Array.from({ length: 3 }, (_, i) => ({ batchIndex: 18 + i, facultyCode: 'F012', hoursPerWeek: 4 })),
      ],
    },
    {
      // CS304L PBL (42h = 21 batches × 2h):
      // F019 [24h = 12×2h], F020 [18h = 9×2h]
      subjectCode: 'CS304L',
      allocations: [
        ...Array.from({ length: 12 }, (_, i) => ({ batchIndex: i, facultyCode: 'F019', hoursPerWeek: 2 })),
        ...Array.from({ length: 9 }, (_, i) => ({ batchIndex: 12 + i, facultyCode: 'F020', hoursPerWeek: 2 })),
      ],
    },
  ];

  for (const subjectAlloc of practicalAllocations) {
    for (const alloc of subjectAlloc.allocations) {
      const targetBatch = allBatches[alloc.batchIndex];
      await upsertTeachingAssignment({
        termId: term.id,
        facultyId: facultyMap[alloc.facultyCode],
        subjectId: subjectMap[subjectAlloc.subjectCode],
        divisionId: targetBatch.divisionId,
        batchId: targetBatch.batchId,
        hoursPerWeek: alloc.hoursPerWeek,
      });
      assignmentCount++;
    }
  }
  console.log(`✅ Upserted ${assignmentCount} teaching assignments (42 theory + ${assignmentCount - 42} practical)`);

  // =============================================
  // CLASSROOMS & LABS (sample data)
  // =============================================
  const classrooms = [
    { name: 'Room 301', code: 'R301', capacity: 60, building: 'Main', floor: 3 },
    { name: 'Room 302', code: 'R302', capacity: 60, building: 'Main', floor: 3 },
    { name: 'Room 303', code: 'R303', capacity: 60, building: 'Main', floor: 3 },
    { name: 'Room 401', code: 'R401', capacity: 60, building: 'Main', floor: 4 },
    { name: 'Seminar Hall', code: 'SH01', capacity: 120, building: 'Main', floor: 1 },
  ];

  for (const cr of classrooms) {
    await prisma.classroom.upsert({
      where: { code: cr.code },
      update: {},
      create: cr,
    });
  }
  console.log(`✅ Upserted ${classrooms.length} classrooms`);

  const labs = [
    { name: 'Computer Lab 1', code: 'CL01', capacity: 30, building: 'Lab Block', floor: 1, labType: 'Programming' },
    { name: 'Computer Lab 2', code: 'CL02', capacity: 30, building: 'Lab Block', floor: 1, labType: 'Programming' },
    { name: 'Computer Lab 3', code: 'CL03', capacity: 30, building: 'Lab Block', floor: 2, labType: 'Programming' },
    { name: 'Computer Lab 4', code: 'CL04', capacity: 30, building: 'Lab Block', floor: 2, labType: 'Systems' },
    { name: 'Computer Lab 5', code: 'CL05', capacity: 30, building: 'Lab Block', floor: 3, labType: 'Systems' },
  ];

  for (const lab of labs) {
    await prisma.laboratory.upsert({
      where: { code: lab.code },
      update: {},
      create: lab,
    });
  }
  console.log(`✅ Upserted ${labs.length} laboratories`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • 1 Department (CSE)`);
  console.log(`   • 1 Academic Term (2026-27 ODD)`);
  console.log(`   • 3 User accounts (Admin, Coordinator, Faculty)`);
  console.log(`   • ${days.length * slotTemplates.length} TimeSlots (Mon–Sat × 8 slots)`);
  console.log(`   • ${subjects.length} Subjects`);
  console.log(`   • ${facultyData.length} Faculty members`);
  console.log(`   • 7 Divisions (A–G) × 3 Batches (E1–E3) = 21 batches`);
  console.log(`   • ${assignmentCount} Teaching Assignments`);
  console.log(`   • ${classrooms.length} Classrooms`);
  console.log(`   • ${labs.length} Laboratories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
