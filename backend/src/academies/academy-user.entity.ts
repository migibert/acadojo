import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed ManyToOne, JoinColumn

// Removed User import
// Removed Academy import (assuming FunctionalRole and PermissionRole don't need it)

export enum FunctionalRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  HEAD_COACH = 'head_coach',
}

export enum PermissionRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

@Entity('academy_user')
export class AcademyUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  academyId: string;

  // 'user' relation removed
  // 'academy' relation removed

  @Column({
    type: 'enum',
    enum: FunctionalRole,
    array: true,
    default: [FunctionalRole.STUDENT],
  })
  functionalRoles: FunctionalRole[];

  @Column({
    type: 'enum',
    enum: PermissionRole,
    default: PermissionRole.VIEWER,
  })
  permissionRole: PermissionRole;

  @Column({ nullable: true })
  beltRank?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  instructorNotes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
