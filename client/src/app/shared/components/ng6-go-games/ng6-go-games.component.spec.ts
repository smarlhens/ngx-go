import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoGamesComponent} from './ng6-go-games.component';

describe('Ng6GoGamesComponent', () => {
    let component: Ng6GoGamesComponent;
    let fixture: ComponentFixture<Ng6GoGamesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoGamesComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoGamesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
