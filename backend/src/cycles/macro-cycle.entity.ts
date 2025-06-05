import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'; // Removed ManyToOne, OneToMany, JoinColumn
// Removed Academy import
// Removed MesoCycle import

@Entity('macro_cycles')
export class MacroCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column()
  academyId: string;

  // academy?: Academy relation removed
  // mesoCycles: MesoCycle[] relation removed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
