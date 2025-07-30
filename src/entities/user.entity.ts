import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 320 })
  email!: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  username!: string;

  @Column({ length: 72 })
  password!: string;

  @Column({
    type: 'enum',
    enum: ['spotify', 'apple_music', 'youtube_music'] as const,
  })
  streamingService!: 'spotify' | 'apple_music' | 'youtube_music';

  @Column({ type: 'int', default: 0 })
  visits!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
