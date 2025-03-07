import { Test, TestingModule } from '@nestjs/testing';
import { UserSocketService } from './user-socket.service';

describe('UserSocketService', () => {
  let service: UserSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSocketService],
    }).compile();

    service = module.get<UserSocketService>(UserSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
