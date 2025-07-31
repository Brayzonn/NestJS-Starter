import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('spotify_auth_states')
export class SpotifyAuthState {
  @PrimaryColumn()
  state: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
