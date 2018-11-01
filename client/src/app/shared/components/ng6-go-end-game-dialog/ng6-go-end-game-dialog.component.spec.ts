import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoEndGameDialogComponent} from './ng6-go-end-game-dialog.component';

describe('Ng6GoEndGameDialogComponent', () => {
    let component: Ng6GoEndGameDialogComponent;
    let fixture: ComponentFixture<Ng6GoEndGameDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoEndGameDialogComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoEndGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
