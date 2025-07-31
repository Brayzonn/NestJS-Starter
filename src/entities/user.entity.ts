import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum streamService {
  SPOTIFY = 'spotify',
  APPLE_MUSIC = 'apple_music',
  YOUTUBE_MUSIC = 'youtube_music',
}

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
    enum: streamService,
    default: streamService.SPOTIFY,
  })
  streamingService!: streamService;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'int', default: 0 })
  visits!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
