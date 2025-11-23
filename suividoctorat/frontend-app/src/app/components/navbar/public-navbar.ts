import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'public-navbar',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './public-navbar.html'
})
export class PublicNavbarComponent implements OnInit {
	darkMode = signal(false);
	language = signal('en');

	ngOnInit() {
		try {
			const theme = localStorage.getItem('theme');
			this.darkMode.set(theme === 'dark');
			if (theme === 'dark') document.documentElement.classList.add('dark');
			const lang = localStorage.getItem('lang') || 'en';
			this.language.set(lang);
		} catch (e) {}
	}

	toggleTheme() {
		const isDark = !this.darkMode();
		this.darkMode.set(isDark);
		try {
			document.documentElement.classList.toggle('dark', isDark);
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		} catch (e) {}
	}

	changeLanguage() {
		const newLang = this.language() === 'en' ? 'fr' : 'en';
		this.language.set(newLang);
		try {
			localStorage.setItem('lang', newLang);
		} catch (e) {}
	}
}

