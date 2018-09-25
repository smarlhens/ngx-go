import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Ng6GoChatComponent} from './ng6-go-chat.component';

describe('Ng6GoChatComponent', () => {
    let component: Ng6GoChatComponent;
    let fixture: ComponentFixture<Ng6GoChatComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Ng6GoChatComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Ng6GoChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
