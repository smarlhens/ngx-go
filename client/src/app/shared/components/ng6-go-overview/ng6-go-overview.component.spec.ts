import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoOverviewComponent} from './ng6-go-overview.component';

describe('Ng6GoOverviewComponent', () => {
    let component: Ng6GoOverviewComponent;
    let fixture: ComponentFixture<Ng6GoOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoOverviewComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
