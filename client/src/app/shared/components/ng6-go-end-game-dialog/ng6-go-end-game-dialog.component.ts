import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";

@Component({
    selector: 'ng6-go-end-game-dialog',
    templateUrl: './ng6-go-end-game-dialog.component.html'
})
export class Ng6GoEndGameDialogComponent implements OnInit {

    public secondsLeft: number = 10;
    private intervalId: any;

    constructor(
        public dialogRef: MatDialogRef<Ng6GoEndGameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private router: Router) {
    }

    ngOnInit(): void {
        this.secondsLeft = 10;
        this.dialogRef.afterOpen().subscribe(() => {
            this.intervalId = setInterval(() => {
                if (this.secondsLeft >= 1) {
                    --this.secondsLeft;
                } else {
                    this.home();
                }
            }, 1000);
        });
    }

    public home(): void {
        clearInterval(this.intervalId);
        this.dialogRef.close();
        this.router.navigate(['/']);
    }

}
