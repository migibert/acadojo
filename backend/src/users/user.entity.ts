import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed OneToMany
// Removed AcademyUser import

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false, nullable: true })
  passwordHash?: string;

  // academyConnections: AcademyUser[] property removed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
