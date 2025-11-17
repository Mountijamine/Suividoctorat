import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'public-navbar',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './public-navbar.html'
})
export class PublicNavbarComponent {}

