import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoSearchComponent} from './ng6-go-search.component';

describe('Ng6GoSearchComponent', () => {
    let component: Ng6GoSearchComponent;
    let fixture: ComponentFixture<Ng6GoSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoSearchComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
