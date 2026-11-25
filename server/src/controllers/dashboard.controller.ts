import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      facultyCount,
      subjectCount,
      divisionCount,
      batchCount,
      classroomCount,
      labCount,
      departmentCount,
      termCount,
    ] = await Promise.all([
      prisma.faculty.count({ where: { isActive: true } }),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.division.count({ where: { isActive: true } }),
      prisma.batch.count({ where: { isActive: true } }),
      prisma.classroom.count({ where: { isActive: true } }),
      prisma.laboratory.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.academicTerm.count({ where: { isCurrent: true } }),
    ]);

    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
      select: { year: true, semester: true },
    });

    res.json({
      success: true,
      data: {
        summary: {
          faculty: facultyCount,
          subjects: subjectCount,
          divisions: divisionCount,
          batches: batchCount,
          classrooms: classroomCount,
          laboratories: labCount,
          departments: departmentCount,
          currentTerms: termCount,
        },
        currentTerm,
        institution: {
          name: 'Zeal College of Engineering and Research, Pune',
          department: 'Department of Computer Engineering',
          code: 'CSE',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
