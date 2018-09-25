import {TestBed} from '@angular/core/testing';

import {GoService} from './go.service';

describe('GoService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: GoService = TestBed.get(GoService);
        expect(service).toBeTruthy();
    });
});
