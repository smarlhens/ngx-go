import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoToolbarComponent} from './ng6-go-toolbar.component';

describe('Ng6GoToolbarComponent', () => {
    let component: Ng6GoToolbarComponent;
    let fixture: ComponentFixture<Ng6GoToolbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoToolbarComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
