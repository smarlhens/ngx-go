import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoBoardComponent} from './ng6-go-board.component';

describe('Ng6GoBoardComponent', () => {
    let component: Ng6GoBoardComponent;
    let fixture: ComponentFixture<Ng6GoBoardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoBoardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
