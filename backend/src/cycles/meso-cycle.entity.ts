import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed ManyToOne, OneToMany, JoinColumn
// Removed MacroCycle import
// Removed MicroCycle import
// Removed Academy import

@Entity('meso_cycles')
export class MesoCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true }) // Ensuring @Column is here
  endDate?: Date;

  @Column() // Ensuring @Column is here
  macroCycleId: string;

  @Column() // Ensuring @Column is here
  academyId: string;

  // macroCycle: MacroCycle relation removed
  // academy?: Academy relation removed
  // microCycles: MicroCycle[] relation removed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
