import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {MatSidenavModule} from '@angular/material/sidenav';
import {Ng6GoNavComponent} from './ng6-go-nav.component';

describe('Ng6GoNavComponent', () => {
    let component: Ng6GoNavComponent;
    let fixture: ComponentFixture<Ng6GoNavComponent>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [MatSidenavModule],
            declarations: [Ng6GoNavComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(Ng6GoNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should compile', () => {
        expect(component).toBeTruthy();
    });
});
