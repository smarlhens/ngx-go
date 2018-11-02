import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoNewChallengeDialogComponent} from './ng6-go-new-challenge-dialog.component';

describe('Ng6GoNewChallengeDialogComponent', () => {
    let component: Ng6GoNewChallengeDialogComponent;
    let fixture: ComponentFixture<Ng6GoNewChallengeDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoNewChallengeDialogComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoNewChallengeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
