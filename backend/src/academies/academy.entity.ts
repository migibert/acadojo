import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed OneToMany
// Removed AcademyUser import
// Removed MacroCycle import

@Entity('academies')
export class Academy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  // members: AcademyUser[] property removed
  // macroCycles: MacroCycle[] property removed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
