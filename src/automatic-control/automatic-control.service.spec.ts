import { Test, TestingModule } from '@nestjs/testing';
import { AutomaticControlService } from './automatic-control.service';

describe('AutomaticControlService', () => {
  let service: AutomaticControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomaticControlService],
    }).compile();

    service = module.get<AutomaticControlService>(AutomaticControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
