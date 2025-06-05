import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed ManyToOne, JoinColumn
// Removed MesoCycle import
// Removed Academy import

@Entity('micro_cycles')
export class MicroCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string; // Focus note for the week

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true }) // Ensuring @Column is here
  endDate?: Date;

  @Column() // Ensuring @Column is here
  mesoCycleId: string;

  @Column() // Ensuring @Column is here
  academyId: string;

  // mesoCycle: MesoCycle relation removed
  // academy?: Academy relation removed

  @Column({ type: 'text', nullable: true })
  instructorCycleNotes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
